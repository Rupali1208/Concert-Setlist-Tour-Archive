from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
from config import Config, get_db_connection

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

def serialize_dates(data):
    """Recursively convert date/datetime objects to ISO string format for JSON response."""
    if isinstance(data, list):
        return [serialize_dates(item) for item in data]
    elif isinstance(data, dict):
        return {
            key: (val.isoformat() if isinstance(val, (datetime.date, datetime.datetime)) 
                  else (float(val) if isinstance(val, datetime.decimal.Decimal) else val))
            for key, val in data.items()
        }
    return data

@app.errorhandler(Exception)
def handle_error(e):
    """Global error handler returning standard JSON response."""
    return jsonify({"success": False, "error": str(e)}), 500

# -----------------------------------------------------------------------------
# 1. Health & Status Endpoint
# -----------------------------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    """Verify backend server status and MySQL database connectivity."""
    db_status = "Disconnected"
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 AS test;")
            result = cursor.fetchone()
            if result and result.get('test') == 1:
                db_status = "Connected to MySQL (concert_archive)"
        conn.close()
    except Exception as err:
        db_status = f"Database Connection Error: {str(err)}"

    return jsonify({
        "status": "online",
        "service": "Concert Setlist & Tour Archive API",
        "database": db_status,
        "timestamp": datetime.datetime.now().isoformat()
    })

# -----------------------------------------------------------------------------
# 2. Artists Endpoints
# -----------------------------------------------------------------------------
@app.route('/api/artists', methods=['GET'])
def get_artists():
    """Get list of all artists with optional genre/country filtering."""
    genre = request.args.get('genre')
    country = request.args.get('country')
    
    query = "SELECT Artist_ID, Artist_Name, Genre, Country, Created_At FROM Artists WHERE 1=1"
    params = []
    
    if genre:
        query += " AND Genre = %s"
        params.append(genre)
    if country:
        query += " AND Country = %s"
        params.append(country)
        
    query += " ORDER BY Artist_Name ASC"

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            artists = cursor.fetchall()
        return jsonify({"success": True, "count": len(artists), "data": serialize_dates(artists)})
    finally:
        conn.close()

@app.route('/api/artists', methods=['POST'])
def add_artist():
    """Add a new artist."""
    data = request.get_json() or {}
    name = data.get('Artist_Name')
    genre = data.get('Genre')
    country = data.get('Country')

    if not name or not genre or not country:
        return jsonify({"success": False, "error": "Artist_Name, Genre, and Country are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Artists (Artist_Name, Genre, Country) VALUES (%s, %s, %s)",
                (name, genre, country)
            )
            artist_id = cursor.lastrowid
        return jsonify({"success": True, "message": "Artist created successfully", "Artist_ID": artist_id}), 201
    finally:
        conn.close()

# -----------------------------------------------------------------------------
# 3. Tours Endpoints
# -----------------------------------------------------------------------------
@app.route('/api/tours', methods=['GET'])
def get_tours():
    """Get all tours with artist details."""
    artist_id = request.args.get('artist_id')
    query = """
        SELECT t.Tour_ID, t.Artist_ID, a.Artist_Name, t.Tour_Name, t.Start_Date, t.End_Date 
        FROM Tours t
        JOIN Artists a ON t.Artist_ID = a.Artist_ID
        WHERE 1=1
    """
    params = []
    if artist_id:
        query += " AND t.Artist_ID = %s"
        params.append(artist_id)
    query += " ORDER BY t.Start_Date DESC"

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            tours = cursor.fetchall()
        return jsonify({"success": True, "count": len(tours), "data": serialize_dates(tours)})
    finally:
        conn.close()

@app.route('/api/tours', methods=['POST'])
def add_tour():
    """Add a new tour for an artist."""
    data = request.get_json() or {}
    artist_id = data.get('Artist_ID')
    tour_name = data.get('Tour_Name')
    start_date = data.get('Start_Date')
    end_date = data.get('End_Date')

    if not all([artist_id, tour_name, start_date, end_date]):
        return jsonify({"success": False, "error": "Artist_ID, Tour_Name, Start_Date, and End_Date are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Tours (Artist_ID, Tour_Name, Start_Date, End_Date) VALUES (%s, %s, %s, %s)",
                (artist_id, tour_name, start_date, end_date)
            )
            tour_id = cursor.lastrowid
        return jsonify({"success": True, "message": "Tour created successfully", "Tour_ID": tour_id}), 201
    finally:
        conn.close()

# -----------------------------------------------------------------------------
# 4. Concerts Endpoints
# -----------------------------------------------------------------------------
@app.route('/api/concerts', methods=['GET'])
def get_concerts():
    """Get all concerts with tour and artist details."""
    tour_id = request.args.get('tour_id')
    city = request.args.get('city')
    
    query = """
        SELECT c.Concert_ID, c.Concert_Date, c.Venue, c.City, 
               t.Tour_ID, t.Tour_Name, a.Artist_ID, a.Artist_Name
        FROM Concerts c
        JOIN Tours t ON c.Tour_ID = t.Tour_ID
        JOIN Artists a ON t.Artist_ID = a.Artist_ID
        WHERE 1=1
    """
    params = []
    if tour_id:
        query += " AND c.Tour_ID = %s"
        params.append(tour_id)
    if city:
        query += " AND c.City LIKE %s"
        params.append(f"%{city}%")
    query += " ORDER BY c.Concert_Date DESC"

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            concerts = cursor.fetchall()
        return jsonify({"success": True, "count": len(concerts), "data": serialize_dates(concerts)})
    finally:
        conn.close()

@app.route('/api/concerts', methods=['POST'])
def add_concert():
    """Add a new concert event."""
    data = request.get_json() or {}
    tour_id = data.get('Tour_ID')
    concert_date = data.get('Concert_Date')
    venue = data.get('Venue')
    city = data.get('City')

    if not all([tour_id, concert_date, venue, city]):
        return jsonify({"success": False, "error": "Tour_ID, Concert_Date, Venue, and City are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Concerts (Tour_ID, Concert_Date, Venue, City) VALUES (%s, %s, %s, %s)",
                (tour_id, concert_date, venue, city)
            )
            concert_id = cursor.lastrowid
        return jsonify({"success": True, "message": "Concert created successfully", "Concert_ID": concert_id}), 201
    finally:
        conn.close()

# -----------------------------------------------------------------------------
# 5. Songs Endpoints
# -----------------------------------------------------------------------------
@app.route('/api/songs', methods=['GET'])
def get_songs():
    """Get list of songs with optional artist filter."""
    artist_id = request.args.get('artist_id')
    query = """
        SELECT s.Song_ID, s.Song_Name, s.Album, a.Artist_ID, a.Artist_Name
        FROM Songs s
        JOIN Artists a ON s.Artist_ID = a.Artist_ID
        WHERE 1=1
    """
    params = []
    if artist_id:
        query += " AND s.Artist_ID = %s"
        params.append(artist_id)
    query += " ORDER BY a.Artist_Name, s.Song_Name"

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            songs = cursor.fetchall()
        return jsonify({"success": True, "count": len(songs), "data": serialize_dates(songs)})
    finally:
        conn.close()

@app.route('/api/songs', methods=['POST'])
def add_song():
    """Add a new song."""
    data = request.get_json() or {}
    artist_id = data.get('Artist_ID')
    song_name = data.get('Song_Name')
    album = data.get('Album')

    if not all([artist_id, song_name, album]):
        return jsonify({"success": False, "error": "Artist_ID, Song_Name, and Album are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Songs (Artist_ID, Song_Name, Album) VALUES (%s, %s, %s)",
                (artist_id, song_name, album)
            )
            song_id = cursor.lastrowid
        return jsonify({"success": True, "message": "Song created successfully", "Song_ID": song_id}), 201
    finally:
        conn.close()

# -----------------------------------------------------------------------------
# 6. Setlists & Views Endpoints
# -----------------------------------------------------------------------------
@app.route('/api/setlists/<int:concert_id>', methods=['GET'])
def get_concert_setlist(concert_id):
    """Retrieve full setlist for a specific concert using ConcertSetlistView."""
    query = "SELECT * FROM ConcertSetlistView WHERE Concert_ID = %s ORDER BY Song_Order ASC"
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, (concert_id,))
            setlist = cursor.fetchall()
        return jsonify({"success": True, "concert_id": concert_id, "count": len(setlist), "setlist": serialize_dates(setlist)})
    finally:
        conn.close()

@app.route('/api/setlists', methods=['POST'])
def add_song_to_setlist():
    """Add or set a song order in a concert setlist."""
    data = request.get_json() or {}
    concert_id = data.get('Concert_ID')
    song_id = data.get('Song_ID')
    song_order = data.get('Song_Order')

    if not all([concert_id, song_id, song_order]):
        return jsonify({"success": False, "error": "Concert_ID, Song_ID, and Song_Order are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Setlists (Concert_ID, Song_ID, Song_Order) VALUES (%s, %s, %s)",
                (concert_id, song_id, song_order)
            )
        return jsonify({"success": True, "message": "Song added to setlist successfully"}), 201
    finally:
        conn.close()

@app.route('/api/views/concert-setlist', methods=['GET'])
def get_view_concert_setlist():
    """Query View 1: ConcertSetlistView."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM ConcertSetlistView LIMIT 200;")
            rows = cursor.fetchall()
        return jsonify({"success": True, "count": len(rows), "data": serialize_dates(rows)})
    finally:
        conn.close()

@app.route('/api/views/song-history', methods=['GET'])
def get_view_song_history():
    """Query View 2: SongPerformanceHistory."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM SongPerformanceHistory ORDER BY Times_Played DESC;")
            rows = cursor.fetchall()
        return jsonify({"success": True, "count": len(rows), "data": serialize_dates(rows)})
    finally:
        conn.close()

if __name__ == '__main__':
    print(f"🎸 Concert Setlist & Tour Archive Flask Server starting on http://localhost:{Config.PORT}")
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
