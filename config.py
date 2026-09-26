from dotenv import load_dotenv
import os

load_dotenv()

# Get the TMDB API token from the environment
TMDB_API_TOKEN = os.getenv("TMDB_API_TOKEN")