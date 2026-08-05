from fastapi import FastAPI
from schemas.user_schema import User, Login, Register
import sqlite3
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from fastapi import Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import HTTPException, status, Depends
from jose import JWTError

from routers.auth import router as auth_router
from routers.common import router as common_router
from routers.user import router as user_router




app=FastAPI()

app.include_router(auth_router)
app.include_router(common_router)
app.include_router(user_router)



#-------GET APIs-------#


    
    
#-------------Pydantic Models-----------------#


    
#-----------------POST APIs-------------#
    


    


    
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





#---Login authentication using bcrypt---


        
    

        




        
