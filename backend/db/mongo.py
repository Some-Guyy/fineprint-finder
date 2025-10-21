import os
from pymongo import MongoClient

db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
URI = f"mongodb+srv://{db_user}:{db_pass}@fypwhere.u27axc2.mongodb.net/?retryWrites=true&w=majority&appName=fypwhere"
mongo_client = MongoClient(URI)
db = mongo_client["fypwhere"]
regulation_collection = db["regulations"]
user_collection = db["users"]
notification_collection = db["notifications"]