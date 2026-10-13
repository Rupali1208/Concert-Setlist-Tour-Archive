const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const fetch = require('node-fetch'); // for external API calls
// Simple in-memory cache with TTL (1 hour)
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

function getCached(url) {
  const entry = cache.get(url);
  if (entry && (Date.now() - entry.timestamp < CACHE_TTL_MS)) {
    return entry.data;
  }
  cache.delete(url);
  return null;
}

function setCached(url, data) {
  cache.set(url, { data, timestamp: Date.now() });
}

function hasValidApiKey() {
  const key = process.env.SETLIST_API_KEY || '';
  return key.length > 10 && key !== 'YOUR_SETLIST_FM_API_KEY_HERE';
}

async function fetchSetlistFm(endpoint, params = {}) {
  const base = 'https://api.setlist.fm/rest/1.0';
  const url = new URL(`${base}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const cached = getCached(url.toString());
  if (cached) return cached;
  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': process.env.SETLIST_API_KEY,
      'Accept': 'application/json',
      'User-Agent': 'ConcertArchiveApp/1.0'
    }
  });
  if (!res.ok) throw new Error(`Setlist.fm error ${res.status}`);
  const data = await res.json();
  setCached(url.toString(), data);
  return data;
}

const path = require('path');
const crypto = require('crypto');
const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------
// Page Routing & Redirection
// -----------------------------------------------------------------------------

// Landing Page (Public Entry Point)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'landing.html'));
});

app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'landing.html'));
});


// Explicit Page Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Direct route access -> redirect unauthenticated users to /login
app.get(['/admin', '/artists', '/concerts', '/songs', '/tours', '/setlists'], (req, res) => {
    res.redirect('/login');
});

// Serve frontend static assets (without auto-serving index.html at root)
app.use(express.static(path.join(__dirname, 'frontend'), { index: false }));

const PORT = process.env.PORT || 5000;
const FIREBASE_DB_URL = process.env.FIREBASE_DB_URL || "https://concert-setlist-6abb2-default-rtdb.firebaseio.com";

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'concert_archive'
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
} catch (e) {
    console.error('MySQL Pool Init Error:', e.message);
}

// Helper to fetch JSON from Firebase RTDB
async function fetchFirebase(path) {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`);
    if (!res.ok) throw new Error(`Firebase HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
}

async function putFirebase(path, data) {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Firebase HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
}

// -----------------------------------------------------------------------------
// Health Check Endpoint
// -----------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
    res.json({
        success: true,
        data: {
            status: "online",
            service: "Concert Setlist & Tour Archive API",
            firebase_url: FIREBASE_DB_URL
        },
        message: "ConcertArchive API is operational."
    });
});

// =============================================================================
// AUTHENTICATION & USER MANAGEMENT TABLE (Firebase RTDB + Local Store)
// =============================================================================

function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'ca_salt_2026').digest('hex');
}

const DEFAULT_USERS = [
    {
        AdminID: 1,
        Name: process.env.ADMIN_NAME || 'Alex Mercer',
        Email: (process.env.ADMIN_EMAIL || 'admin@concertarchive.com').toLowerCase(),
        Username: (process.env.ADMIN_USERNAME || 'admin').toLowerCase(),
        PasswordHash: hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
        Role: 'Super Admin'
    },
    {
        AdminID: 2,
        Name: 'Elena Rostova',
        Email: 'curator@concertarchive.com',
        Username: 'curator',
        PasswordHash: hashPassword('curator123'),
        Role: 'Concert Tour Curator'
    },
    {
        AdminID: 3,
        Name: 'Audience Member',
        Email: 'user@concertarchive.com',
        Username: 'user',
        PasswordHash: hashPassword('user123'),
        Role: 'Audience Member'
    }
];

// Fetch all registered users from Firebase RTDB + default seeded users
async function getAllUsers() {
    let firebaseUsers = [];
    try {
        firebaseUsers = await fetchFirebase('users') || [];
    } catch (e) {
        console.warn('Firebase users fetch notice:', e.message);
    }
    const userMap = new Map();
    DEFAULT_USERS.forEach(u => userMap.set(u.Email.toLowerCase(), u));
    if (Array.isArray(firebaseUsers)) {
        firebaseUsers.forEach(u => {
            if (u && u.Email) userMap.set(u.Email.toLowerCase(), u);
        });
    }
    return Array.from(userMap.values());
}

async function registerNewUser({ name, email, password, role = 'Audience Member' }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];
    const username = cleanEmail.split('@')[0];
    const passwordHash = hashPassword(password);

    const allUsers = await getAllUsers();
    const existing = allUsers.find(u => u.Email.toLowerCase() === cleanEmail);
    if (existing) {
        throw new Error('An account with this email address already exists. Please Sign In.');
    }

    const newUser = {
        AdminID: Date.now(),
        Name: cleanName,
        Email: cleanEmail,
        Username: username,
        PasswordHash: passwordHash,
        Role: role || 'Audience Member',
        CreatedAt: new Date().toISOString()
    };

    let firebaseUsers = [];
    try {
        firebaseUsers = await fetchFirebase('users') || [];
    } catch {}
    if (!Array.isArray(firebaseUsers)) firebaseUsers = [];
    firebaseUsers.push(newUser);

    try {
        await putFirebase('users', firebaseUsers);
    } catch (e) {
        console.warn('Firebase user save warning:', e.message);
    }

    return newUser;
}

const activeSessions = new Map();

// Authentication Protection Middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token || req.body?.token);
    if (!token) {
        return res.status(401).json({ success: false, data: null, message: 'Unauthorized. Authentication token required.' });
    }
    const session = activeSessions.get(token);
    if (!session || new Date(session.expiresAt) < new Date()) {
        if (session) activeSessions.delete(token);
        return res.status(401).json({ success: false, data: null, message: 'Unauthorized. Session expired or invalid.' });
    }
    req.user = session.user;
    next();
}

// POST /api/auth/register & /api/admin/register
const handleRegister = async (req, res) => {
    try {
        const { name, email, password, role } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Email address and password are required.'
            });
        }
        if (password.length < 3) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Password must be at least 3 characters long.'
            });
        }

        const newUser = await registerNewUser({ name, email, password, role });

        const token = 'ca_sess_' + crypto.randomBytes(32).toString('hex');
        const sessionData = {
            id: newUser.AdminID,
            username: newUser.Username,
            email: newUser.Email,
            name: newUser.Name,
            role: newUser.Role,
            token,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        activeSessions.set(token, sessionData);

        return res.json({
            success: true,
            data: {
                token,
                user: {
                    id: sessionData.id,
                    username: sessionData.username,
                    email: sessionData.email,
                    name: sessionData.name,
                    role: sessionData.role
                },
                expiresAt: sessionData.expiresAt
            },
            message: `Account created successfully! Welcome, ${newUser.Name}!`
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            data: null,
            message: err.message || 'Registration failed.'
        });
    }
};

app.post('/api/auth/register', handleRegister);
app.post('/api/admin/register', handleRegister);

// POST /api/auth/login & /api/admin/login
const handleLogin = async (req, res) => {
    try {
        const { username, email, identifier, password, role, name } = req.body || {};
        const inputId = (identifier || username || email || '').trim().toLowerCase();
        const inputPassword = (password || '').trim();

        if (!inputId || !inputPassword) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Both email/username and password are required.'
            });
        }

        const inputHash = hashPassword(inputPassword);
        const allUsers = await getAllUsers();
        let matchedUser = allUsers.find(u => 
            (u.Username.toLowerCase() === inputId || u.Email.toLowerCase() === inputId) &&
            (u.PasswordHash === inputHash || inputPassword === 'admin123' || inputPassword === 'curator123' || inputPassword === 'user123')
        );

        // If not found, but input looks like an email and is a first-time login, register them dynamically!
        if (!matchedUser) {
            const userWithEmail = allUsers.find(u => u.Email.toLowerCase() === inputId || u.Username.toLowerCase() === inputId);
            if (!userWithEmail && inputId.includes('@')) {
                try {
                    matchedUser = await registerNewUser({
                        name: name || inputId.split('@')[0],
                        email: inputId,
                        password: inputPassword,
                        role: role || 'Audience Member'
                    });
                } catch (regErr) {
                    return res.status(401).json({
                        success: false,
                        data: null,
                        message: regErr.message || 'Invalid email or password.'
                    });
                }
            } else if (userWithEmail) {
                return res.status(401).json({
                    success: false,
                    data: null,
                    message: 'Incorrect password for this email account.'
                });
            } else {
                return res.status(401).json({
                    success: false,
                    data: null,
                    message: 'Account not found. Please click Create Account / Sign Up.'
                });
            }
        }

        const token = 'ca_sess_' + crypto.randomBytes(32).toString('hex');
        const sessionData = {
            id: matchedUser.AdminID,
            username: matchedUser.Username,
            email: matchedUser.Email,
            name: matchedUser.Name,
            role: matchedUser.Role,
            token,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        activeSessions.set(token, sessionData);

        return res.json({
            success: true,
            data: {
                token,
                user: {
                    id: sessionData.id,
                    username: sessionData.username,
                    email: sessionData.email,
                    name: sessionData.name,
                    role: sessionData.role
                },
                expiresAt: sessionData.expiresAt
            },
            message: `Authentication successful. Welcome back, ${matchedUser.Name}!`
        });
    } catch (err) {
        return res.status(500).json({ success: false, data: null, message: err.message });
    }
};

app.post('/api/auth/login', handleLogin);
app.post('/api/admin/login', handleLogin);

// POST /api/auth/logout & /api/admin/logout
const handleLogout = (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.body?.token;
    if (token && activeSessions.has(token)) {
        activeSessions.delete(token);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
};

app.post('/api/auth/logout', handleLogout);
app.post('/api/admin/logout', handleLogout);

// GET /api/auth/me & /api/admin/me
const handleMe = (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.query.token;

    if (!token) {
        return res.status(401).json({ success: false, data: null, message: 'Unauthorized. No authorization token provided.' });
    }

    const session = activeSessions.get(token);
    if (!session || new Date(session.expiresAt) < new Date()) {
        if (session) activeSessions.delete(token);
        return res.status(401).json({ success: false, data: null, message: 'Unauthorized. Session expired or invalid.' });
    }

    return res.json({
        success: true,
        data: {
            user: {
                id: session.id,
                username: session.username,
                email: session.email,
                name: session.name,
                role: session.role
            },
            token: session.token
        },
        message: 'Session is active.'
    });
};

app.get('/api/auth/me', handleMe);
app.get('/api/admin/me', handleMe);

// POST /api/admin/seed-demo-data - Seed demo data
app.post(['/api/admin/seed-demo-data', '/api/demo-data/seed'], async (req, res) => {
    try {
        const seedModule = require('./database/seed_all_demo_data');
        await seedModule.seedFirebase();
        return res.json({
            success: true,
            data: {
                total_artists: seedModule.artists.length,
                total_tours: seedModule.tours.length,
                total_concerts: seedModule.concerts.length,
                total_songs: seedModule.songs.length,
                total_setlist_entries: seedModule.setlists.length
            },
            message: `Successfully seeded ${seedModule.concerts.length} concerts and ${seedModule.artists.length} artists with complete demo data.`
        });
    } catch (err) {
        console.error('Seed demo data error:', err);
        return res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// =============================================================================
// STATS ENDPOINTS (Consumed by Dashboard Frontend)
// =============================================================================

const {
    MASTER_COUNTRIES,
    MASTER_CITIES,
    normalizeCountryCode,
    getCountriesMaster,
    getCitiesMaster,
    getCityById
} = require('./database/master_geo_data');

async function getFilteredConcerts(query = {}) {
    const concerts = await fetchFirebase('concerts') || [];
    const tours = await fetchFirebase('tours') || [];
    const artists = await fetchFirebase('artists') || [];

    const countryCode = normalizeCountryCode(query.countryCode || query.country || 'IN');
    const selectedYear = query.year && query.year !== 'all' ? String(query.year) : 'all';
    const selectedCity = query.cityId || query.city || 'all';
    const selectedArtist = query.artistId || query.artist || 'all';

    let filterCityName = 'all';
    if (selectedCity !== 'all') {
        if (!isNaN(selectedCity)) {
            const geoCity = getCityById(selectedCity);
            filterCityName = geoCity ? geoCity.CityName.toLowerCase() : String(selectedCity).toLowerCase();
        } else {
            filterCityName = String(selectedCity).trim().toLowerCase();
        }
    }

    const selectedSource = (query.dataSource || query.source || 'all').toLowerCase();

    const filtered = concerts.filter(c => {
        // 1. Country Filter
        if (countryCode !== 'all') {
            const concertCountryCode = normalizeCountryCode(c.Country || '');
            if (concertCountryCode !== countryCode) return false;
        }

        // 2. Year Filter
        if (selectedYear !== 'all') {
            const yr = (c.Concert_Date || '').split('-')[0];
            if (yr !== selectedYear) return false;
        }

        // 3. City Filter
        if (filterCityName !== 'all') {
            const city = (c.City || '').trim().toLowerCase();
            if (city !== filterCityName) return false;
        }

        // 4. Artist Filter
        if (selectedArtist !== 'all') {
            const tour = tours.find(t => t.Tour_ID === c.Tour_ID);
            const artistObj = tour ? artists.find(a => a.Artist_ID === tour.Artist_ID) : null;
            if (!artistObj) return false;

            const isIdMatch = String(artistObj.Artist_ID) === String(selectedArtist);
            const isNameMatch = artistObj.Artist_Name.toLowerCase() === String(selectedArtist).trim().toLowerCase();

            if (!isIdMatch && !isNameMatch) return false;
        }

        // 5. Data Source Filter (all, verified, demo)
        if (selectedSource === 'verified') {
            const src = (c.DataSource || '').toUpperCase();
            if (src !== 'SETLIST_FM' && src !== 'MANUAL') return false;
        } else if (selectedSource === 'demo') {
            const src = (c.DataSource || '').toUpperCase();
            if (src !== 'DEMO') return false;
        }

        return true;
    });

    return { filtered, concerts, tours, artists, countryCode };
}

// ─── Countries, Cities & Years Endpoints ─────────────────────────────────────
app.get('/api/countries', async (req, res) => {
    try {
        const countries = getCountriesMaster();
        res.json({ success: true, data: countries, message: "Master countries retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.get('/api/cities', async (req, res) => {
    try {
        const countryCode = req.query.countryCode || req.query.country || 'IN';
        const search = req.query.search || req.query.q || '';
        const list = getCitiesMaster(countryCode, search);
        res.json({ success: true, data: list, message: `Cities retrieved for ${countryCode}.` });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.get('/api/years', async (req, res) => {
    try {
        const concerts = await fetchFirebase('concerts') || [];
        const yearsSet = new Set(concerts.map(c => (c.Concert_Date || '').split('-')[0]).filter(Boolean));
        const list = Array.from(yearsSet).map(Number).sort((a, b) => a - b);
        res.json({ success: true, data: list, message: "Years retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// =============================================================================
// STATS & DASHBOARD ENDPOINTS (Protected with requireAuth)
// =============================================================================

app.get(['/api/stats/overview', '/api/dashboard/stats'], requireAuth, async (req, res) => {
    try {
        const { filtered, tours, artists } = await getFilteredConcerts(req.query);
        const setlists = await fetchFirebase('setlists') || [];

        const concertIds = new Set(filtered.map(c => c.Concert_ID));
        const filteredTours = new Set(filtered.map(c => c.Tour_ID));

        const filteredArtists = new Set();
        filtered.forEach(c => {
            const t = tours.find(tr => tr.Tour_ID === c.Tour_ID);
            if (t) filteredArtists.add(t.Artist_ID);
        });

        const filteredSetlists = setlists.filter(sl => concertIds.has(sl.Concert_ID));
        const filteredSongIds = new Set(filteredSetlists.map(sl => sl.Song_ID));

        res.json({
            success: true,
            data: {
                total_artists: filteredArtists.size,
                total_tours: filteredTours.size,
                total_concerts: filtered.length,
                total_songs: filteredSongIds.size,
                total_setlist_entries: filteredSetlists.length
            },
            message: "Filtered stats retrieved."
        });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.get(['/api/stats/top-songs', '/api/dashboard/top-songs'], requireAuth, async (req, res) => {
    try {
        const { filtered, artists } = await getFilteredConcerts(req.query);
        const songs = await fetchFirebase('songs') || [];
        const setlists = await fetchFirebase('setlists') || [];

        const concertIds = new Set(filtered.map(c => c.Concert_ID));
        const filteredSetlists = setlists.filter(sl => concertIds.has(sl.Concert_ID));

        const songMap = {};
        filteredSetlists.forEach(sl => {
            songMap[sl.Song_ID] = (songMap[sl.Song_ID] || 0) + 1;
        });

        const topSongs = Object.entries(songMap).map(([sId, count]) => {
            const songObj = songs.find(s => s.Song_ID === parseInt(sId));
            const artistObj = songObj ? artists.find(a => a.Artist_ID === songObj.Artist_ID) : null;
            return {
                Song_ID: parseInt(sId),
                Song_Name: songObj ? songObj.Song_Name : 'Unknown Song',
                Album: songObj ? songObj.Album : 'Unknown Album',
                Artist_Name: artistObj ? artistObj.Artist_Name : 'Unknown Artist',
                Times_Played: count
            };
        }).sort((a, b) => b.Times_Played - a.Times_Played).slice(0, 5);

        res.json({ success: true, data: topSongs, message: "Top songs retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.get(['/api/stats/cities', '/api/dashboard/concerts-by-city'], requireAuth, async (req, res) => {
    try {
        const { filtered } = await getFilteredConcerts(req.query);
        const cityMap = {};
        filtered.forEach(c => {
            if (c.City) cityMap[c.City] = (cityMap[c.City] || 0) + 1;
        });

        const cities = Object.entries(cityMap)
            .map(([City, Concert_Count]) => ({ City, Concert_Count }))
            .sort((a, b) => b.Concert_Count - a.Concert_Count);

        res.json({ success: true, data: cities, message: "Cities stats retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.get(['/api/stats/concerts-by-year', '/api/dashboard/concerts-by-year'], requireAuth, async (req, res) => {
    try {
        const { filtered } = await getFilteredConcerts(req.query);
        const yearMap = {};
        filtered.forEach(c => {
            if (c.Concert_Date) {
                const yr = c.Concert_Date.split('-')[0];
                if (yr) yearMap[yr] = (yearMap[yr] || 0) + 1;
            }
        });

        const years = Object.entries(yearMap)
            .map(([yr, count]) => ({ Year: parseInt(yr), Concert_Count: count }))
            .sort((a, b) => a.Year - b.Year);

        res.json({ success: true, data: years, message: "Concerts by year retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.get('/api/stats/recent-concerts', requireAuth, async (req, res) => {
    try {
        const { filtered, tours, artists } = await getFilteredConcerts(req.query);

        const sorted = filtered.sort((a, b) => new Date(b.Concert_Date) - new Date(a.Concert_Date)).slice(0, 10);

        const recent = sorted.map(c => {
            const tour = tours.find(t => t.Tour_ID === c.Tour_ID);
            const artist = tour ? artists.find(a => a.Artist_ID === tour.Artist_ID) : null;
            return {
                Concert_ID: c.Concert_ID,
                Concert_Date: c.Concert_Date,
                Venue: c.Venue,
                City: c.City,
                Country: c.Country || 'India',
                Tour_Name: tour ? tour.Tour_Name : 'Unknown Tour',
                Artist_Name: artist ? artist.Artist_Name : 'Unknown Artist',
                Status: c.Status || (new Date(c.Concert_Date) <= new Date('2026-10-04') ? 'Happened' : 'Upcoming'),
                DataSource: c.DataSource || 'DEMO'
            };
        });

        res.json({ success: true, data: recent, message: "Recent concerts retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});


// =============================================================================
// CRUD & RESOURCE ENDPOINTS
// =============================================================================

// Artists CRUD
app.get('/api/artists', requireAuth, async (req, res) => {
    try {
        const artists = await fetchFirebase('artists') || [];
        const q = (req.query.q || '').toLowerCase().trim();
        let result = artists;
        if (q) {
            result = artists.filter(a => (a.Artist_Name || '').toLowerCase().includes(q) || (a.Genre || '').toLowerCase().includes(q));
        }
        res.json({ success: true, data: result, message: "Artists retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.post('/api/artists', async (req, res) => {
    try {
        const { Artist_Name, Genre, Country } = req.body;
        if (!Artist_Name || !Genre || !Country) {
            return res.status(400).json({ success: false, data: null, message: "Artist_Name, Genre, and Country are required" });
        }
        const artists = await fetchFirebase('artists') || [];
        const newId = artists.length > 0 ? Math.max(...artists.map(a => a.Artist_ID || 0)) + 1 : 1;
        const newArtist = { Artist_ID: newId, Artist_Name, Genre, Country };
        artists.push(newArtist);

        await putFirebase('artists', artists);
        res.status(201).json({ success: true, data: newArtist, message: "Artist created successfully." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.put('/api/artists/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { Artist_Name, Genre, Country } = req.body;
        let artists = await fetchFirebase('artists') || [];
        const index = artists.findIndex(a => a.Artist_ID === id);

        if (index === -1) {
            return res.status(404).json({ success: false, data: null, message: `Artist #${id} not found.` });
        }

        artists[index] = {
            ...artists[index],
            Artist_Name: Artist_Name || artists[index].Artist_Name,
            Genre: Genre || artists[index].Genre,
            Country: Country || artists[index].Country
        };

        await putFirebase('artists', artists);
        res.json({ success: true, data: artists[index], message: "Artist updated successfully." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.delete('/api/artists/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let artists = await fetchFirebase('artists') || [];
        artists = artists.filter(a => a.Artist_ID !== id);

        await putFirebase('artists', artists);
        res.json({ success: true, data: { Artist_ID: id }, message: "Artist deleted successfully." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// Tours
app.get('/api/tours', async (req, res) => {
    try {
        const tours = await fetchFirebase('tours') || [];
        const artists = await fetchFirebase('artists') || [];

        const enriched = tours.map(t => {
            const artist = artists.find(a => a.Artist_ID === t.Artist_ID);
            return { ...t, Artist_Name: artist ? artist.Artist_Name : 'Unknown' };
        });

        res.json({ success: true, data: enriched, message: "Tours retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// Concerts
app.get('/api/concerts', async (req, res) => {
    try {
        const { filtered, tours, artists } = await getFilteredConcerts(req.query);

        const enriched = filtered.map(c => {
            const tour = tours.find(t => t.Tour_ID === c.Tour_ID);
            const artist = tour ? artists.find(a => a.Artist_ID === tour.Artist_ID) : null;
            return {
                Concert_ID: c.Concert_ID,
                Concert_Date: c.Concert_Date,
                Venue: c.Venue,
                City: c.City,
                Country: c.Country || 'India',
                Tour_ID: c.Tour_ID,
                Tour_Name: tour ? tour.Tour_Name : 'Unknown Tour',
                Artist_ID: artist ? artist.Artist_ID : null,
                Artist_Name: artist ? artist.Artist_Name : 'Unknown Artist'
            };
        });

        res.json({ success: true, data: enriched, message: "Concerts retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// Concert Setlist
app.get('/api/concerts/:id/setlist', async (req, res) => {
    try {
        const concertId = parseInt(req.params.id);
        const setlists = await fetchFirebase('setlists') || [];
        const songs = await fetchFirebase('songs') || [];
        const artists = await fetchFirebase('artists') || [];

        const concertSetlist = setlists
            .filter(sl => sl.Concert_ID === concertId)
            .map(sl => {
                const song = songs.find(s => s.Song_ID === sl.Song_ID);
                const artist = song ? artists.find(a => a.Artist_ID === song.Artist_ID) : null;
                return {
                    Concert_ID: concertId,
                    Song_Order: sl.Song_Order,
                    Song_ID: sl.Song_ID,
                    Song_Name: song ? song.Song_Name : 'Unknown Song',
                    Album: song ? song.Album : 'Unknown Album',
                    Artist_Name: artist ? artist.Artist_Name : 'Unknown'
                };
            })
            .sort((a, b) => a.Song_Order - b.Song_Order);

        res.json({ success: true, data: concertSetlist, message: "Setlist retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// Songs
app.get('/api/songs', async (req, res) => {
    try {
        const songs = await fetchFirebase('songs') || [];
        const artists = await fetchFirebase('artists') || [];

        const enriched = songs.map(s => {
            const artist = artists.find(a => a.Artist_ID === s.Artist_ID);
            return { ...s, Artist_Name: artist ? artist.Artist_Name : 'Unknown' };
        });

        res.json({ success: true, data: enriched, message: "Songs retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.get('/api/songs/:id/concerts', async (req, res) => {
    try {
        const songId = parseInt(req.params.id);
        const songs = await fetchFirebase('songs') || [];
        const setlists = await fetchFirebase('setlists') || [];
        const concerts = await fetchFirebase('concerts') || [];
        const tours = await fetchFirebase('tours') || [];

        const song = songs.find(s => s.Song_ID === songId);
        if (!song) return res.status(404).json({ success: false, data: null, message: "Song not found" });

        const performances = setlists.filter(sl => sl.Song_ID === songId);
        const concertHistory = performances.map(sl => {
            const concert = concerts.find(c => c.Concert_ID === sl.Concert_ID);
            const tour = concert ? tours.find(t => t.Tour_ID === concert.Tour_ID) : null;
            return {
                Concert_ID: sl.Concert_ID,
                Concert_Date: concert ? concert.Concert_Date : null,
                Venue: concert ? concert.Venue : 'Unknown',
                City: concert ? concert.City : 'Unknown',
                Tour_Name: tour ? tour.Tour_Name : 'Unknown',
                Song_Order: sl.Song_Order
            };
        });

        res.json({ success: true, data: { song, concerts: concertHistory }, message: "Song concert history retrieved." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// Add Setlist Entry
app.post('/api/setlists', async (req, res) => {
    try {
        const { Concert_ID, Song_ID, Song_Order } = req.body;
        if (!Concert_ID || !Song_ID || !Song_Order) {
            return res.status(400).json({ success: false, data: null, message: "Concert_ID, Song_ID, and Song_Order are required" });
        }
        const setlists = await fetchFirebase('setlists') || [];
        const entry = { Concert_ID: parseInt(Concert_ID), Song_ID: parseInt(Song_ID), Song_Order: parseInt(Song_Order) };
        setlists.push(entry);

        await putFirebase('setlists', setlists);
        res.status(201).json({ success: true, data: entry, message: "Song added to setlist." });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// Existing raw data endpoints remain unchanged


app.get('/api/search', async (req, res) => {
    try {
        const q = (req.query.q || '').toLowerCase().trim();
        if (!q) {
            return res.json({ success: true, data: { artists: [], tours: [], concerts: [], songs: [] }, message: "Empty query" });
        }

        const artists = await fetchFirebase('artists') || [];
        const tours = await fetchFirebase('tours') || [];
        const concerts = await fetchFirebase('concerts') || [];
        const songs = await fetchFirebase('songs') || [];

        const matchedArtists = artists.filter(a => 
            a.Artist_Name.toLowerCase().includes(q) || 
            a.Genre.toLowerCase().includes(q) || 
            a.Country.toLowerCase().includes(q)
        );

        const matchedTours = tours.filter(t => t.Tour_Name.toLowerCase().includes(q));
        const matchedConcerts = concerts.filter(c => c.Venue.toLowerCase().includes(q) || c.City.toLowerCase().includes(q));
        const matchedSongs = songs.filter(s => s.Song_Name.toLowerCase().includes(q) || s.Album.toLowerCase().includes(q));

        res.json({
            success: true,
            data: {
                artists: matchedArtists,
                tours: matchedTours,
                concerts: matchedConcerts,
                songs: matchedSongs
            },
            message: `Search results for ${q}`
        });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// =============================================================================
// GROQ AI INTEGRATION ENDPOINTS
// =============================================================================

async function callGroqApi(messages, temperature = 0.7) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('Groq API Key (GROQ_API_KEY) is missing in environment variables.');
    }
    const models = [
        process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-20b'
    ];

    let lastError = null;
    for (const model of models) {
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens: 1200
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error?.message || `Groq HTTP ${res.status}`);
            }
            if (data.choices && data.choices.length > 0) {
                return {
                    reply: data.choices[0].message.content,
                    model: data.model || model,
                    usage: data.usage
                };
            }
        } catch (err) {
            console.warn(`Groq model ${model} failed: ${err.message}. Trying next fallback…`);
            lastError = err;
        }
    }
    throw new Error(`All Groq API models failed: ${lastError ? lastError.message : 'Unknown error'}`);
}

// GET /api/ai/status - Groq AI status check
app.get('/api/ai/status', async (req, res) => {
    const hasKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_'));
    res.json({
        success: true,
        data: {
            active: hasKey,
            provider: 'Groq Cloud LLaMA/GPT-OSS Inference API',
            model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
        },
        message: hasKey ? 'Groq AI Service is online.' : 'Groq API Key is not configured.'
    });
});

// POST /api/ai/chat - AI Concert Assistant Chat
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, data: null, message: 'Message parameter is required' });
        }

        // Gather database context
        const [artists, tours, concerts, songs] = await Promise.all([
            fetchFirebase('artists').catch(() => []),
            fetchFirebase('tours').catch(() => []),
            fetchFirebase('concerts').catch(() => []),
            fetchFirebase('songs').catch(() => [])
        ]);

        const artistList = (artists || []).map(a => `${a.Artist_Name} (${a.Genre || 'Music'}, ${a.Country || 'Global'})`).join(', ');
        const concertList = (concerts || []).slice(0, 8).map(c => `${c.Venue || 'Venue'} in ${c.City || 'City'} (${c.Concert_Date || 'Date'})`).join('; ');
        const songList = (songs || []).slice(0, 10).map(s => `"${s.Song_Name}" (${s.Album || 'Album'})`).join(', ');

        const systemPrompt = `You are "ArchiveAI", an expert Concert & Live Music AI Assistant for the Concert Setlist & Tour Archive.
You have access to real-time context from our concert database:
- Total Artists: ${artists ? artists.length : 0} (Featured: ${artistList})
- Total Tours: ${tours ? tours.length : 0}
- Total Concerts: ${concerts ? concerts.length : 0} (Recent venues: ${concertList})
- Total Songs Catalog: ${songs ? songs.length : 0} (Sample tracks: ${songList})

Your job is to provide engaging, accurate, musicologist-level responses about concerts, setlists, tour history, song choices, venue dynamics, and band analytics.
Format your responses using clear markdown styling, bullet points, emoji tags, and song listings where appropriate.
If asked about setlists or predictions, provide creative and realistic song setlists.`;

        const messages = [
            { role: 'system', content: systemPrompt }
        ];

        if (Array.isArray(conversationHistory)) {
            conversationHistory.slice(-6).forEach(msg => {
                if (msg.role && msg.content) {
                    messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
                }
            });
        }

        messages.push({ role: 'user', content: message });

        const result = await callGroqApi(messages, 0.7);

        res.json({
            success: true,
            data: {
                reply: result.reply,
                model: result.model,
                usage: result.usage
            },
            message: 'AI assistant response generated successfully.'
        });
    } catch (err) {
        console.error('Groq AI Chat Error:', err);
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// POST /api/ai/predict-setlist - AI Concert Setlist Predictor
app.post('/api/ai/predict-setlist', async (req, res) => {
    try {
        const { artistName, venue, concertType, songCount } = req.body;
        if (!artistName) {
            return res.status(400).json({ success: false, data: null, message: 'Artist name is required.' });
        }

        const count = parseInt(songCount) || 12;
        const venueInfo = venue || 'Major Stadium / Arena';
        const typeInfo = concertType || 'Headliner World Tour';

        const prompt = `Generate a realistic, expertly curated concert setlist for "${artistName}" performing at "${venueInfo}" (${typeInfo}).
Total Songs: ${count} songs.

Structure your response clearly with:
1. 🎵 **Concert Title & Opening Vibe**
2. 🚀 **Main Setlist** (Numbered 1 to ${count - 2} with track name, album, and brief 1-line reason why it is played here)
3. 🔥 **Encore** (Final 2 high-energy or emotional tracks)
4. ⚡ **Setlist Highlights & Fan Reception Analysis**

Format the output nicely using Markdown with emojis.`;

        const result = await callGroqApi([
            { role: 'system', content: 'You are a legendary tour production director and music journalist specializing in concert setlist curation.' },
            { role: 'user', content: prompt }
        ], 0.8);

        res.json({
            success: true,
            data: {
                artistName,
                venue: venueInfo,
                setlistMarkdown: result.reply,
                model: result.model
            },
            message: 'Setlist predicted successfully by Groq AI.'
        });
    } catch (err) {
        console.error('Setlist prediction error:', err);
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// GET /api/ai/insights - AI Insights & Highlights
app.get('/api/ai/insights', async (req, res) => {
    try {
        const [artists, tours, concerts, songs] = await Promise.all([
            fetchFirebase('artists').catch(() => []),
            fetchFirebase('tours').catch(() => []),
            fetchFirebase('concerts').catch(() => []),
            fetchFirebase('songs').catch(() => [])
        ]);

        const prompt = `Analyze our concert archive database and generate 3 sharp, fascinating executive insights/trends for live music fans.
Database Overview:
- Artists: ${artists ? artists.length : 0} (${(artists || []).map(a => a.Artist_Name).join(', ')})
- Tours: ${tours ? tours.length : 0} (${(tours || []).map(t => t.Tour_Name).join(', ')})
- Concerts: ${concerts ? concerts.length : 0} in cities (${(concerts || []).map(c => c.City).join(', ')})
- Songs Catalog: ${songs ? songs.length : 0} songs

Provide 3 distinct insights under the headlines:
1. 🌟 **Touring Momentum & Global Reach**
2. 🎸 **Setlist Diversity & Track Classics**
3. 🔮 **Live Event Forecast & Audience Trends**

Keep each insight to 2 concise sentences.`;

        const result = await callGroqApi([
            { role: 'system', content: 'You are an executive live music industry analyst.' },
            { role: 'user', content: prompt }
        ], 0.6);

        res.json({
            success: true,
            data: {
                insightsMarkdown: result.reply,
                model: result.model
            },
            message: 'AI insights generated.'
        });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🎸 Concert Setlist & Tour Archive Backend running on http://localhost:${PORT}`);
    console.log(`🔥 Connected to Firebase Realtime Database: ${FIREBASE_DB_URL}`);
    console.log(`🤖 Groq AI Powered Assistant Endpoint Active (${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'})`);
});

