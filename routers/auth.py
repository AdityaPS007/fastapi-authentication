from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from datetime import datetime, timedelta

from schemas.user_schema import Register
from utils.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from database import users_collection
from bson import ObjectId


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Group all authentication routes together
router=APIRouter()


#------User Registration-----------------------

@router.post("/register")
def register(user:Register):
    existing_user=users_collection.find_one({
        "email":user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed_password=hash_password(user.password)
    
    users_collection.insert_one({
        "name":user.name,
        "email":user.email,
        "password":hashed_password
    })
    
    return{"message":"User Registered Successfully"}


#--------User Login--------------------

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user=users_collection.find_one({
        "email":form_data.username
    })
    
    if user is None:
        return{
            "message":"User not found"
        }
    elif verify_password(form_data.password,user["password"]):
        
        access_token=create_access_token(str(user["_id"]))
        refresh_token=create_refresh_token(str(user["_id"]))
        
        return{
            "message":"login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    else:
        return{
            "message":"incorrect password"
        }


#---------Current User-----------------

def get_current_user(token: str=Depends(oauth2_scheme)):
    try:
        payload=decode_token(token)
        
        if payload.get("type")!="access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token required"
            )
            
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
        
        
#----------------User Profile--------------------
        
@router.get("/profile")
def get_profile(current_user: int=Depends(get_current_user)):
    
    user=users_collection.find_one({
        "_id":ObjectId(current_user)         # Convert the JWT user ID (string) back into a MongoDB ObjectId
    })
    
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return{
        "id":str(user["_id"]),
        "name":user["name"],
        "email":user["email"]
    }
    
@router.post("/refresh")
def refresh(token: str=Depends(oauth2_scheme)):
    try:
        payload=decode_token(token)
    
        if payload.get("type")!="refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    
        user_id=payload.get("user_id")
    
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        new_access_token=create_access_token(user_id)
    
        return{
            "access_token":new_access_token,
            "token_type":"bearer"
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )