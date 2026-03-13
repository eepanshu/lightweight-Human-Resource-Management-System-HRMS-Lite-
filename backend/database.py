from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://localhost:27017") # Fallback to local 

client = AsyncIOMotorClient(MONGODB_URL)
db = client.hrms_lite

# Helper for dependency injection
async def get_db():
    return db
