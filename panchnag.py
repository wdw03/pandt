"""
ProKerala Complete API - Panchang + Daily Horoscope
Fetches ALL data from API for all 12 zodiac signs
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time
from datetime import datetime, timezone, timedelta

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────
import os
CLIENT_ID     = os.environ.get("PROKERALA_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("PROKERALA_CLIENT_SECRET", "")
if not CLIENT_ID or not CLIENT_SECRET:
    raise RuntimeError(
        "ProKerala credentials missing. Set PROKERALA_CLIENT_ID and "
        "PROKERALA_CLIENT_SECRET environment variables (e.g. via .env)."
    )

TOKEN_URL     = "https://api.prokerala.com/token"
PANCHANG_URL  = "https://api.prokerala.com/v2/astrology/panchang"
HOROSCOPE_URL = "https://api.prokerala.com/v2/horoscope/daily/advanced"
AYANAMSA      = 1

IST = timezone(timedelta(hours=5, minutes=30))

# ─────────────────────────────────────────
#  ZODIAC SIGNS
# ─────────────────────────────────────────
ZODIAC_SIGNS = {
    "aries": {"name": "Aries", "hindi": "मेष", "symbol": "♈"},
    "taurus": {"name": "Taurus", "hindi": "वृषभ", "symbol": "♉"},
    "gemini": {"name": "Gemini", "hindi": "मिथुन", "symbol": "♊"},
    "cancer": {"name": "Cancer", "hindi": "कर्क", "symbol": "♋"},
    "leo": {"name": "Leo", "hindi": "सिंह", "symbol": "♌"},
    "virgo": {"name": "Virgo", "hindi": "कन्या", "symbol": "♍"},
    "libra": {"name": "Libra", "hindi": "तुला", "symbol": "♎"},
    "scorpio": {"name": "Scorpio", "hindi": "वृश्चिक", "symbol": "♏"},
    "sagittarius": {"name": "Sagittarius", "hindi": "धनु", "symbol": "♐"},
    "capricorn": {"name": "Capricorn", "hindi": "मकर", "symbol": "♑"},
    "aquarius": {"name": "Aquarius", "hindi": "कुंभ", "symbol": "♒"},
    "pisces": {"name": "Pisces", "hindi": "मीन", "symbol": "♓"}
}

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
#  TOKEN MANAGER
# ─────────────────────────────────────────
class TokenManager:
    def __init__(self):
        self._token = None
        self._expires_at = 0

    def get_token(self):
        if time.time() >= (self._expires_at - 60):
            self._refresh()
        return self._token

    def _refresh(self):
        print("🔄 Refreshing token...")
        resp = requests.post(TOKEN_URL, data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        })
        resp.raise_for_status()
        data = resp.json()
        self._token = data["access_token"]
        self._expires_at = time.time() + data["expires_in"]
        print(f"✅ Token refreshed! Valid for {data['expires_in']//60} minutes")

token_manager = TokenManager()


# ─────────────────────────────────────────
#  HELPER FUNCTIONS
# ─────────────────────────────────────────
def format_time_12hr(iso_str):
    try:
        dt = datetime.fromisoformat(iso_str)
        return dt.strftime("%I:%M:%S %p")
    except:
        return "N/A"

def get_lunar_month_from_date():
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
    tithi_map = {
        "Pratipada": 1, "Dwitiya": 2, "Tritiya": 3, "Chaturthi": 4,
        "Panchami": 5, "Shashthi": 6, "Saptami": 7, "Ashtami": 8,
        "Navami": 9, "Dashami": 10, "Ekadashi": 11, "Dwadashi": 12,
        "Trayodashi": 13, "Chaturdashi": 14, "Purnima": 15, "Amavasya": 30
    }
    tithi_num = tithi_map.get(tithi_name, 7)
    
    if paksha == "Shukla Paksha":
        days_to_full = 15 - tithi_num
        days_to_new = days_to_full + 15
    else:
        days_to_new = 15 - tithi_num
        days_to_full = days_to_new + 15
    
    full_moon_date = date + timedelta(days=days_to_full)
    new_moon_date = date + timedelta(days=days_to_new)
    
    return {
        "full_moon": full_moon_date.strftime("%a %b %d %Y"),
        "new_moon": new_moon_date.strftime("%a %b %d %Y")
    }


# ─────────────────────────────────────────
#  PANCHANG FUNCTIONS
# ─────────────────────────────────────────
def fetch_panchang(coordinates, date_str):
    try:
        date = datetime.fromisoformat(date_str).replace(tzinfo=IST)
    except:
        date = datetime.now(IST)
    
    datetime_str = date.strftime("%Y-%m-%dT%H:%M:%S+05:30")
    token = token_manager.get_token()
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "ayanamsa": AYANAMSA,
        "coordinates": coordinates,
        "datetime": datetime_str,
    }

    resp = requests.get(PANCHANG_URL, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json(), date


def create_panchang_json(raw_data, city_name, date):
    d = raw_data.get("data", {})
    
    tithi_obj = d.get("tithi", [{}])[0]
    nakshatra_obj = d.get("nakshatra", [{}])[0]
    yoga_obj = d.get("yoga", [{}])[0]
    karana_obj = d.get("karana", [{}])[0]
    
    paksha = tithi_obj.get("paksha", "N/A")
    tithi_name = tithi_obj.get("name", "N/A")
    nakshatra_name = nakshatra_obj.get("name", "N/A")
    
    rasi = NAKSHATRA_TO_RASI.get(nakshatra_name, "N/A")
    lunar_months = get_lunar_month_from_date()
    moon_phases = calculate_moon_phases(tithi_name, paksha, date)

    return {
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
                "name": rasi
            }
        },
        "timings_and_lunar_notes": {
            "sunrise": {"code": "SR", "label": "Sunrise", "time": format_time_12hr(d.get("sunrise", ""))},
            "sunset": {"code": "SS", "label": "Sunset", "time": format_time_12hr(d.get("sunset", ""))},
            "moonrise": {"code": "MR", "label": "Moonrise", "time": format_time_12hr(d.get("moonrise", ""))},
            "moonset": {"code": "MS", "label": "Moonset", "time": format_time_12hr(d.get("moonset", ""))},
            "next_full_moon": {"code": "FM", "label": "Next Full Moon", "date": moon_phases["full_moon"]},
            "next_new_moon": {"code": "NM", "label": "Next New Moon", "date": moon_phases["new_moon"]},
            "amanta_month": {"code": "AM", "label": "Amanta Month", "name": lunar_months["amanta"]},
            "paksha": {"code": "PK", "label": "Paksha", "name": paksha},
            "purnimanta": {"code": "PM", "label": "Purnimanta", "name": lunar_months["purnimanta"]}
        }
    }


# ─────────────────────────────────────────
#  HOROSCOPE FUNCTIONS
# ─────────────────────────────────────────
def fetch_horoscope(zodiac_sign: str, horoscope_type: str, date_str: str):
    """
    Fetch an advanced daily horoscope from the ProKerala API.

    The ProKerala API expects the following query parameters on the
    `/horoscope/daily/advanced` endpoint:

      * ``sign`` — the zodiac sign (e.g., ``"aries"``) or ``"all"`` to fetch all signs.
      * ``type`` — the type of prediction (``"general"``, ``"love"``, ``"career"``, ``"health"``, or ``"all"``).
      * ``datetime`` — an ISO‑8601 date/time string with timezone (e.g., ``2026-05-08T00:00:00+05:30``).

    Passing incorrect parameter names (like ``zodiac`` and ``date``) will result in a
    500 error from the ProKerala API. This function constructs the correct
    parameters and issues the API call. The timezone offset is inserted with
    a colon (e.g. ``+05:30``) to satisfy the API requirement. ``requests``
    handles encoding of the plus sign.

    Parameters
    ----------
    zodiac_sign : str
        The zodiac sign (e.g. ``"aries"``) or ``"all"`` for all signs.
    horoscope_type : str
        The type of prediction to fetch.
    date_str : str
        The date for which to fetch predictions, in YYYY-MM-DD or ISO format.

    Returns
    -------
    dict
        The parsed JSON response from the API.
    """
    # Parse the input date; if parsing fails, use now in IST
    try:
        date = datetime.fromisoformat(date_str)
    except Exception:
        date = datetime.now(IST)

    # Ensure timezone awareness; attach IST if missing
    if date.tzinfo is None:
        date = date.replace(tzinfo=IST)

    # Format datetime string with colon in timezone
    dt = date.strftime("%Y-%m-%dT%H:%M:%S%z")
    if len(dt) >= 5:
        dt = dt[:-2] + ":" + dt[-2:]

    token = token_manager.get_token()
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "sign": zodiac_sign,
        "type": horoscope_type,
        "datetime": dt
    }

    resp = requests.get(HOROSCOPE_URL, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()


def create_horoscope_json(raw_data, zodiac_sign, date):
    """
    Format horoscope data into clean JSON
    """
    d = raw_data.get("data", {})
    sign_info = ZODIAC_SIGNS.get(zodiac_sign, {})
    
    return {
        "zodiac_sign": sign_info.get("name", zodiac_sign.capitalize()),
        "zodiac_sign_hindi": sign_info.get("hindi", ""),
        "symbol": sign_info.get("symbol", ""),
        "date": date.strftime("%Y-%m-%d"),
        "date_formatted": date.strftime("%A, %B %d, %Y"),
        "prediction": d.get("prediction", ""),
        "lucky_color": d.get("lucky_color", "N/A"),
        "lucky_number": d.get("lucky_number", "N/A"),
        "lucky_time": d.get("lucky_time", "N/A"),
        "mood": d.get("mood", "N/A"),
        "compatibility": d.get("compatibility", "N/A"),
        "overall_rating": d.get("overall_rating", 0)
    }


def fetch_all_horoscopes(horoscope_type: str, date_str: str):
    """
    Fetch daily horoscopes for all twelve zodiac signs in a single API call.

    Using ``sign=all`` with the ProKerala API allows retrieval of predictions for
    all signs at once, reducing the number of API calls and avoiding 429
    errors. This function then parses the response and formats each sign's
    prediction using :func:`create_horoscope_json`.

    Parameters
    ----------
    horoscope_type : str
        The prediction type (``"general"``, ``"love"``, ``"career"``, ``"health"`` or ``"all"``).
    date_str : str
        The date for which predictions are requested.

    Returns
    -------
    dict
        Mapping from sign code to its formatted prediction.
    """
    try:
        date = datetime.fromisoformat(date_str)
    except Exception:
        date = datetime.now(IST)

    # Call the API once for all signs
    try:
        raw_data = fetch_horoscope("all", horoscope_type, date_str)
    except Exception as e:
        # If the API fails, return error entries for all signs
        result = {}
        for code, info in ZODIAC_SIGNS.items():
            result[code] = {"zodiac_sign": info["name"], "error": str(e)}
        return result

    data = raw_data.get("data", {})
    predictions = data.get("daily_predictions", [])

    # Create a lookup by sign name (lowercase)
    lookup = {}
    for entry in predictions:
        name = entry.get("sign", {}).get("name", "").lower()
        lookup[name] = entry

    all_horoscopes = {}
    for sign_code, sign_info in ZODIAC_SIGNS.items():
        try:
            entry = lookup.get(sign_code)
            if not entry:
                raise ValueError(f"No prediction found for {sign_info['name']}")
            pred_list = entry.get("predictions", [])
            selected = None
            if horoscope_type.lower() == "all":
                selected = pred_list[0] if pred_list else None
            else:
                for p in pred_list:
                    if p.get("type", "").lower() == horoscope_type.lower():
                        selected = p
                        break
            if selected:
                clean_data = {"data": {"prediction": selected.get("prediction", "")}}
            else:
                clean_data = {"data": {"prediction": ""}}
            horoscope = create_horoscope_json(clean_data, sign_code, date)
            all_horoscopes[sign_code] = horoscope
        except Exception as e:
            all_horoscopes[sign_code] = {
                "zodiac_sign": sign_info["name"],
                "error": str(e)
            }

    return all_horoscopes


# ─────────────────────────────────────────
#  FLASK ROUTES
# ─────────────────────────────────────────

@app.route('/api/panchang', methods=['GET'])
def get_panchang():
    """
    GET /api/panchang?lat=25.5941&lng=85.1376&date=2026-05-07&city=Patna
    """
    try:
        lat = request.args.get('lat', '25.5941')
        lng = request.args.get('lng', '85.1376')
        date_str = request.args.get('date', datetime.now(IST).isoformat())
        city_name = request.args.get('city', 'Unknown')
        
        coordinates = f"{lat},{lng}"
        raw_data, date = fetch_panchang(coordinates, date_str)
        panchang_json = create_panchang_json(raw_data, city_name, date)
        
        return jsonify({"status": "success", "data": panchang_json})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/horoscope/<zodiac_sign>', methods=['GET'])
def get_single_horoscope(zodiac_sign):
    """
    GET /api/horoscope/aries?type=general&date=2026-05-07
    
    Types: general, love, career, health
    """
    try:
        if zodiac_sign not in ZODIAC_SIGNS:
            return jsonify({
                "status": "error",
                "message": f"Invalid zodiac sign. Use one of: {', '.join(ZODIAC_SIGNS.keys())}"
            }), 400
        
        horoscope_type = request.args.get('type', 'general')
        date_str = request.args.get('date', datetime.now(IST).isoformat())
        
        raw_data = fetch_horoscope(zodiac_sign, horoscope_type, date_str)
        
        try:
            date = datetime.fromisoformat(date_str)
        except:
            date = datetime.now(IST)
        
        horoscope = create_horoscope_json(raw_data, zodiac_sign, date)
        
        return jsonify({"status": "success", "data": horoscope})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/horoscope/all', methods=['GET'])
def get_all_horoscopes():
    """
    GET /api/horoscope/all?type=general&date=2026-05-07
    
    Returns horoscopes for all 12 zodiac signs
    Types: general, love, career, health
    """
    try:
        horoscope_type = request.args.get('type', 'general')
        date_str = request.args.get('date', datetime.now(IST).isoformat())
        
        all_horoscopes = fetch_all_horoscopes(horoscope_type, date_str)
        
        return jsonify({
            "status": "success",
            "type": horoscope_type,
            "date": date_str,
            "data": all_horoscopes
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/zodiac-signs', methods=['GET'])
def get_zodiac_signs():
    """
    GET /api/zodiac-signs
    
    Returns list of all zodiac signs
    """
    return jsonify({
        "status": "success",
        "data": ZODIAC_SIGNS
    })


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
    """Health check"""
    return jsonify({
        "status": "healthy",
        "service": "ProKerala Panchang + Horoscope API",
        "version": "2.0",
        "endpoints": {
            "panchang": "/api/panchang",
            "single_horoscope": "/api/horoscope/{sign}",
            "all_horoscopes": "/api/horoscope/all",
            "zodiac_signs": "/api/zodiac-signs",
            "cities": "/api/cities"
        }
    })


# ─────────────────────────────────────────
#  RUN SERVER
# ─────────────────────────────────────────
if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("   🕉️  PROKERALA COMPLETE API — PANCHANG + HOROSCOPE")
    print("   All 12 Zodiac Signs | 4 Horoscope Types | Auto Token Refresh")
    print("=" * 70)
    print("\n📡 API Endpoints:")
    print("   GET  /api/panchang?lat=25.5941&lng=85.1376&city=Patna")
    # Show example horoscope endpoints using today's date.  The Prokerala
    # daily horoscope API only supports yesterday, today and tomorrow.  We
    # therefore insert the current date to demonstrate how to call the API.
    today_str = datetime.now(IST).strftime("%Y-%m-%d")
    print(f"   GET  /api/horoscope/aries?type=general&date={today_str}")
    print(f"   GET  /api/horoscope/all?type=general&date={today_str}")
    print("   GET  /api/zodiac-signs")
    print("   GET  /api/cities")
    print("   GET  /health")
    print("\n🎯 Horoscope Types: general, love, career, health")
    print("🌟 Zodiac Signs: aries, taurus, gemini, cancer, leo, virgo,")
    print("                 libra, scorpio, sagittarius, capricorn, aquarius, pisces")
    print("\n🚀 Starting server on http://localhost:5001\n")
    
    app.run(debug=True, host='0.0.0.0', port=5001)