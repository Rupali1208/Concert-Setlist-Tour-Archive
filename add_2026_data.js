// Script to add 2026 data to Firebase RTDB
// Run: node add_2026_data.js

const FIREBASE_DB_URL = "https://concert-setlist-6abb2-default-rtdb.firebaseio.com";

async function fetchFirebase(path) {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`);
    if (!res.ok) throw new Error(`Firebase fetch error ${res.status}`);
    return await res.json();
}

async function putFirebase(path, data) {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Firebase PUT error ${res.status}`);
    return await res.json();
}

async function main() {
    console.log("📥 Fetching existing data from Firebase...");

    const artists  = await fetchFirebase('artists')  || [];
    const tours    = await fetchFirebase('tours')    || [];
    const concerts = await fetchFirebase('concerts') || [];
    const songs    = await fetchFirebase('songs')    || [];
    const setlists = await fetchFirebase('setlists') || [];

    console.log(`✅ Loaded: ${artists.length} artists, ${tours.length} tours, ${concerts.length} concerts, ${songs.length} songs, ${setlists.length} setlist entries`);

    // ──────────────────────────────────────────────────────────────────────────
    // 1. NEW ARTIST - Karan Aujla (fix casing) + Shreya Ghoshal, Atif Aslam
    // ──────────────────────────────────────────────────────────────────────────
    // Fix existing karan aujla entry
    const karanIdx = artists.findIndex(a => a.Artist_ID === 10);
    if (karanIdx !== -1) {
        artists[karanIdx].Artist_Name = "Karan Aujla";
        artists[karanIdx].Country = "India";
        artists[karanIdx].Genre = "Punjabi Pop / Hip-Hop";
    }

    // Add new artists if not present
    const newArtists = [
        { Artist_ID: 11, Artist_Name: "Shreya Ghoshal", Country: "India", Genre: "Bollywood / Classical" },
        { Artist_ID: 12, Artist_Name: "Atif Aslam",    Country: "Pakistan", Genre: "Pop / Bollywood" },
    ];
    newArtists.forEach(na => {
        if (!artists.find(a => a.Artist_ID === na.Artist_ID)) artists.push(na);
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 2. NEW 2026 TOURS
    // ──────────────────────────────────────────────────────────────────────────
    const newTours = [
        // Coldplay – continuation of Moon Music tour into 2026 India
        { Tour_ID: 13, Tour_Name: "Moon Music India 2026",         Artist_ID: 1,  Start_Date: "2026-01-18", End_Date: "2026-02-05" },
        // Taylor Swift – new 2026 Tortured Poets World Tour
        { Tour_ID: 14, Tour_Name: "Tortured Poets World Tour 2026", Artist_ID: 2,  Start_Date: "2026-03-10", End_Date: "2026-09-30" },
        // BTS – BE:ME World Tour 2026
        { Tour_ID: 15, Tour_Name: "BE:ME World Tour 2026",          Artist_ID: 3,  Start_Date: "2026-02-20", End_Date: "2026-08-15" },
        // Daft Punk – Alive 2026 Legacy Tour (existing Tour_ID:8 already covers some, add more legs)
        { Tour_ID: 16, Tour_Name: "Alive 2026 India Leg",           Artist_ID: 4,  Start_Date: "2026-07-01", End_Date: "2026-07-15" },
        // Ed Sheeran – Subtract Tour 2026
        { Tour_ID: 17, Tour_Name: "Subtract World Tour 2026",       Artist_ID: 7,  Start_Date: "2026-04-01", End_Date: "2026-10-31" },
        // Diljit Dosanjh – Paradox Tour 2026
        { Tour_ID: 18, Tour_Name: "Paradox World Tour 2026",        Artist_ID: 8,  Start_Date: "2026-01-10", End_Date: "2026-06-30" },
        // Arijit Singh – Filhaal Live 2026
        { Tour_ID: 19, Tour_Name: "Filhaal Live World Tour 2026",   Artist_ID: 9,  Start_Date: "2026-01-25", End_Date: "2026-09-20" },
        // Karan Aujla – Making Memories Tour 2026
        { Tour_ID: 20, Tour_Name: "Making Memories World Tour 2026", Artist_ID: 10, Start_Date: "2026-02-14", End_Date: "2026-08-31" },
        // Shreya Ghoshal – Swar Yatra 2026
        { Tour_ID: 21, Tour_Name: "Swar Yatra India Tour 2026",     Artist_ID: 11, Start_Date: "2026-03-01", End_Date: "2026-05-30" },
        // Atif Aslam – Raat Bhar Live 2026
        { Tour_ID: 22, Tour_Name: "Raat Bhar Live Tour 2026",       Artist_ID: 12, Start_Date: "2026-04-15", End_Date: "2026-09-15" },
        // A.R. Rahman – Vande Mataram 2026 (30th Anniversary)
        { Tour_ID: 23, Tour_Name: "Vande Mataram 30th Anniversary 2026", Artist_ID: 6, Start_Date: "2026-08-10", End_Date: "2026-12-31" },
    ];
    newTours.forEach(nt => {
        if (!tours.find(t => t.Tour_ID === nt.Tour_ID)) tours.push(nt);
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. NEW 2026 CONCERTS (Concert_ID 35 onwards)
    // ──────────────────────────────────────────────────────────────────────────
    const newConcerts = [
        // Coldplay - Moon Music India 2026
        { Concert_ID: 35, Concert_Date: "2026-01-18", Venue: "Narendra Modi Stadium",    City: "Ahmedabad",  Country: "India",          Tour_ID: 13 },
        { Concert_ID: 36, Concert_Date: "2026-01-21", Venue: "DY Patil Stadium",         City: "Mumbai",     Country: "India",          Tour_ID: 13 },
        { Concert_ID: 37, Concert_Date: "2026-01-23", Venue: "DY Patil Stadium",         City: "Mumbai",     Country: "India",          Tour_ID: 13 },
        { Concert_ID: 38, Concert_Date: "2026-01-26", Venue: "Jawaharlal Nehru Stadium", City: "Delhi",      Country: "India",          Tour_ID: 13 },
        { Concert_ID: 39, Concert_Date: "2026-02-01", Venue: "Ekana Cricket Stadium",    City: "Lucknow",    Country: "India",          Tour_ID: 13 },
        { Concert_ID: 40, Concert_Date: "2026-02-05", Venue: "JSCA Stadium",             City: "Ranchi",     Country: "India",          Tour_ID: 13 },

        // Taylor Swift - Tortured Poets World Tour 2026
        { Concert_ID: 41, Concert_Date: "2026-03-10", Venue: "SoFi Stadium",             City: "Los Angeles",   Country: "United States",  Tour_ID: 14 },
        { Concert_ID: 42, Concert_Date: "2026-03-20", Venue: "MetLife Stadium",          City: "New York",      Country: "United States",  Tour_ID: 14 },
        { Concert_ID: 43, Concert_Date: "2026-04-10", Venue: "Wembley Stadium",          City: "London",        Country: "United Kingdom", Tour_ID: 14 },
        { Concert_ID: 44, Concert_Date: "2026-05-15", Venue: "Accor Arena",              City: "Paris",         Country: "France",         Tour_ID: 14 },
        { Concert_ID: 45, Concert_Date: "2026-06-07", Venue: "Olympiastadion",           City: "Munich",        Country: "Germany",        Tour_ID: 14 },
        { Concert_ID: 46, Concert_Date: "2026-09-25", Venue: "DY Patil Stadium",         City: "Mumbai",        Country: "India",          Tour_ID: 14 },

        // BTS - BE:ME World Tour 2026
        { Concert_ID: 47, Concert_Date: "2026-02-20", Venue: "Seoul World Cup Stadium",  City: "Seoul",         Country: "South Korea",    Tour_ID: 15 },
        { Concert_ID: 48, Concert_Date: "2026-03-05", Venue: "Tokyo Dome",               City: "Tokyo",         Country: "Japan",          Tour_ID: 15 },
        { Concert_ID: 49, Concert_Date: "2026-04-18", Venue: "Allegiant Stadium",        City: "Las Vegas",     Country: "United States",  Tour_ID: 15 },
        { Concert_ID: 50, Concert_Date: "2026-05-23", Venue: "National Stadium",         City: "Singapore",     Country: "Singapore",      Tour_ID: 15 },
        { Concert_ID: 51, Concert_Date: "2026-08-10", Venue: "Wembley Stadium",          City: "London",        Country: "United Kingdom", Tour_ID: 15 },

        // Daft Punk - Alive 2026 India Leg
        { Concert_ID: 52, Concert_Date: "2026-07-05", Venue: "Jawaharlal Nehru Stadium", City: "Delhi",         Country: "India",          Tour_ID: 16 },
        { Concert_ID: 53, Concert_Date: "2026-07-10", Venue: "DY Patil Stadium",         City: "Mumbai",        Country: "India",          Tour_ID: 16 },
        { Concert_ID: 54, Concert_Date: "2026-07-15", Venue: "Palace Grounds",           City: "Bengaluru",     Country: "India",          Tour_ID: 16 },

        // Ed Sheeran - Subtract World Tour 2026
        { Concert_ID: 55, Concert_Date: "2026-04-05", Venue: "Wembley Stadium",          City: "London",        Country: "United Kingdom", Tour_ID: 17 },
        { Concert_ID: 56, Concert_Date: "2026-05-20", Venue: "Madison Square Garden",    City: "New York",      Country: "United States",  Tour_ID: 17 },
        { Concert_ID: 57, Concert_Date: "2026-08-25", Venue: "Narendra Modi Stadium",    City: "Ahmedabad",     Country: "India",          Tour_ID: 17 },
        { Concert_ID: 58, Concert_Date: "2026-09-10", Venue: "Gachibowli Stadium",       City: "Hyderabad",     Country: "India",          Tour_ID: 17 },

        // Diljit Dosanjh - Paradox Tour 2026
        { Concert_ID: 59, Concert_Date: "2026-01-10", Venue: "Indira Gandhi Arena",      City: "Delhi",         Country: "India",          Tour_ID: 18 },
        { Concert_ID: 60, Concert_Date: "2026-01-15", Venue: "NESCO Center",             City: "Mumbai",        Country: "India",          Tour_ID: 18 },
        { Concert_ID: 61, Concert_Date: "2026-02-07", Venue: "HICC Arena",               City: "Hyderabad",     Country: "India",          Tour_ID: 18 },
        { Concert_ID: 62, Concert_Date: "2026-02-21", Venue: "Sportel Arena",            City: "Chandigarh",    Country: "India",          Tour_ID: 18 },
        { Concert_ID: 63, Concert_Date: "2026-03-14", Venue: "Chinnaswamy Stadium",      City: "Bengaluru",     Country: "India",          Tour_ID: 18 },
        { Concert_ID: 64, Concert_Date: "2026-06-20", Venue: "Rogers Centre",            City: "Toronto",       Country: "Canada",         Tour_ID: 18 },
        { Concert_ID: 65, Concert_Date: "2026-06-25", Venue: "The O2 Arena",             City: "London",        Country: "United Kingdom", Tour_ID: 18 },

        // Arijit Singh - Filhaal Live 2026
        { Concert_ID: 66, Concert_Date: "2026-01-25", Venue: "JECC Centre",              City: "Jaipur",        Country: "India",          Tour_ID: 19 },
        { Concert_ID: 67, Concert_Date: "2026-02-08", Venue: "Aquatica Park",            City: "Kolkata",       Country: "India",          Tour_ID: 19 },
        { Concert_ID: 68, Concert_Date: "2026-02-21", Venue: "HITEX Exhibition Centre",  City: "Hyderabad",     Country: "India",          Tour_ID: 19 },
        { Concert_ID: 69, Concert_Date: "2026-03-08", Venue: "Mahalaxmi Lawns",          City: "Pune",          Country: "India",          Tour_ID: 19 },
        { Concert_ID: 70, Concert_Date: "2026-04-26", Venue: "Kanteerava Stadium",       City: "Bengaluru",     Country: "India",          Tour_ID: 19 },
        { Concert_ID: 71, Concert_Date: "2026-09-18", Venue: "Madison Square Garden",    City: "New York",      Country: "United States",  Tour_ID: 19 },
        { Concert_ID: 72, Concert_Date: "2026-09-20", Venue: "SSE Arena Wembley",        City: "London",        Country: "United Kingdom", Tour_ID: 19 },

        // Karan Aujla - Making Memories Tour 2026
        { Concert_ID: 73, Concert_Date: "2026-02-14", Venue: "NESCO Center",             City: "Mumbai",        Country: "India",          Tour_ID: 20 },
        { Concert_ID: 74, Concert_Date: "2026-02-20", Venue: "Jawaharlal Nehru Stadium", City: "Delhi",         Country: "India",          Tour_ID: 20 },
        { Concert_ID: 75, Concert_Date: "2026-03-01", Venue: "Sportel Arena",            City: "Chandigarh",    Country: "India",          Tour_ID: 20 },
        { Concert_ID: 76, Concert_Date: "2026-04-05", Venue: "Rogers Centre",            City: "Toronto",       Country: "Canada",         Tour_ID: 20 },
        { Concert_ID: 77, Concert_Date: "2026-04-12", Venue: "United Center",            City: "Chicago",       Country: "United States",  Tour_ID: 20 },
        { Concert_ID: 78, Concert_Date: "2026-05-10", Venue: "The O2 Arena",             City: "London",        Country: "United Kingdom", Tour_ID: 20 },
        { Concert_ID: 79, Concert_Date: "2026-08-20", Venue: "Qudos Bank Arena",         City: "Sydney",        Country: "Australia",      Tour_ID: 20 },

        // Shreya Ghoshal - Swar Yatra 2026
        { Concert_ID: 80, Concert_Date: "2026-03-01", Venue: "NCPA",                     City: "Mumbai",        Country: "India",          Tour_ID: 21 },
        { Concert_ID: 81, Concert_Date: "2026-03-15", Venue: "Siri Fort Auditorium",     City: "Delhi",         Country: "India",          Tour_ID: 21 },
        { Concert_ID: 82, Concert_Date: "2026-04-05", Venue: "Chowdaiah Memorial Hall",  City: "Bengaluru",     Country: "India",          Tour_ID: 21 },
        { Concert_ID: 83, Concert_Date: "2026-05-10", Venue: "Jawaharlal Nehru Stadium", City: "Chennai",       Country: "India",          Tour_ID: 21 },
        { Concert_ID: 84, Concert_Date: "2026-05-25", Venue: "Rabindra Sadan",           City: "Kolkata",       Country: "India",          Tour_ID: 21 },

        // Atif Aslam - Raat Bhar Live 2026
        { Concert_ID: 85, Concert_Date: "2026-04-15", Venue: "Gachibowli Stadium",       City: "Hyderabad",     Country: "India",          Tour_ID: 22 },
        { Concert_ID: 86, Concert_Date: "2026-05-02", Venue: "DY Patil Stadium",         City: "Mumbai",        Country: "India",          Tour_ID: 22 },
        { Concert_ID: 87, Concert_Date: "2026-06-14", Venue: "The O2 Arena",             City: "London",        Country: "United Kingdom", Tour_ID: 22 },
        { Concert_ID: 88, Concert_Date: "2026-07-30", Venue: "Rogers Centre",            City: "Toronto",       Country: "Canada",         Tour_ID: 22 },
        { Concert_ID: 89, Concert_Date: "2026-09-12", Venue: "Dubai World Trade Centre", City: "Dubai",         Country: "UAE",            Tour_ID: 22 },

        // A.R. Rahman - Vande Mataram 30th Anniversary 2026
        { Concert_ID: 90, Concert_Date: "2026-08-10", Venue: "HIRANANDANI OPEN AIR",     City: "Mumbai",        Country: "India",          Tour_ID: 23 },
        { Concert_ID: 91, Concert_Date: "2026-08-15", Venue: "Jawaharlal Nehru Stadium", City: "Delhi",         Country: "India",          Tour_ID: 23 },
        { Concert_ID: 92, Concert_Date: "2026-09-01", Venue: "Jawaharlal Nehru Stadium", City: "Chennai",       Country: "India",          Tour_ID: 23 },
        { Concert_ID: 93, Concert_Date: "2026-09-20", Venue: "Kanteerava Stadium",       City: "Bengaluru",     Country: "India",          Tour_ID: 23 },
        { Concert_ID: 94, Concert_Date: "2026-12-31", Venue: "Narendra Modi Stadium",    City: "Ahmedabad",     Country: "India",          Tour_ID: 23 },
    ];

    newConcerts.forEach(nc => {
        if (!concerts.find(c => c.Concert_ID === nc.Concert_ID)) concerts.push(nc);
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 4. NEW SONGS (Song_ID 43+)
    // ──────────────────────────────────────────────────────────────────────────
    const newSongs = [
        // Coldplay – Moon Music 2026 era
        { Song_ID: 43, Song_Name: "All My Love",          Album: "Moon Music",                   Artist_ID: 1 },
        { Song_ID: 44, Song_Name: "Moon Music",            Album: "Moon Music",                   Artist_ID: 1 },

        // Taylor Swift – Tortured Poets era
        { Song_ID: 45, Song_Name: "The Tortured Poets Department", Album: "The Tortured Poets Department", Artist_ID: 2 },
        { Song_ID: 46, Song_Name: "But Daddy I Love Him", Album: "The Tortured Poets Department", Artist_ID: 2 },
        { Song_ID: 47, Song_Name: "Down Bad",              Album: "The Tortured Poets Department", Artist_ID: 2 },

        // BTS – solo/comeback 2026
        { Song_ID: 48, Song_Name: "Yet To Come (The Most Beautiful Moment)", Album: "Proof",      Artist_ID: 3 },
        { Song_ID: 49, Song_Name: "ON",                    Album: "Map of the Soul: 7",           Artist_ID: 3 },

        // Daft Punk – Alive 2026 classics
        { Song_ID: 50, Song_Name: "Da Funk",               Album: "Homework",                    Artist_ID: 4 },
        { Song_ID: 51, Song_Name: "Digital Love",          Album: "Discovery",                   Artist_ID: 4 },

        // Ed Sheeran – Subtract era
        { Song_ID: 52, Song_Name: "Eyes Closed",           Album: "Subtract (-)",                 Artist_ID: 7 },
        { Song_ID: 53, Song_Name: "Overpass Graffiti",     Album: "Equals (=)",                   Artist_ID: 7 },
        { Song_ID: 54, Song_Name: "Shivers",               Album: "Equals (=)",                   Artist_ID: 7 },

        // Diljit Dosanjh – Paradox era
        { Song_ID: 55, Song_Name: "Kinni Kinni",           Album: "Ghost",                        Artist_ID: 8 },
        { Song_ID: 56, Song_Name: "Patiala Peg",           Album: "GOAT",                         Artist_ID: 8 },
        { Song_ID: 57, Song_Name: "Do You Know",           Album: "Patiala Peg",                  Artist_ID: 8 },

        // Arijit Singh – Filhaal era
        { Song_ID: 58, Song_Name: "Filhaal",               Album: "Filhaal",                      Artist_ID: 9 },
        { Song_ID: 59, Song_Name: "Apna Bana Le",          Album: "Bhediya",                      Artist_ID: 9 },
        { Song_ID: 60, Song_Name: "Raataan Lambiyan",      Album: "Shershaah",                    Artist_ID: 9 },

        // Karan Aujla – Making Memories era
        { Song_ID: 61, Song_Name: "Softly",                Album: "Making Memories",              Artist_ID: 10 },
        { Song_ID: 62, Song_Name: "Making Memories",       Album: "Making Memories",              Artist_ID: 10 },
        { Song_ID: 63, Song_Name: "Tauba Tauba",           Album: "Making Memories",              Artist_ID: 10 },
        { Song_ID: 64, Song_Name: "Shades",                Album: "Making Memories",              Artist_ID: 10 },

        // Shreya Ghoshal
        { Song_ID: 65, Song_Name: "Teri Meri Kahani",      Album: "Gabbar is Back",               Artist_ID: 11 },
        { Song_ID: 66, Song_Name: "Sunn Raha Hai",         Album: "Aashiqui 2",                   Artist_ID: 11 },
        { Song_ID: 67, Song_Name: "Jadu Hai Nasha Hai",    Album: "Jism",                         Artist_ID: 11 },
        { Song_ID: 68, Song_Name: "Bairi Piya",            Album: "Devdas",                       Artist_ID: 11 },

        // Atif Aslam
        { Song_ID: 69, Song_Name: "Tere Sang Yaara",       Album: "Rustom",                       Artist_ID: 12 },
        { Song_ID: 70, Song_Name: "Jeena Jeena",           Album: "Badlapur",                     Artist_ID: 12 },
        { Song_ID: 71, Song_Name: "Dil Diyan Gallan",      Album: "Tiger Zinda Hai",              Artist_ID: 12 },
        { Song_ID: 72, Song_Name: "Tu Chahiye",            Album: "Bajrangi Bhaijaan",            Artist_ID: 12 },

        // A.R. Rahman – 2026 anniversary
        { Song_ID: 73, Song_Name: "Maa Tujhe Salaam",      Album: "Vande Mataram",                Artist_ID: 6 },
        { Song_ID: 74, Song_Name: "Dil Se Re",             Album: "Dil Se",                       Artist_ID: 6 },
        { Song_ID: 75, Song_Name: "Chaiyya Chaiyya",       Album: "Dil Se",                       Artist_ID: 6 },
    ];

    newSongs.forEach(ns => {
        if (!songs.find(s => s.Song_ID === ns.Song_ID)) songs.push(ns);
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 5. BUILD SETLIST ENTRIES for NEW 2026 CONCERTS
    // ──────────────────────────────────────────────────────────────────────────
    const newSetlists = [
        // Coldplay 2026 India concerts (35-40) – songs 1,2,3,4,5,6,43,44
        ...[35,36,37,38,39,40].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 43, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 6,  Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 44, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 5,  Song_Order: 4 },
            { Concert_ID: cId, Song_ID: 3,  Song_Order: 5 },
            { Concert_ID: cId, Song_ID: 1,  Song_Order: 6 },
            { Concert_ID: cId, Song_ID: 4,  Song_Order: 7 },
            { Concert_ID: cId, Song_ID: 2,  Song_Order: 8 },
        ]),
        // Taylor Swift Tortured Poets 2026 (41-46)
        ...[41,42,43,44,45,46].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 45, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 47, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 46, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 12, Song_Order: 4 },
            { Concert_ID: cId, Song_ID: 9,  Song_Order: 5 },
            { Concert_ID: cId, Song_ID: 7,  Song_Order: 6 },
            { Concert_ID: cId, Song_ID: 8,  Song_Order: 7 },
            { Concert_ID: cId, Song_ID: 10, Song_Order: 8 },
        ]),
        // BTS BE:ME 2026 (47-51)
        ...[47,48,49,50,51].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 48, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 49, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 13, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 14, Song_Order: 4 },
            { Concert_ID: cId, Song_ID: 16, Song_Order: 5 },
            { Concert_ID: cId, Song_ID: 17, Song_Order: 6 },
            { Concert_ID: cId, Song_ID: 18, Song_Order: 7 },
            { Concert_ID: cId, Song_ID: 15, Song_Order: 8 },
        ]),
        // Daft Punk Alive 2026 India (52-54)
        ...[52,53,54].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 20, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 50, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 51, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 22, Song_Order: 4 },
            { Concert_ID: cId, Song_ID: 24, Song_Order: 5 },
            { Concert_ID: cId, Song_ID: 21, Song_Order: 6 },
            { Concert_ID: cId, Song_ID: 23, Song_Order: 7 },
            { Concert_ID: cId, Song_ID: 19, Song_Order: 8 },
        ]),
        // Ed Sheeran Subtract 2026 (55-58)
        ...[55,56,57,58].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 52, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 53, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 54, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 34, Song_Order: 4 },
            { Concert_ID: cId, Song_ID: 35, Song_Order: 5 },
            { Concert_ID: cId, Song_ID: 36, Song_Order: 6 },
        ]),
        // Diljit Dosanjh Paradox 2026 (59-65)
        ...[59,60,61,62,63,64,65].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 55, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 56, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 57, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 37, Song_Order: 4 },
            { Concert_ID: cId, Song_ID: 38, Song_Order: 5 },
            { Concert_ID: cId, Song_ID: 39, Song_Order: 6 },
        ]),
        // Arijit Singh Filhaal 2026 (66-72)
        ...[66,67,68,69,70,71,72].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 58, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 59, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 60, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 40, Song_Order: 4 },
            { Concert_ID: cId, Song_ID: 41, Song_Order: 5 },
            { Concert_ID: cId, Song_ID: 42, Song_Order: 6 },
        ]),
        // Karan Aujla Making Memories 2026 (73-79)
        ...[73,74,75,76,77,78,79].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 61, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 62, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 63, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 64, Song_Order: 4 },
        ]),
        // Shreya Ghoshal Swar Yatra 2026 (80-84)
        ...[80,81,82,83,84].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 65, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 66, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 67, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 68, Song_Order: 4 },
        ]),
        // Atif Aslam Raat Bhar 2026 (85-89)
        ...[85,86,87,88,89].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 69, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 70, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 71, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 72, Song_Order: 4 },
        ]),
        // AR Rahman Vande Mataram 2026 (90-94)
        ...[90,91,92,93,94].flatMap(cId => [
            { Concert_ID: cId, Song_ID: 73, Song_Order: 1 },
            { Concert_ID: cId, Song_ID: 31, Song_Order: 2 },
            { Concert_ID: cId, Song_ID: 74, Song_Order: 3 },
            { Concert_ID: cId, Song_ID: 75, Song_Order: 4 },
            { Concert_ID: cId, Song_ID: 32, Song_Order: 5 },
            { Concert_ID: cId, Song_ID: 33, Song_Order: 6 },
        ]),
    ];

    newSetlists.forEach(ns => {
        const exists = setlists.find(s => s.Concert_ID === ns.Concert_ID && s.Song_Order === ns.Song_Order);
        if (!exists) setlists.push(ns);
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 6. PUSH ALL DATA BACK TO FIREBASE
    // ──────────────────────────────────────────────────────────────────────────
    console.log("\n📤 Uploading data to Firebase...");

    await putFirebase('artists',  artists);  console.log(`✅ Artists  uploaded: ${artists.length}`);
    await putFirebase('tours',    tours);    console.log(`✅ Tours    uploaded: ${tours.length}`);
    await putFirebase('concerts', concerts); console.log(`✅ Concerts uploaded: ${concerts.length}`);
    await putFirebase('songs',    songs);    console.log(`✅ Songs    uploaded: ${songs.length}`);
    await putFirebase('setlists', setlists); console.log(`✅ Setlists uploaded: ${setlists.length}`);

    console.log("\n🎉 2026 data successfully added to Firebase!");
    console.log(`   New Tours: 11 | New Concerts: 60 | New Songs: 33 | New Setlist Entries added`);
}

main().catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
