function MovieCard(props) {
    return(
        <div>
            <h3>{props.title}</h3>

            <p>Genre: {props.genre}</p>

            <p>Rating: {props.rating}</p>

            <button>Read Reviews</button>
        </div>
    )
}

export default MovieCard