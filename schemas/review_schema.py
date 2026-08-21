from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    movie_id: int
    review: str=Field(min_length=1, max_length=1000)
    rating: int=Field(..., ge=1, le=5)


class ReviewUpdate(BaseModel):
    review: str
    rating: int