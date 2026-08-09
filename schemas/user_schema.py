from pydantic import BaseModel, EmailStr
from typing import Optional

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


class UpdateUser(BaseModel):
    name:Optional[str]=None
    email:Optional[str]=None
    password:Optional[str]=None