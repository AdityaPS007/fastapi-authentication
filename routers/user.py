from fastapi import APIRouter, Header
import sqlite3

from schemas.user_schema import User
from database import get_db_connection

router = APIRouter()


@router.post("/user")

def create_user(user:User):
    return{
        "message":"User Created",
        "name":user.name,
        "age":user.age,
        "city":user.city
    }

@router.get("/users")
def get_users():
    with get_db_connection() as conn:
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
    return result

@router.get("/test-header")
def test_header(authorization: str=Header()):
    return{
        "Authorization Header":authorization
    }