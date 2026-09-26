from fastapi import APIRouter
from services.movie_service import get_popular_movies, search_movies, get_movie_details

router=APIRouter()

@router.get("/movies/popular")
async def popular_movies():
    return await get_popular_movies()

@router.get("/movies/search")
async def movie_search(query: str):
    return await search_movies(query)

@router.get("/movies/{movie_id}")
async def movie_details(movie_id: int):
    return await get_movie_details(movie_id)