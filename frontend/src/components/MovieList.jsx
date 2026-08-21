import MovieCard from "./MovieCard"

function MovieList(props) {
    const movies = [
  {
    id: 1,
    title: "Interstellar",
    genre: "Sci-Fi",
    rating: 8.5
  },
  {
    id: 2,
    title: "The Batman",
    genre: "Action",
    rating: 8.5
  },
  {
    id: 3,
    title: "Dune",
    genre: "Adventure",
    rating: 8.8
  }
]
    return(
        <section>
            <h2>Popular Movies</h2>

            <p>{props.isLoggedIn ? "You can review the movies" : "Please Login to review"}</p>
        {
            movies.map((movie) => (
                <MovieCard 
                    key={movie.id}
                    movie={movie}
                    currentUser={props.currentUser}
                />
            ))
        }
        </section>
    )
}

export default MovieList