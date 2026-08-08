import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta

SECRET_KEY="aditya_fastapi_jwt_secret_12345_xyz"
ALGORITHM="HS256"

def hash_password(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def create_access_token(user_id: str, role: str):
    expiration_time=datetime.utcnow() + timedelta(minutes=30)
    
    payload={
        "user_id":user_id,
        "role":role,
        "type":"access",
        "exp":expiration_time
    }
    
    token=jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)
    return token      # returns that JWT to the login function

def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def create_refresh_token(user_id: str, role: str):
    expiration_time=datetime.utcnow() + timedelta(days=7)
    
    payload={
        "user_id":user_id,
        "role":role,
        "type":"refresh",
        "exp":expiration_time
    }
    token=jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)
    return token