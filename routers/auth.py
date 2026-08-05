from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from datetime import datetime, timedelta
import sqlite3
import bcrypt

from schemas.user_schema import Register
from utils.security import hash_password, verify_password, create_access_token, decode_access_token
from database import get_db_connection


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

router=APIRouter()


#------User Registration-----------------------

@router.post("/register")
def register(user:Register):
    with get_db_connection() as conn:
        cursor=conn.cursor()
    
        cursor.execute(
            "select * from users where email=?",(str(user.email),)
        )
        existing_user=cursor.fetchone()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed_password=hash_password(user.password)
    
    cursor.execute(
        "insert into users(name,email,password) values(?,?,?)",
        (user.name,user.email,hashed_password)
    )
    conn.commit()
    conn.close()
    
    return{"message":"User Registered Successfully"}


#--------User Login--------------------

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with get_db_connection() as conn:
        cursor=conn.cursor()
        cursor.execute(
            "select * from users where email=?",(form_data.username,)
        )
        user=cursor.fetchone()
    if user is None:
        return{
            "message":"User not found"
        }
    elif verify_password(form_data.password,user[3]):
        
        token=create_access_token(user[0])
        
        return{
            "message":"login successful",
            "access_token": token,
            "token_type": "bearer"
        }
    else:
        return{
            "message":"incorrect password"
        }



def get_current_user(token: str=Depends(oauth2_scheme)):
    try:
        payload=decode_access_token(token)
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
        
@router.get("/profile")
def get_profile(current_user: int=Depends(get_current_user)):
    
    with get_db_connection() as connection:
        cursor=connection.cursor()
    
        cursor.execute(
            "select id, name, email from users where id=?",(current_user,)
        )
        user=cursor.fetchone()
    
    
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