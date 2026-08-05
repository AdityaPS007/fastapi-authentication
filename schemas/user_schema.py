from pydantic import BaseModel, EmailStr

class User(BaseModel):
    name:str
    age:int
    city:str

class Login(BaseModel):
    email:str
    password:str
    
class Register(BaseModel):
    name:str
    email:EmailStr
    password:str