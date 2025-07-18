from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client.get_default_database()

# Drop existing users for a clean start (optional)
# db.users.drop()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Lead Analyst with `can_create_users`
lead_analyst = {
    "username": "lead_analyst",
    "password": hash_password("password123"),
    "role": "Analyst",
    "organizationId": "1",
    "can_create_users": True
}

# IT User
it_user = {
    "username": "it_user",
    "password": hash_password("password123"),
    "role": "IT",
    "organizationId": "1"
}

# Regular User
regular_user = {
    "username": "regular_user",
    "password": hash_password("password123"),
    "role": "User",
    "organizationId": "1"
}

users = [lead_analyst, it_user, regular_user]

for user in users:
    if db.users.find_one({"username": user["username"]}):
        print(f"User {user['username']} already exists, skipping.")
    else:
        db.users.insert_one(user)
        print(f"Inserted {user['username']}")

print("Done seeding.")
