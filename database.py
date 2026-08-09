from pymongo import MongoClient, ASCENDING


client=MongoClient("mongodb://localhost:27017")    # connect to the MongoDB server
db=client["firstapp"]                              # choose a database

users_collection=db["users"]                       # choose a collection
blacklisted_tokens_collection=db["blacklisted_tokens"]

blacklisted_tokens_collection.create_index(
    [("expires_at",ASCENDING)],
    expireAfterSeconds=0
)
