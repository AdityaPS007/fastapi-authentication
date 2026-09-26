import httpx
from config import TMDB_API_TOKEN


# TMDB endpoint for popular movies
TMDB_URL="https://api.themoviedb.org/3/movie/popular"

async def get_popular_movies():
    headers={
        "Authorization": f"Bearer {TMDB_API_TOKEN}"
    }
    
    # Send a request to TMDB
    async with httpx.AsyncClient() as client:
        response=await client.get(TMDB_URL,headers=headers)
        
        # Raise an error if TMDB returns an unsuccessful status
        response.raise_for_status()
        
        return response.json()
    
    
# Search TMDB for movies matching the user's search query
async def search_movies(query: str):

    # TMDB endpoint used for movie search
    SEARCH_URL = "https://api.themoviedb.org/3/search/movie"

    headers = {
        "Authorization": f"Bearer {TMDB_API_TOKEN}"
    }

    # Send the user's search text to TMDB
    params = {
        "query": query
    }

    # Send a request to TMDB
    async with httpx.AsyncClient() as client:

        response = await client.get(
            SEARCH_URL,
            headers=headers,
            params=params
        )

        # Raise an error if TMDB returns an unsuccessful response
        response.raise_for_status()

        # Return TMDB's JSON response
        return response.json()


async def get_movie_details(movie_id: int):

    # TMDB endpoint for retrieving one specific movie
    MOVIE_URL = f"https://api.themoviedb.org/3/movie/{movie_id}"

    # Send our TMDB API token for authentication
    headers = {
        "Authorization": f"Bearer {TMDB_API_TOKEN}"
    }

    # Call TMDB asynchronously
    async with httpx.AsyncClient() as client:

        response = await client.get(
            MOVIE_URL,
            headers=headers
        )

        # Raise an error if TMDB returns an unsuccessful response
        response.raise_for_status()

        # Return the movie information
        return response.json()