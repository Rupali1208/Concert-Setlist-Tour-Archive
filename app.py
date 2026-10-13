import os
import uuid
import hashlib
import datetime
from decimal import Decimal
# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from db import execute_query, get_db_connection

# Load environment variables
load_dotenv()

def hash_password(password):
    """SHA-256 hash a password with a fixed salt."""
    salt = os.getenv("SECRET_KEY", "concert_secret_2026")
    return hashlib.sha256((salt + password).encode()).hexdigest()

def generate_token():
    """Generate a unique session token."""
    return str(uuid.uuid4()).replace('-', '')

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Enable CORS for localhost frontend access
CORS(app, resources={r"/api/*": {"origins": "*"}})

def make_response(success=True, data=None, message=""):
    """Generates standard JSON response format: { success, data, message }."""
    return jsonify({
        "success": success,
        "data": serialize_data(data),
        "message": message
    })

def serialize_data(val):
    """Recursively formats dates, datetimes, and decimals into standard JSON serializable types."""
    if isinstance(val, list):
        return [serialize_data(item) for item in val]
    elif isinstance(val, dict):
        return {
            k: (v.isoformat() if isinstance(v, (datetime.date, datetime.datetime))
                else (float(v) if isinstance(v, Decimal) else serialize_data(v)))
            for k, v in val.items()
        }
    return val

@app.errorhandler(Exception)
def handle_global_exception(e):
    """Global exception handler returning consistent JSON format."""
    print(f"[ERROR] Exception caught: {e}")
    return make_response(success=False, data=None, message=str(e)), 500

# -----------------------------------------------------------------------------
# Health Check Endpoint
# -----------------------------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        res = execute_query("SELECT 1 as alive", fetch_one=True)
        return make_response(success=True, data={"db_connected": True}, message="ConcertArchive Flask API is operational.")
    except Exception as e:
        return make_response(success=False, data={"db_connected": False}, message=f"Database connection error: {str(e)}"), 500

@app.route('/', methods=['GET'])
def home():
    return """<html><head><title>Concert API</title></head><body><h1>Concert Setlist & Tour Archive API</h1><p>API is running. Use <a href='/api/health'>/api/health</a> for health check.</p></body></html>"""

# =============================================================================
# STATS ENDPOINTS
# =============================================================================

@app.route('/api/stats/overview', methods=['GET'])
def get_stats_overview():
    """GET /api/stats/overview - Overall database totals."""
    try:
        artists_count = execute_query("SELECT COUNT(*) as count FROM Artists", fetch_one=True)['count']
        tours_count = execute_query("SELECT COUNT(*) as count FROM Tours", fetch_one=True)['count']
        concerts_count = execute_query("SELECT COUNT(*) as count FROM Concerts", fetch_one=True)['count']
        songs_count = execute_query("SELECT COUNT(*) as count FROM Songs", fetch_one=True)['count']
        setlists_count = execute_query("SELECT COUNT(*) as count FROM Setlists", fetch_one=True)['count']

        overview = {
            "total_artists": artists_count,
            "total_tours": tours_count,
            "total_concerts": concerts_count,
            "total_songs": songs_count,
            "total_setlist_entries": setlists_count
        }
        return make_response(success=True, data=overview, message="Overview stats retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch overview stats: {str(e)}"), 500

@app.route('/api/stats/top-songs', methods=['GET'])
def get_top_songs():
    """GET /api/stats/top-songs - Top songs by performance count."""
    try:
        query = """
            SELECT 
                s.Song_ID, 
                s.Song_Name, 
                s.Album, 
                a.Artist_Name, 
                COUNT(sl.Concert_ID) AS Times_Played,
                ROUND(AVG(sl.Song_Order), 1) AS Avg_Setlist_Position
            FROM Songs s
            JOIN Artists a ON s.Artist_ID = a.Artist_ID
            LEFT JOIN Setlists sl ON s.Song_ID = sl.Song_ID
            GROUP BY s.Song_ID, s.Song_Name, s.Album, a.Artist_Name
            ORDER BY Times_Played DESC, s.Song_Name ASC
            LIMIT 10
        """
        top_songs = execute_query(query, fetch_all=True)
        return make_response(success=True, data=top_songs, message="Top songs retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch top songs: {str(e)}"), 500

@app.route('/api/stats/cities', methods=['GET'])
def get_cities_stats():
    """GET /api/stats/cities - Concert breakdown by city."""
    try:
        query = """
            SELECT City, COUNT(Concert_ID) AS Concert_Count 
            FROM Concerts 
            GROUP BY City 
            ORDER BY Concert_Count DESC, City ASC
        """
        cities = execute_query(query, fetch_all=True)
        return make_response(success=True, data=cities, message="City stats retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch city stats: {str(e)}"), 500

@app.route('/api/stats/concerts-by-year', methods=['GET'])
def get_concerts_by_year():
    """GET /api/stats/concerts-by-year - Concert frequency by year."""
    try:
        query = """
            SELECT YEAR(Concert_Date) AS Year, COUNT(Concert_ID) AS Concert_Count
            FROM Concerts
            GROUP BY YEAR(Concert_Date)
            ORDER BY Year ASC
        """
        years = execute_query(query, fetch_all=True)
        return make_response(success=True, data=years, message="Concerts by year retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch concerts by year: {str(e)}"), 500

@app.route('/api/stats/recent-concerts', methods=['GET'])
def get_recent_concerts():
    """GET /api/stats/recent-concerts - Latest concert events."""
    try:
        query = """
            SELECT c.Concert_ID, c.Concert_Date, c.Venue, c.City, t.Tour_Name, a.Artist_Name
            FROM Concerts c
            JOIN Tours t ON c.Tour_ID = t.Tour_ID
            JOIN Artists a ON t.Artist_ID = a.Artist_ID
            ORDER BY c.Concert_Date DESC
            LIMIT 5
        """
        recent = execute_query(query, fetch_all=True)
        return make_response(success=True, data=recent, message="Recent concerts retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch recent concerts: {str(e)}"), 500

# =============================================================================
# CRUD & RESOURCE ENDPOINTS
# =============================================================================

# 1. Artists CRUD
@app.route('/api/artists', methods=['GET'])
def get_artists():
    """GET /api/artists - List all artists."""
    try:
        artists = execute_query("SELECT * FROM Artists ORDER BY Artist_Name ASC", fetch_all=True)
        return make_response(success=True, data=artists, message="Artists retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch artists: {str(e)}"), 500

@app.route('/api/artists', methods=['POST'])
def create_artist():
    """POST /api/artists - Create a new artist."""
    try:
        body = request.get_json() or {}
        name = body.get('Artist_Name')
        genre = body.get('Genre')
        country = body.get('Country')

        if not name or not genre or not country:
            return make_response(success=False, message="Artist_Name, Genre, and Country are required."), 400

        query = "INSERT INTO Artists (Artist_Name, Genre, Country) VALUES (%s, %s, %s)"
        artist_id = execute_query(query, (name, genre, country), fetch_all=False)

        new_artist = execute_query("SELECT * FROM Artists WHERE Artist_ID = %s", (artist_id,), fetch_one=True)
        return make_response(success=True, data=new_artist, message="Artist created successfully."), 201
    except Exception as e:
        return make_response(success=False, message=f"Failed to create artist: {str(e)}"), 500

@app.route('/api/artists/<int:artist_id>', methods=['PUT'])
def update_artist(artist_id):
    """PUT /api/artists/<id> - Update artist details."""
    try:
        body = request.get_json() or {}
        name = body.get('Artist_Name')
        genre = body.get('Genre')
        country = body.get('Country')

        existing = execute_query("SELECT * FROM Artists WHERE Artist_ID = %s", (artist_id,), fetch_one=True)
        if not existing:
            return make_response(success=False, message=f"Artist with ID {artist_id} not found."), 404

        updated_name = name if name is not None else existing['Artist_Name']
        updated_genre = genre if genre is not None else existing['Genre']
        updated_country = country if country is not None else existing['Country']

        query = "UPDATE Artists SET Artist_Name = %s, Genre = %s, Country = %s WHERE Artist_ID = %s"
        execute_query(query, (updated_name, updated_genre, updated_country, artist_id), fetch_all=False)

        updated_artist = execute_query("SELECT * FROM Artists WHERE Artist_ID = %s", (artist_id,), fetch_one=True)
        return make_response(success=True, data=updated_artist, message="Artist updated successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to update artist: {str(e)}"), 500

@app.route('/api/artists/<int:artist_id>', methods=['DELETE'])
def delete_artist(artist_id):
    """DELETE /api/artists/<id> - Delete an artist."""
    try:
        existing = execute_query("SELECT * FROM Artists WHERE Artist_ID = %s", (artist_id,), fetch_one=True)
        if not existing:
            return make_response(success=False, message=f"Artist with ID {artist_id} not found."), 404

        execute_query("DELETE FROM Artists WHERE Artist_ID = %s", (artist_id,), fetch_all=False)
        return make_response(success=True, data={"Artist_ID": artist_id}, message="Artist deleted successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to delete artist: {str(e)}"), 500

# 2. Tours
@app.route('/api/tours', methods=['GET'])
def get_tours():
    """GET /api/tours - List all tours with artist details."""
    try:
        query = """
            SELECT t.Tour_ID, t.Artist_ID, a.Artist_Name, a.Genre, t.Tour_Name, t.Start_Date, t.End_Date
            FROM Tours t
            JOIN Artists a ON t.Artist_ID = a.Artist_ID
            ORDER BY t.Start_Date DESC
        """
        tours = execute_query(query, fetch_all=True)
        return make_response(success=True, data=tours, message="Tours retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch tours: {str(e)}"), 500

# 3. Concerts
@app.route('/api/concerts', methods=['GET'])
def get_concerts():
    """GET /api/concerts - List all concerts with venue, city, tour, and artist."""
    try:
        query = """
            SELECT c.Concert_ID, c.Concert_Date, c.Venue, c.City, 
                   t.Tour_ID, t.Tour_Name, a.Artist_ID, a.Artist_Name
            FROM Concerts c
            JOIN Tours t ON c.Tour_ID = t.Tour_ID
            JOIN Artists a ON t.Artist_ID = a.Artist_ID
            ORDER BY c.Concert_Date DESC
        """
        concerts = execute_query(query, fetch_all=True)
        return make_response(success=True, data=concerts, message="Concerts retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch concerts: {str(e)}"), 500

# 4. Concert Setlist
@app.route('/api/concerts/<int:concert_id>/setlist', methods=['GET'])
def get_concert_setlist(concert_id):
    """GET /api/concerts/<id>/setlist - Fetch setlist for a specific concert."""
    try:
        concert = execute_query("SELECT * FROM Concerts WHERE Concert_ID = %s", (concert_id,), fetch_one=True)
        if not concert:
            return make_response(success=False, message=f"Concert with ID {concert_id} not found."), 404

        query = """
            SELECT 
                sl.Concert_ID, 
                sl.Song_Order, 
                s.Song_ID, 
                s.Song_Name, 
                s.Album, 
                a.Artist_Name
            FROM Setlists sl
            JOIN Songs s ON sl.Song_ID = s.Song_ID
            JOIN Artists a ON s.Artist_ID = a.Artist_ID
            WHERE sl.Concert_ID = %s
            ORDER BY sl.Song_Order ASC
        """
        setlist = execute_query(query, (concert_id,), fetch_all=True)
        return make_response(success=True, data=setlist, message=f"Setlist for concert {concert_id} retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch setlist: {str(e)}"), 500

# 5. Songs
@app.route('/api/songs', methods=['GET'])
def get_songs():
    """GET /api/songs - List all songs with artist details."""
    try:
        query = """
            SELECT s.Song_ID, s.Song_Name, s.Album, a.Artist_ID, a.Artist_Name, a.Genre
            FROM Songs s
            JOIN Artists a ON s.Artist_ID = a.Artist_ID
            ORDER BY a.Artist_Name, s.Song_Name ASC
        """
        songs = execute_query(query, fetch_all=True)
        return make_response(success=True, data=songs, message="Songs retrieved successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch songs: {str(e)}"), 500

@app.route('/api/songs/<int:song_id>/concerts', methods=['GET'])
def get_song_concerts(song_id):
    """GET /api/songs/<id>/concerts - List concerts where a specific song was played."""
    try:
        song = execute_query("SELECT * FROM Songs WHERE Song_ID = %s", (song_id,), fetch_one=True)
        if not song:
            return make_response(success=False, message=f"Song with ID {song_id} not found."), 404

        query = """
            SELECT 
                c.Concert_ID, 
                c.Concert_Date, 
                c.Venue, 
                c.City, 
                t.Tour_Name, 
                sl.Song_Order
            FROM Setlists sl
            JOIN Concerts c ON sl.Concert_ID = c.Concert_ID
            JOIN Tours t ON c.Tour_ID = t.Tour_ID
            WHERE sl.Song_ID = %s
            ORDER BY c.Concert_Date DESC
        """
        concerts = execute_query(query, (song_id,), fetch_all=True)
        return make_response(
            success=True, 
            data={"song": serialize_data(song), "concerts": serialize_data(concerts)}, 
            message=f"Concert history for song '{song['Song_Name']}' retrieved successfully."
        )
    except Exception as e:
        return make_response(success=False, message=f"Failed to fetch song concert history: {str(e)}"), 500

# 6. Add Setlist Entry
@app.route('/api/setlists', methods=['POST'])
def add_setlist_entry():
    """POST /api/setlists - Add a song to a concert setlist."""
    try:
        body = request.get_json() or {}
        concert_id = body.get('Concert_ID')
        song_id = body.get('Song_ID')
        song_order = body.get('Song_Order')

        if not concert_id or not song_id or not song_order:
            return make_response(success=False, message="Concert_ID, Song_ID, and Song_Order are required."), 400

        if int(song_order) <= 0:
            return make_response(success=False, message="Song_Order must be greater than 0."), 400

        query = "INSERT INTO Setlists (Concert_ID, Song_ID, Song_Order) VALUES (%s, %s, %s)"
        execute_query(query, (concert_id, song_id, song_order), fetch_all=False)

        return make_response(
            success=True, 
            data={"Concert_ID": concert_id, "Song_ID": song_id, "Song_Order": song_order}, 
            message="Song added to setlist successfully."
        ), 201
    except Exception as e:
        return make_response(success=False, message=f"Failed to add song to setlist: {str(e)}"), 500

# 7. Global Search
@app.route('/api/search', methods=['GET'])
def global_search():
    """GET /api/search?q= - Search across Artists, Tours, Concerts, and Songs."""
    try:
        q = request.args.get('q', '').strip()
        if not q:
            return make_response(success=True, data={"artists": [], "tours": [], "concerts": [], "songs": []}, message="Empty search query.")

        search_pattern = f"%{q}%"

        artists = execute_query(
            "SELECT * FROM Artists WHERE Artist_Name LIKE %s OR Genre LIKE %s OR Country LIKE %s LIMIT 10",
            (search_pattern, search_pattern, search_pattern), fetch_all=True
        )

        tours = execute_query(
            """SELECT t.*, a.Artist_Name FROM Tours t 
               JOIN Artists a ON t.Artist_ID = a.Artist_ID 
               WHERE t.Tour_Name LIKE %s OR a.Artist_Name LIKE %s LIMIT 10""",
            (search_pattern, search_pattern), fetch_all=True
        )

        concerts = execute_query(
            """SELECT c.*, t.Tour_Name, a.Artist_Name FROM Concerts c 
               JOIN Tours t ON c.Tour_ID = t.Tour_ID 
               JOIN Artists a ON t.Artist_ID = a.Artist_ID 
               WHERE c.Venue LIKE %s OR c.City LIKE %s OR a.Artist_Name LIKE %s OR t.Tour_Name LIKE %s LIMIT 10""",
            (search_pattern, search_pattern, search_pattern, search_pattern), fetch_all=True
        )

        songs = execute_query(
            """SELECT s.*, a.Artist_Name FROM Songs s 
               JOIN Artists a ON s.Artist_ID = a.Artist_ID 
               WHERE s.Song_Name LIKE %s OR s.Album LIKE %s OR a.Artist_Name LIKE %s LIMIT 10""",
            (search_pattern, search_pattern, search_pattern), fetch_all=True
        )

        results = {
            "query": q,
            "artists": artists,
            "tours": tours,
            "concerts": concerts,
            "songs": songs
        }
        return make_response(success=True, data=results, message=f"Search completed for query '{q}'.")
    except Exception as e:
        return make_response(success=False, message=f"Search failed: {str(e)}"), 500

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

def ensure_auth_tables():
    """Create Users and UserSessions tables if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Users (
            User_ID INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(100) NOT NULL,
            Email VARCHAR(150) NOT NULL UNIQUE,
            Password_Hash VARCHAR(255) NOT NULL,
            Role VARCHAR(50) DEFAULT 'Audience Member',
            Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS UserSessions (
            Token VARCHAR(64) PRIMARY KEY,
            User_ID INT NOT NULL,
            Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()


@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    """POST /api/auth/register - Register a new user."""
    try:
        body = request.get_json() or {}
        name = (body.get('name') or '').strip()
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''
        role = body.get('role', 'Audience Member')

        if not name or not email or not password:
            return make_response(success=False, message="Name, email, and password are required."), 400
        if len(password) < 6:
            return make_response(success=False, message="Password must be at least 6 characters."), 400

        existing = execute_query("SELECT User_ID FROM Users WHERE Email = %s", (email,), fetch_one=True)
        if existing:
            return make_response(success=False, message="An account with that email already exists."), 409

        pw_hash = hash_password(password)
        user_id = execute_query(
            "INSERT INTO Users (Name, Email, Password_Hash, Role) VALUES (%s, %s, %s, %s)",
            (name, email, pw_hash, role), fetch_all=False
        )

        token = generate_token()
        execute_query(
            "INSERT INTO UserSessions (Token, User_ID) VALUES (%s, %s)",
            (token, user_id), fetch_all=False
        )

        user = execute_query("SELECT User_ID, Name, Email, Role, Created_At FROM Users WHERE User_ID = %s", (user_id,), fetch_one=True)
        return make_response(success=True, data={"user": user, "token": token}, message="Account created successfully. Welcome!"), 201
    except Exception as e:
        return make_response(success=False, message=f"Registration failed: {str(e)}"), 500

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    """POST /api/auth/login - Log in and receive a session token."""
    try:
        body = request.get_json() or {}
        identifier = (body.get('identifier') or body.get('email') or body.get('username') or '').strip().lower()
        password = body.get('password') or ''

        if not identifier or not password:
            return make_response(success=False, message="Email and password are required."), 400

        user = execute_query(
            "SELECT * FROM Users WHERE Email = %s OR Name = %s",
            (identifier, identifier), fetch_one=True
        )
        if not user or user['Password_Hash'] != hash_password(password):
            return make_response(success=False, message="Invalid email or password."), 401

        token = generate_token()
        execute_query(
            "INSERT INTO UserSessions (Token, User_ID) VALUES (%s, %s)",
            (token, user['User_ID']), fetch_all=False
        )

        user_data = {k: v for k, v in user.items() if k != 'Password_Hash'}
        return make_response(success=True, data={"user": user_data, "token": token}, message="Login successful.")
    except Exception as e:
        return make_response(success=False, message=f"Login failed: {str(e)}"), 500

@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    """GET /api/auth/me - Get current user from session token."""
    try:
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if auth_header.startswith('Bearer ') else auth_header.strip()
        if not token:
            return make_response(success=False, message="Authorization token required."), 401

        session = execute_query("SELECT User_ID FROM UserSessions WHERE Token = %s", (token,), fetch_one=True)
        if not session:
            return make_response(success=False, message="Invalid or expired session."), 401

        user = execute_query(
            "SELECT User_ID, Name, Email, Role, Created_At FROM Users WHERE User_ID = %s",
            (session['User_ID'],), fetch_one=True
        )
        return make_response(success=True, data={"user": user}, message="Session valid.")
    except Exception as e:
        return make_response(success=False, message=f"Session check failed: {str(e)}"), 500

@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    """POST /api/auth/logout - Invalidate session token."""
    try:
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if auth_header.startswith('Bearer ') else ''
        body = request.get_json() or {}
        token = token or body.get('token', '')

        if token:
            execute_query("DELETE FROM UserSessions WHERE Token = %s", (token,), fetch_all=False)
        return make_response(success=True, message="Logged out successfully.")
    except Exception as e:
        return make_response(success=False, message=f"Logout failed: {str(e)}"), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    print(f"ConcertArchive Python Flask Server starting on http://localhost:{port}")
    # Create auth tables on startup (non-fatal if DB not ready)
    try:
        ensure_auth_tables()
        print("[OK] Auth tables verified/created.")
    except Exception as _e:
        print(f"[WARN] Could not create auth tables: {_e}")
    app.run(host='0.0.0.0', port=port, debug=True)
