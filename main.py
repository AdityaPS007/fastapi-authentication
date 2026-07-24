from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3
import bcrypt

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
    


    
@app.post("/login")

def login(data:Login):
    conn=sqlite3.connect("users.db")
    cursor=conn.cursor()
    cursor.execute(
        "select * from users where email=?",(data.email,)
    )
    user=cursor.fetchone()
    if user is None:
        return{
            "message":"user not found"
        }
    elif data.password==user[3]:
        return {
            "message":"Login Successful"
        }
    else:
        return {
            "message":"Incorrect Password"
        }
    
        
        
    
    
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