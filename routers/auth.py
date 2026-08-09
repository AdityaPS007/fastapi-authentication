from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from datetime import datetime, timedelta

from schemas.user_schema import Register, UpdateUser
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
        "password":hashed_password,
        "role":"user"
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
        
        access_token=create_access_token(str(user["_id"]), user["role"])
        refresh_token=create_refresh_token(str(user["_id"]), user["role"])
        
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
        role=payload.get("role")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return {
            "user_id":user_id,
            "role":role
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


# --------- Check if Current User is Admin ---------        
        
def require_admin(current_user=Depends(get_current_user)):
    if current_user["role"]!="admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
        
    return current_user

#----------------User Profile--------------------
        
@router.get("/profile")
def get_profile(current_user: int=Depends(get_current_user)):
    
    user=users_collection.find_one({
        "_id":ObjectId(current_user["user_id"])         # Convert the JWT user ID (string) back into a MongoDB ObjectId
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
    
# Admin-only endpoint to verify admin access

@router.get("/admin")
def admin_dashboard(current_user=Depends(require_admin)):
    return{
        "message":"Welcome Admin"
    }
    

# Generate a new access token using a valid refresh token
    
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
        role=payload.get("role")
    
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        new_access_token=create_access_token(user_id, role)
    
        return{
            "access_token":new_access_token,
            "token_type":"bearer"
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
        

# Retrieve a list of all registered users (Admin only)

@router.get("/users")
def get_all_users(current_user=Depends(require_admin)):
    users=list(users_collection.find())
    
    for user in users:
        user["_id"]=str(user["_id"])
        user.pop("password",None)
    return users


# Delete a user by ID (Admin only)

@router.delete("/users/{user_id}")
def delete_user(user_id: str, current_user=Depends(require_admin)):
    user=users_collection.find_one({
        "_id":ObjectId(user_id)
          
    })
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    users_collection.delete_one({
        "_id":ObjectId(user_id)
    })
    
    return{
        "message":"User deleted successfully"
    }
    

# Update the logged-in user's profile information
    
@router.patch("/profile")
def update_profile(update_user:UpdateUser, current_user=Depends(get_current_user)):
    user=users_collection.find_one({
        "_id":ObjectId(current_user["user_id"])
    })
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data={}
    
    if update_user.name is not None:
        update_data["name"]=update_user.name
    
    if update_user.email is not None:
        update_data["email"]=update_user.email
        
    if update_user.password is not None:
        update_data["password"]=hash_password(update_user.password)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update"
        )  
    
    if "email" in update_data:
        existing_user=users_collection.find_one({
            "email":update_data["email"]
        })
        
        if ( existing_user and str(existing_user["_id"])!=current_user["user_id"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
          
    users_collection.update_one(
        {
        "_id":ObjectId(current_user["user_id"])
        },
        {
            "$set":update_data
        })
    
    updated_user=users_collection.find_one({
        "_id":ObjectId(current_user["user_id"])
    })

    updated_user["_id"]=str(updated_user["_id"])
    updated_user.pop("password", None)
    
    return{
        "message":"Profile updated successfully",
        "user":updated_user
    }