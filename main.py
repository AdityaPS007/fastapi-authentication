from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.common import router as common_router





app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,           # allows credentials such as cookies/authorization credentials when applicable
    allow_methods=["*"],                   # Allow GET, POST, PUT, DELETE, etc
    allow_headers=["*"],                   # Allow the request headers we're using
)

# Register all authentication endpoints with FastAPI
app.include_router(auth_router)

# Register common/public endpoints
app.include_router(common_router)





    
# @app.post("/login")

# def login(data:Login):
#     conn=sqlite3.connect("users.db")
#     cursor=conn.cursor()
#     cursor.execute(
#         "select * from users where email=?",(data.email,)
#     )
#     user=cursor.fetchone()
#     if user is None:
#         return{
#             "message":"user not found"
#         }
#     elif data.password==user[3]:
#         return {
#             "message":"Login Successful"
#         }
#     else:
#         return {
#             "message":"Incorrect Password"
#         }
    
        
        
#-----Hash passwords during user registration using bcrypt----
    


# @app.get("/users")
# def get_users():
#     conn=sqlite3.connect("users.db")
#     cursor=conn.cursor()
#     cursor.execute(
#         "select * from users"
#     )
#     users=cursor.fetchall()     # returns a list
#     conn.close()
#     return users
