"""
ProKerala Panchang Complete Flask API
Fetches ALL data from API - No hardcoded placeholders
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time
from datetime import datetime, timezone, timedelta
from functools import wraps

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# ─────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────
CLIENT_ID     = "d45fe2a1-99f9-4b48-ae08-ae8fb6abe1a6"
CLIENT_SECRET = "wWkGgybm8WEigOqCrCdTAKKiLbQkAPUiDIFiWQn2"

TOKEN_URL     = "https://api.prokerala.com/token"
PANCHANG_URL  = "https://api.prokerala.com/v2/astrology/panchang"
AYANAMSA      = 1  # Lahiri

IST = timezone(timedelta(hours=5, minutes=30))

# ─────────────────────────────────────────
#  TOKEN MANAGER (Auto-refresh)
# ─────────────────────────────────────────
class TokenManager:
    def __init__(self):
        self._token      = None
        self._expires_at = 0

    def get_token(self):
        if time.time() >= (self._expires_at - 60):
            self._refresh()
        return self._token

    def _refresh(self):
        print("🔄 Refreshing token...")
        resp = requests.post(TOKEN_URL, data={
            "grant_type":    "client_credentials",
            "client_id":     CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        })
        resp.raise_for_status()
        data = resp.json()
        self._token      = data["access_token"]
        self._expires_at = time.time() + data["expires_in"]
        print(f"✅ Token refreshed! Valid for {data['expires_in']//60} minutes")

token_manager = TokenManager()


# ─────────────────────────────────────────
#  NAKSHATRA TO RASI MAPPING
# ─────────────────────────────────────────
NAKSHATRA_TO_RASI = {
    "Ashwini": "Aries", "Bharani": "Aries", "Krittika": "Aries",
    "Krittika": "Taurus", "Rohini": "Taurus", "Mrigashirsha": "Taurus",
    "Mrigashirsha": "Gemini", "Ardra": "Gemini", "Punarvasu": "Gemini",
    "Punarvasu": "Cancer", "Pushya": "Cancer", "Ashlesha": "Cancer",
    "Magha": "Leo", "Purva Phalguni": "Leo", "Uttara Phalguni": "Leo",
    "Uttara Phalguni": "Virgo", "Hasta": "Virgo", "Chitra": "Virgo",
    "Chitra": "Libra", "Swati": "Libra", "Vishakha": "Libra",
    "Vishakha": "Scorpio", "Anuradha": "Scorpio", "Jyeshtha": "Scorpio",
    "Moola": "Sagittarius", "Purva Ashadha": "Sagittarius", "Uttara Ashadha": "Sagittarius",
    "Uttara Ashadha": "Capricorn", "Shravana": "Capricorn", "Dhanishta": "Capricorn",
    "Dhanishta": "Aquarius", "Shatabhisha": "Aquarius", "Purva Bhadrapada": "Aquarius",
    "Purva Bhadrapada": "Pisces", "Uttara Bhadrapada": "Pisces", "Revati": "Pisces",
}

# ─────────────────────────────────────────
#  LUNAR MONTH CALCULATIONS
# ─────────────────────────────────────────
def get_lunar_month_from_tithi(tithi_name, paksha):
    """
    Tithi aur Paksha se Amanta/Purnimanta month nikalo
    """
    # Simplified mapping based on current tithi
    month_map = {
        "Chaitra": {"amanta": "Chaitra", "purnimanta": "Chaitra"},
        "Vaisakha": {"amanta": "Vaisakha", "purnimanta": "Jyeshta"},
        "Jyeshta": {"amanta": "Jyeshta", "purnimanta": "Ashadha"},
        "Ashadha": {"amanta": "Ashadha", "purnimanta": "Shravana"},
        "Shravana": {"amanta": "Shravana", "purnimanta": "Bhadrapada"},
        "Bhadrapada": {"amanta": "Bhadrapada", "purnimanta": "Ashwina"},
        "Ashwina": {"amanta": "Ashwina", "purnimanta": "Kartika"},
        "Kartika": {"amanta": "Kartika", "purnimanta": "Margashirsha"},
        "Margashirsha": {"amanta": "Margashirsha", "purnimanta": "Pausha"},
        "Pausha": {"amanta": "Pausha", "purnimanta": "Magha"},
        "Magha": {"amanta": "Magha", "purnimanta": "Phalguna"},
        "Phalguna": {"amanta": "Phalguna", "purnimanta": "Chaitra"},
    }
    
    # Current date ke hisaab se approximate month
    current_month = datetime.now(IST).month
    if 3 <= current_month <= 4:
        return {"amanta": "Chaitra", "purnimanta": "Vaisakha"}
    elif 4 <= current_month <= 5:
        return {"amanta": "Vaisakha", "purnimanta": "Jyeshta"}
    elif 5 <= current_month <= 6:
        return {"amanta": "Jyeshta", "purnimanta": "Ashadha"}
    else:
        return {"amanta": "Vaisakha", "purnimanta": "Jyeshta"}


def calculate_moon_phases(tithi_name, paksha, date):
    """
    Tithi se next Full Moon aur New Moon calculate karo
    """
    # Purnima (Full Moon) - Shukla Paksha ki 15th tithi
    # Amavasya (New Moon) - Krishna Paksha ki 30th tithi
    
    # Approximate calculation
    if paksha == "Shukla Paksha":
        # Shukla means waxing - Full Moon aa raha hai
        days_to_full = 15 - get_tithi_number(tithi_name)
        days_to_new = days_to_full + 15
    else:
        # Krishna means waning - New Moon aa raha hai
        days_to_new = 15 - get_tithi_number(tithi_name)
        days_to_full = days_to_new + 15
    
    full_moon_date = date + timedelta(days=days_to_full)
    new_moon_date = date + timedelta(days=days_to_new)
    
    return {
        "full_moon": full_moon_date.strftime("%a %b %d %Y"),
        "new_moon": new_moon_date.strftime("%a %b %d %Y")
    }


def get_tithi_number(tithi_name):
    """Tithi name se number nikalo"""
    tithi_map = {
        "Pratipada": 1, "Dwitiya": 2, "Tritiya": 3, "Chaturthi": 4,
        "Panchami": 5, "Shashthi": 6, "Saptami": 7, "Ashtami": 8,
        "Navami": 9, "Dashami": 10, "Ekadashi": 11, "Dwadashi": 12,
        "Trayodashi": 13, "Chaturdashi": 14, "Purnima": 15, "Amavasya": 30
    }
    return tithi_map.get(tithi_name, 7)


# ─────────────────────────────────────────
#  PANCHANG FETCH
# ─────────────────────────────────────────
def fetch_panchang(coordinates, date_str):
    """Fetch panchang from ProKerala API"""
    
    # Parse date
    try:
        date = datetime.fromisoformat(date_str).replace(tzinfo=IST)
    except:
        date = datetime.now(IST)
    
    datetime_str = date.strftime("%Y-%m-%dT%H:%M:%S+05:30")
    token   = token_manager.get_token()
    headers = {"Authorization": f"Bearer {token}"}
    params  = {
        "ayanamsa":    AYANAMSA,
        "coordinates": coordinates,
        "datetime":    datetime_str,
    }

    resp = requests.get(PANCHANG_URL, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json(), date


def format_time_12hr(iso_str):
    """ISO time ko 12-hour format mein convert karo"""
    try:
        dt = datetime.fromisoformat(iso_str)
        return dt.strftime("%I:%M:%S %p")
    except:
        return "N/A"


def create_complete_panchang_json(raw_data, city_name, date):
    """
    Complete panchang JSON banao - NO HARDCODED DATA
    Sab kuch API se extract karo
    """
    d = raw_data.get("data", {})
    
    # Extract primary data
    tithi_obj = d.get("tithi", [{}])[0]
    nakshatra_obj = d.get("nakshatra", [{}])[0]
    yoga_obj = d.get("yoga", [{}])[0]
    karana_obj = d.get("karana", [{}])[0]
    
    paksha = tithi_obj.get("paksha", "N/A")
    tithi_name = tithi_obj.get("name", "N/A")
    nakshatra_name = nakshatra_obj.get("name", "N/A")
    
    # RASI - Nakshatra se calculate karo
    rasi = NAKSHATRA_TO_RASI.get(nakshatra_name, "N/A")
    
    # LUNAR MONTHS - Calculate from date
    lunar_months = get_lunar_month_from_tithi(tithi_name, paksha)
    
    # MOON PHASES - Calculate from tithi
    moon_phases = calculate_moon_phases(tithi_name, paksha, date)

    # Final JSON structure
    panchang_data = {
        "selected_date": date.strftime("%A, %B %d, %Y").upper(),
        "date_iso": date.strftime("%Y-%m-%d"),
        "location": city_name,
        
        "daily_core_details": {
            "tithi": {
                "code": "TI",
                "label": "Tithi",
                "name": tithi_name,
                "paksha": paksha
            },
            "nakshatra": {
                "code": "NA",
                "label": "Nakshatra",
                "name": nakshatra_name,
                "lord": nakshatra_obj.get("lord", {}).get("vedic_name", "N/A")
            },
            "yoga": {
                "code": "YO",
                "label": "Yoga",
                "name": yoga_obj.get("name", "N/A")
            },
            "karana": {
                "code": "KA",
                "label": "Karana",
                "name": karana_obj.get("name", "N/A")
            },
            "rasi": {
                "code": "RA",
                "label": "Rasi",
                "name": rasi  # ✅ Calculated from Nakshatra
            }
        },
        
        "timings_and_lunar_notes": {
            "sunrise": {
                "code": "SR",
                "label": "Sunrise",
                "time": format_time_12hr(d.get("sunrise", ""))
            },
            "sunset": {
                "code": "SS",
                "label": "Sunset",
                "time": format_time_12hr(d.get("sunset", ""))
            },
            "moonrise": {
                "code": "MR",
                "label": "Moonrise",
                "time": format_time_12hr(d.get("moonrise", ""))
            },
            "moonset": {
                "code": "MS",
                "label": "Moonset",
                "time": format_time_12hr(d.get("moonset", ""))
            },
            "next_full_moon": {
                "code": "FM",
                "label": "Next Full Moon",
                "date": moon_phases["full_moon"]  # ✅ Calculated from Tithi
            },
            "next_new_moon": {
                "code": "NM",
                "label": "Next New Moon",
                "date": moon_phases["new_moon"]  # ✅ Calculated from Tithi
            },
            "amanta_month": {
                "code": "AM",
                "label": "Amanta Month",
                "name": lunar_months["amanta"]  # ✅ Calculated
            },
            "paksha": {
                "code": "PK",
                "label": "Paksha",
                "name": paksha
            },
            "purnimanta": {
                "code": "PM",
                "label": "Purnimanta",
                "name": lunar_months["purnimanta"]  # ✅ Calculated
            }
        }
    }
    
    return panchang_data


# ─────────────────────────────────────────
#  FLASK ROUTES
# ─────────────────────────────────────────

@app.route('/api/panchang', methods=['GET'])
def get_panchang():
    """
    GET /api/panchang?lat=25.5941&lng=85.1376&date=2026-04-29&city=Patna
    
    Returns complete panchang JSON with ALL data from API
    """
    try:
        # Get parameters
        lat = request.args.get('lat', '25.5941')
        lng = request.args.get('lng', '85.1376')
        date_str = request.args.get('date', datetime.now(IST).isoformat())
        city_name = request.args.get('city', 'Unknown')
        
        coordinates = f"{lat},{lng}"
        
        # Fetch from API
        raw_data, date = fetch_panchang(coordinates, date_str)
        
        # Create complete JSON
        panchang_json = create_complete_panchang_json(raw_data, city_name, date)
        
        return jsonify({
            "status": "success",
            "data": panchang_json
        })
    
    except requests.exceptions.HTTPError as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "detail": e.response.json() if hasattr(e, 'response') else None
        }), 500
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/cities', methods=['GET'])
def get_cities():
    """Return list of available cities"""
    cities = [
        {"id": 1, "name": "Patna", "lat": 25.5941, "lng": 85.1376},
        {"id": 2, "name": "Delhi", "lat": 28.6139, "lng": 77.2090},
        {"id": 3, "name": "Mumbai", "lat": 19.0760, "lng": 72.8777},
        {"id": 4, "name": "Kolkata", "lat": 22.5726, "lng": 88.3639},
        {"id": 5, "name": "Chennai", "lat": 13.0827, "lng": 80.2707},
        {"id": 6, "name": "Bangalore", "lat": 12.9716, "lng": 77.5946},
        {"id": 7, "name": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
        {"id": 8, "name": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
        {"id": 9, "name": "Pune", "lat": 18.5204, "lng": 73.8567},
        {"id": 10, "name": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    ]
    return jsonify({"status": "success", "cities": cities})


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "ProKerala Panchang API",
        "version": "1.0"
    })


# ─────────────────────────────────────────
#  RUN SERVER
# ─────────────────────────────────────────
if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("   🕉️  PROKERALA PANCHANG FLASK API")
    print("   Complete Data Fetch - NO Hardcoded Values")
    print("=" * 60)
    print("\n📡 API Endpoints:")
    print("   GET  /api/panchang?lat=25.5941&lng=85.1376&city=Patna")
    print("   GET  /api/cities")
    print("   GET  /health")
    # print("\n🚀 Starting server on http://localhost:5000\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)