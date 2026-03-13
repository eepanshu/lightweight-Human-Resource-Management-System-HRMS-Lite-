from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = "mongodb+srv://deepanshubhadauriacsaiml21_db_user:CBEXYcBOvk3xUza1@cluster0.iiv5b8h.mongodb.net/?appName=Cluster0"

client = AsyncIOMotorClient(MONGODB_URL)
db = client.hrms_lite

# Helper for dependency injection
async def get_db():
    return db
