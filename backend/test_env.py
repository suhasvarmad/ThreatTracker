from dotenv import load_dotenv
import os

print(f"Current working directory: {os.getcwd()}")

load_dotenv()

print("Reading environment variables...")
print(f"MONGO_URI = {repr(os.getenv('MONGO_URI'))}")
print(f"JWT_SECRET = {repr(os.getenv('JWT_SECRET'))}")
