from pymongo import MongoClient


client=MongoClient("mongodb://localhost:27017")    # connect to the server
db=client["firstapp"]                              # choose a database
users_collection=db["users"]                       # choose a collection


