import json
import urllib.request
import urllib.error

API_BASE = 'http://localhost:5000/api'

def post(endpoint, data):
    url = f"{API_BASE}{endpoint}"
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            resp_data = json.load(resp)
            if not resp_data.get('success'):
                raise Exception(f"API error: {resp_data.get('message')}")
            return resp_data
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise Exception(f"HTTP error {e.code}: {err}")
    except Exception as e:
        raise e

def main():
    # 1. Add Indian artist
    artist = {
        "Artist_Name": "A.R. Rahman",
        "Genre": "Film Score",
        "Country": "India"
    }
    artist_resp = post('/artists', artist)
    artist_id = artist_resp.get('Artist_ID') or artist_resp.get('data', {}).get('Artist_ID')
    print('Created artist ID:', artist_id)

    # 2. Add tour for the artist
    tour = {
        "Artist_ID": artist_id,
        "Tour_Name": "India Tour 2026",
        "Start_Date": "2026-09-20",
        "End_Date": "2026-10-20"
    }
    tour_resp = post('/tours', tour)
    tour_id = tour_resp.get('Tour_ID') or tour_resp.get('data', {}).get('Tour_ID')
    print('Created tour ID:', tour_id)

    # 3. Add concerts in major Indian cities
    concerts = [
        {"Tour_ID": tour_id, "Concert_Date": "2026-09-25", "Venue": "Indira Gandhi Arena", "City": "Delhi"},
        {"Tour_ID": tour_id, "Concert_Date": "2026-09-30", "Venue": "NSCI Dome", "City": "Mumbai"},
        {"Tour_ID": tour_id, "Concert_Date": "2026-10-05", "Venue": "Bangalore Palace", "City": "Bangalore"},
        {"Tour_ID": tour_id, "Concert_Date": "2026-10-10", "Venue": "Nicco Park", "City": "Kolkata"},
        {"Tour_ID": tour_id, "Concert_Date": "2026-10-15", "Venue": "Hyderabad International Convention Center", "City": "Hyderabad"}
    ]
    for c in concerts:
        resp = post('/concerts', c)
        print('Added concert:', resp.get('Concert_ID') or resp.get('data'))

if __name__ == '__main__':
    main()
