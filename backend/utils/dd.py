from pymongo import MongoClient
from pymongo.server_api import ServerApi

# MongoDB Connection URI
uri = "mongodb+srv://saransh9373:saransh9373@pandits.0yvnq0n.mongodb.net/?retryWrites=true&w=majority"

try:
    # Create MongoDB client
    client = MongoClient(uri, server_api=ServerApi('1'))

    # Ping the database
    client.admin.command('ping')

    print("✅ MongoDB Connected Successfully!")

    # Optional: Show all databases
    print("📂 Databases:")
    print(client.list_database_names())

except Exception as e:
    print("❌ Connection Failed!")
    print(e)