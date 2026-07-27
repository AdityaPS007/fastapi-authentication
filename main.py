from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from fastapi import Header
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status, Depends
from jose import JWTError


SECRET_KEY="aditya_fastapi_jwt_secret_12345_xyz"
ALGORITHM="HS256"

app=FastAPI()

#-------GET APIs-------#

@app.get("/")
def home():
    return{"message":"Hello World"}

@app.get("/about")
def about():
    return{"message":"About Page"}

@app.get("/contact")
def contact():
    return{"message":"Contact Page"}

@app.get("/hello/{name}")
def hello(name):
    return {
        "message":f"Hello {name}"
    }
    
@app.get("/student/{name}/{age}")
def student(name: str, age: int):
    return{
        "name":name,
        "age":age
    }
    
@app.get("/square/{number}")
def square(number: int):
    return{
        "number":number,
        "square":number*number
    }
    
    
#-------------Pydantic Models-----------------#

class User(BaseModel):
    name:str
    age:int
    city:str

class Login(BaseModel):
    email:str
    password:str
    
class Register(BaseModel):
    name:str
    email:str
    password:str
    
#-----------------POST APIs-------------#
    

@app.post("/user")

def create_user(user:User):
    return{
        "message":"User Created",
        "name":user.name,
        "age":user.age,
        "city":user.city
    }
    


    
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
    
@app.post("/register")
def register(user:Register):
    conn=sqlite3.connect("users.db")
    cursor=conn.cursor()
    
    hashed_password=bcrypt.hashpw(user.password.encode(),bcrypt.gensalt()).decode()
    
    cursor.execute(
        "insert into users(name,email,password) values(?,?,?)",
        (user.name,user.email,hashed_password)
    )
    conn.commit()
    conn.close()
    
    return{"message":"User Registered Successfully"}

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


@app.get("/users")
def get_users():
    conn=sqlite3.connect("users.db")
    cursor=conn.cursor()
    cursor.execute("select * from users")
    users=cursor.fetchall()
    result=[]
    for user in users:
        result.append({
            "id":user[0],
            "name":user[1],
            "email":user[2]
            
        })
    conn.close()
    return result


#---Login authentication using bcrypt---

@app.post("/login")
def login(data: Login):
    conn=sqlite3.connect("users.db")
    cursor=conn.cursor()
    cursor.execute(
        "select * from users where email=?",(data.email,)
    )
    user=cursor.fetchone()
    if user is None:
        return{
            "message":"User not found"
        }
    elif bcrypt.checkpw(data.password.encode(),user[3].encode()):
        
        expiration_time=datetime.utcnow() + timedelta(minutes=30)
        payload={
            "user_id":user[0],
            "exp": expiration_time
        }
        token=jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)    #tokenization
        
        return{
            "message":"login successful",
            "access_token": token,
            "token_type": "bearer"
        }
    else:
        return{
            "message":"incorrect password"
        }
        
    
@app.get("/test-header")
def test_header(authorization: str=Header()):
    return{
        "Authorization Header":authorization
    }
        

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str=Depends(oauth2_scheme)):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id=payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
        
@app.get("/profile")
def get_profile(current_user: int=Depends(get_current_user)):
    
    connection=sqlite3.connect("users.db")
    cursor=connection.cursor()
    
    cursor.execute(
        "select id, name, email from users where id=?",(current_user,)
    )
    user=cursor.fetchone()
    
    connection.close()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return{
        "is":user[0],
        "name":user[1],
        "email":user[2]
    }