from fastapi import APIRouter, Depends, HTTPException, status

from database import reviews_collection, users_collection
from bson import ObjectId
from schemas.review_schema import ReviewCreate, ReviewUpdate
from routers.auth import get_current_user



router=APIRouter()


#---------Create Movie Review--------------

@router.post("/reviews")
def create_review(review:ReviewCreate, current_user=Depends(get_current_user)):
    
    # Get the logged-in user's ID from the JWT
    user_id=current_user["user_id"]
    
    # Create the review document that will be stored in MongoDB
    review_document={
        "movie_id":review.movie_id,
        "user_id":user_id,
        "review":review.review,
        "rating":review.rating
    }
    
    # Insert the review into MongoDB
    result=reviews_collection.insert_one(review_document)
    
    return{
        "message":"Review added successfully",
        "review_id":str(result.inserted_id)
    }
    


#------------Update Own  Review---------------------

@router.patch("/reviews/{review_id}")
def update_review(review_id: str, review_data: ReviewUpdate, current_user=Depends(get_current_user)):
    
    # Find the review that the user wants to update
    review=reviews_collection.find_one({
        "_id":ObjectId(review_id)
    })
    
    # Check whether the requested review exists
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check whether the logged-in user owns this review
    if review["user_id"]!=current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own review"
        )
    
    # Update the review with the new review text and rating
    reviews_collection.update_one(
        {"_id":ObjectId(review_id)},
        {
            "$set":{
                "review":review_data.review,
                "rating":review_data.rating
            }
        }
    )
    
    return {
        "message":"Review Updated Successfully"
    }


#-----------------Delete Movie Review------------------

@router.delete("/reviews/{review_id}")
def delete_review(review_id: str, current_user=Depends(get_current_user)):
    
    review=reviews_collection.find_one({
        "_id":ObjectId(review_id)
    })
    
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review doesn't exist"
        )
    
    if review["user_id"]!=current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own review"
        )
    
    reviews_collection.delete_one({
        "_id":ObjectId(review_id)
    })
    
    return {
        "message":"Review deleted successfully"
    }

#------------Get Reviews for a movie----------------

@router.get("/reviews/{movie_id}")
def get_movie_reviews(movie_id: int):
    
    #Find all reviews that belong to this movie
    reviews=reviews_collection.find({
        "movie_id":movie_id
    })
    
    #Convert MongoDB document into a normal python list
    review_list=[]
    
    for review in reviews:
        
        #Find the user who wrote this review
        user=users_collection.find_one({
            "_id":ObjectId(review["user_id"])
        })
        
        #Get the user's name
        user_name=user["name"] if user else "Unknown User"
        
        review_list.append({
            "id": str(review["_id"]),                   #Converting ObjectId to string
            "movie_id": review["movie_id"],
            "user_id": review["user_id"],
            "user_name":user_name,
            "review": review["review"],
            "rating": review["rating"]
        })
        
    return review_list