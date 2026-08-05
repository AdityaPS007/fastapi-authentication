from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def home():
    return{"message":"Hello World"}

@router.get("/about")
def about():
    return{"message":"About Page"}

@router.get("/contact")
def contact():
    return{"message":"Contact Page"}

@router.get("/hello/{name}")
def hello(name):
    return {
        "message":f"Hello {name}"
    }
    
@router.get("/student/{name}/{age}")
def student(name: str, age: int):
    return{
        "name":name,
        "age":age
    }
    
@router.get("/square/{number}")
def square(number: int):
    return{
        "number":number,
        "square":number*number
    }
    
@router.get("/ping")
def ping():
    return {"status": "ok"}