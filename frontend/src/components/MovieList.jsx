import {useEffect, useState } from "react"
import MovieCard from "./MovieCard"


function MovieList(props) {
    
    // Tracks whether the API request is still running
    const [loading, setLoading] = useState(true)

    // Mock data is available immediately
    // const [loading, setLoading] = useState(false)

    // Stores the movies received from our backend
    const [movies, setMovies]=useState([])

    // Temporary starting data while TMDB connectivity is unavailable
    // const [movies, setMovies] = useState(mockMovies)

    // Stores the text entered into the search box
    const [searchTerm, setSearchTerm] = useState("")

    // Stores an error message if the request fails
    const [error, setError]=useState("")

    // Filter movies based on the user's search term
    const filteredMovies=movies.filter((movie)=>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()))

    // Fetch popular movies when this component loads
    useEffect(() => {
        /* fetch("http://localhost:8000/movies/popular")
            .then((response) => {
                if(!response.ok){
                    throw new Error("Failed to fetch movies")
                }
                return response.json()
            })
            .then((data)=>{
                // TMDB stores the movie list inside "results"
                setMovies(data.results)
            })
            .catch((error)=>{
                // Store the error so we can show it to the user
                setError(error.message)
            })
            .finally(()=>{
                // Request has finished, whether successful or not
                setLoading(false)
            }) */

        // Controller allows us to cancel an older request
        // if the user starts another search
        const controller = new AbortController()

        const fetchMovies = async () => {

            // Show loading while fetching movies
            setLoading(true)

            // Remove any previous error
            setError("")

            try {

                let url

                // If the search box is empty, load popular movies
                if (searchTerm.trim() === "") {

                    url = "http://localhost:8000/movies/popular"

                } else {

                    // Otherwise search TMDB through our FastAPI backend
                    const query = encodeURIComponent(searchTerm.trim())

                    url = `http://localhost:8000/movies/search?query=${query}`
                }

                // Send the request to FastAPI
                const response = await fetch(url, {
                    signal: controller.signal
                })

                // Handle unsuccessful responses
                if (!response.ok) {
                    throw new Error("Failed to fetch movies")
                }

                // Convert FastAPI's response into JavaScript
                const data = await response.json()

                // TMDB stores movie results inside "results"
                setMovies(data.results)

            } catch (error) {

                // Ignore errors caused by cancelling an old request
                if (error.name === "AbortError") {
                    return
                }

                console.error("Failed to fetch movies:", error)

                setError(error.message)

            } finally {

                // Stop showing the loading state
                setLoading(false)
            }
        }


        // Wait briefly before making a search request
        const timer = setTimeout(() => {
            fetchMovies()
        }, 400)


        // Cancel the timer and previous request when search changes
        return () => {

            clearTimeout(timer)

            controller.abort()
        }
    }, [searchTerm])
    
    /*
    // Show a loading message while waiting for the API
    if(loading) {
        return <p>Loading movies...</p>
    }

    if(error) {
        return <p>Unable to load movies: {error}</p>
    }
    */

    return(
        <section id="movies-section" className="movie-section">
            <h2>Explore Movies</h2>

            <p className="movie-section-message">Find a movie and see what viewers are saying.</p>
            
            {/* Search input */}
            <div className="movie-search">

                {/* Search input and clear button wrapper */}
                <div className="search-input-wrapper">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(event)=>setSearchTerm(event.target.value)}
                        placeholder="Search movies..."
                        aria-label="Search movies"
                    />

                    {/* Show the clear button only when something has been typed */}
                    {searchTerm && (
                        <button
                            type="button"
                            className="clear-search"
                            onClick={()=> setSearchTerm("")}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Show loading without removing the search box */}
            {loading && (
                <p className="movie-loading">
                    {searchTerm
                        ? "Searching movies..."
                        : "Loading movies..."}
                </p>
            )}

            {/* Show an error if the request failed */}
            {!loading && error && (
                <p className="no-movies">
                    Unable to load movies: {error}
                </p>
            )}



            {/* Display movies when the request succeeds */}
            {!loading && !error && (
                movies.length === 0 ? (

                    <p className="no-movies">
                        No movies found matching "{searchTerm}".
                    </p>

                ) : (

                    <div className="movie-grid">

                        {movies.map((movie) => (

                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                currentUser={props.currentUser}
                                onLoginRequest={props.onLoginRequest}
                                onMovieSelect={props.onMovieSelect}
                            />

                        ))}

                    </div>

                )
            )}

        </section>
    )
}

export default MovieList