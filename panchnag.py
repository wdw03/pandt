import requests
import json
import time
from datetime import datetime, timezone, timedelta

# ─────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────
CLIENT_ID     = "d45fe2a1-99f9-4b48-ae08-ae8fb6abe1a6"
CLIENT_SECRET = "wWkGgybm8WEigOqCrCdTAKKiLbQkAPUiDIFiWQn2"

TOKEN_URL     = "https://api.prokerala.com/token"
PANCHANG_URL  = "https://api.prokerala.com/v2/astrology/panchang"
AYANAMSA      = 1  # 1 = Lahiri (standard)

# IST timezone
IST = timezone(timedelta(hours=5, minutes=30))

# ─────────────────────────────────────────
#  INDIA CITIES
# ─────────────────────────────────────────
CITIES = {
    "1":  {"name": "Patna",         "coordinates": "25.5941,85.1376"},
    "2":  {"name": "Delhi",         "coordinates": "28.6139,77.2090"},
    "3":  {"name": "Mumbai",        "coordinates": "19.0760,72.8777"},
    "4":  {"name": "Kolkata",       "coordinates": "22.5726,88.3639"},
    "5":  {"name": "Chennai",       "coordinates": "13.0827,80.2707"},
    "6":  {"name": "Bangalore",     "coordinates": "12.9716,77.5946"},
    "7":  {"name": "Hyderabad",     "coordinates": "17.3850,78.4867"},
    "8":  {"name": "Ahmedabad",     "coordinates": "23.0225,72.5714"},
    "9":  {"name": "Pune",          "coordinates": "18.5204,73.8567"},
    "10": {"name": "Jaipur",        "coordinates": "26.9124,75.7873"},
    "11": {"name": "Lucknow",       "coordinates": "26.8467,80.9462"},
    "12": {"name": "Varanasi",      "coordinates": "25.3176,82.9739"},
    "13": {"name": "Prayagraj",     "coordinates": "25.4358,81.8463"},
    "14": {"name": "Indore",        "coordinates": "22.7196,75.8577"},
    "15": {"name": "Bhopal",        "coordinates": "23.2599,77.4126"},
    "16": {"name": "Nagpur",        "coordinates": "21.1458,79.0882"},
    "17": {"name": "Surat",         "coordinates": "21.1702,72.8311"},
    "18": {"name": "Chandigarh",    "coordinates": "30.7333,76.7794"},
    "19": {"name": "Amritsar",      "coordinates": "31.6340,74.8723"},
    "20": {"name": "Dehradun",      "coordinates": "30.3165,78.0322"},
    "21": {"name": "Ranchi",        "coordinates": "23.3441,85.3096"},
    "22": {"name": "Bhubaneswar",   "coordinates": "20.2961,85.8245"},
    "23": {"name": "Guwahati",      "coordinates": "26.1445,91.7362"},
    "24": {"name": "Thiruvananthapuram", "coordinates": "8.5241,76.9366"},
    "25": {"name": "Kochi",         "coordinates": "9.9312,76.2673"},
}


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
        print("\n🔄 Token refresh ho raha hai...")
        try:
            resp = requests.post(TOKEN_URL, data={
                "grant_type":    "client_credentials",
                "client_id":     CLIENT_ID,
                "client_secret": CLIENT_SECRET,
            })
            resp.raise_for_status()
            data = resp.json()
            self._token      = data["access_token"]
            self._expires_at = time.time() + data["expires_in"]
            mins = data["expires_in"] // 60
            print(f"✅ Token mila! {mins} minutes valid.\n")
        except Exception as e:
            print(f"❌ Token error: {e}")
            raise


# ─────────────────────────────────────────
#  PANCHANG FETCH
# ─────────────────────────────────────────
def get_panchang_raw(token_manager, coordinates, date=None):
    """Raw API response fetch karo"""
    if date is None:
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
    return resp.json()


# ─────────────────────────────────────────
#  JSON FORMATTER — Exact UI Structure
# ─────────────────────────────────────────
def format_time_12hr(iso_str):
    """ISO time ko 12-hour format mein convert karo"""
    try:
        dt = datetime.fromisoformat(iso_str)
        return dt.strftime("%I:%M:%S %p")
    except:
        return "N/A"


def create_panchang_json(raw_data, city_name, date):
    """
    API response se exact UI structure banao
    Tumhare image ke hisaab se format
    """
    d = raw_data.get("data", {})
    
    # Extract first elements
    tithi_obj = d.get("tithi", [{}])[0]
    nakshatra_obj = d.get("nakshatra", [{}])[0]
    yoga_obj = d.get("yoga", [{}])[0]
    karana_obj = d.get("karana", [{}])[0]
    
    paksha = tithi_obj.get("paksha", "N/A")

    # Final JSON structure exactly as your UI
    panchang_data = {
        "selected_date": date.strftime("%A, %B %d, %Y").upper(),
        "date_iso": date.strftime("%Y-%m-%d"),
        "location": city_name,
        
        "daily_core_details": {
            "tithi": {
                "code": "TI",
                "label": "Tithi",
                "name": tithi_obj.get("name", "N/A"),
                "paksha": paksha
            },
            "nakshatra": {
                "code": "NA",
                "label": "Nakshatra",
                "name": nakshatra_obj.get("name", "N/A"),
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
                "name": "Gemini"  # Placeholder - API doesn't provide directly
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
                "date": "Fri May 01 2026"  # Placeholder
            },
            "next_new_moon": {
                "code": "NM",
                "label": "Next New Moon",
                "date": "Sat May 16 2026"  # Placeholder
            },
            "amanta_month": {
                "code": "AM",
                "label": "Amanta Month",
                "name": "Vaisakha"  # Placeholder
            },
            "paksha": {
                "code": "PK",
                "label": "Paksha",
                "name": paksha
            },
            "purnimanta": {
                "code": "PM",
                "label": "Purnimanta",
                "name": "Jyeshta"  # Placeholder
            }
        }
    }
    
    return panchang_data


# ─────────────────────────────────────────
#  DISPLAY
# ─────────────────────────────────────────
def display_panchang(panchang_json):
    """Pretty print formatted data"""
    core = panchang_json["daily_core_details"]
    timings = panchang_json["timings_and_lunar_notes"]
    
    print("\n" + "=" * 60)
    print(f"       🕉️  PANCHANG — {panchang_json['location'].upper()}")
    print(f"       {panchang_json['selected_date']}")
    print("=" * 60)
    
    print("\n📋 DAILY CORE DETAILS")
    print("─" * 60)
    print(f"  {core['tithi']['code']}  {core['tithi']['label']:12} : {core['tithi']['name']}")
    print(f"  {core['nakshatra']['code']}  {core['nakshatra']['label']:12} : {core['nakshatra']['name']}")
    print(f"  {core['yoga']['code']}  {core['yoga']['label']:12} : {core['yoga']['name']}")
    print(f"  {core['karana']['code']}  {core['karana']['label']:12} : {core['karana']['name']}")
    print(f"  {core['rasi']['code']}  {core['rasi']['label']:12} : {core['rasi']['name']}")
    
    print("\n🕐 TIMINGS & LUNAR NOTES")
    print("─" * 60)
    print(f"  {timings['sunrise']['code']}  {timings['sunrise']['label']:18} : {timings['sunrise']['time']}")
    print(f"  {timings['sunset']['code']}  {timings['sunset']['label']:18} : {timings['sunset']['time']}")
    print(f"  {timings['moonrise']['code']}  {timings['moonrise']['label']:18} : {timings['moonrise']['time']}")
    print(f"  {timings['moonset']['code']}  {timings['moonset']['label']:18} : {timings['moonset']['time']}")
    print(f"  {timings['next_full_moon']['code']}  {timings['next_full_moon']['label']:18} : {timings['next_full_moon']['date']}")
    print(f"  {timings['next_new_moon']['code']}  {timings['next_new_moon']['label']:18} : {timings['next_new_moon']['date']}")
    print(f"  {timings['amanta_month']['code']}  {timings['amanta_month']['label']:18} : {timings['amanta_month']['name']}")
    print(f"  {timings['paksha']['code']}  {timings['paksha']['label']:18} : {timings['paksha']['name']}")
    print(f"  {timings['purnimanta']['code']}  {timings['purnimanta']['label']:18} : {timings['purnimanta']['name']}")
    print("=" * 60)


# ─────────────────────────────────────────
#  SAVE JSON
# ─────────────────────────────────────────
def save_json(data, city_name, date):
    filename = f"panchang_{city_name.lower()}_{date.strftime('%Y%m%d')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\n💾 JSON saved: {filename}")
    return filename


# ─────────────────────────────────────────
#  CITY SELECTOR
# ─────────────────────────────────────────
def select_city():
    print("\n" + "=" * 60)
    print("        🇮🇳  SELECT YOUR CITY")
    print("=" * 60)
    for key, city in CITIES.items():
        print(f"  {key:>2}.  {city['name']}")
    print("=" * 60)

    while True:
        choice = input("\nEnter city number (1-25): ").strip()
        if choice in CITIES:
            return CITIES[choice]
        else:
            print("❌ Invalid! Enter 1-25.")


# ─────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────
def main():
    print("\n" + "=" * 60)
    print("       🕉️  PROKERALA PANCHANG API FETCHER")
    print("          Auto Token Refresh | 25 Indian Cities")
    print("=" * 60)

    token_manager = TokenManager()

    while True:
        city = select_city()
        city_name   = city["name"]
        coordinates = city["coordinates"]
        
        # Date input (optional - default today)
        use_custom = input("\nUse custom date? (y/n, default=today): ").strip().lower()
        if use_custom == "y":
            date_str = input("Enter date (YYYY-MM-DD): ").strip()
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=IST)
            except:
                print("❌ Invalid format! Using today.")
                date = datetime.now(IST)
        else:
            date = datetime.now(IST)

        print(f"\n⏳ Fetching panchang for {city_name} on {date.strftime('%d %b %Y')}...")

        try:
            # Get raw API data
            raw_data = get_panchang_raw(token_manager, coordinates, date)
            
            # Format into your structure
            panchang_json = create_panchang_json(raw_data, city_name, date)
            
            # Display
            display_panchang(panchang_json)
            
            # Save option
            save = input("\n💾 Save JSON file? (y/n): ").strip().lower()
            if save == "y":
                filename = save_json(panchang_json, city_name, date)
                print(f"\n✅ File saved successfully!")
                
                # Pretty print saved JSON sample
                print(f"\n📄 JSON Structure Preview:")
                print(json.dumps(panchang_json, indent=2, ensure_ascii=False))

        except requests.exceptions.HTTPError as e:
            print(f"\n❌ API Error: {e}")
            try:
                error_detail = e.response.json()
                print(f"   Detail: {json.dumps(error_detail, indent=2)}")
            except:
                pass
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()

        # Continue?
        again = input("\n🔄 Fetch another panchang? (y/n): ").strip().lower()
        if again != "y":
            print("\n🙏 Thank you! Jai Hind!\n")
            break


if __name__ == "__main__":
    main()