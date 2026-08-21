import { useState } from "react"
import ReviewForm from "./ReviewForm"

function MovieCard(props) {

    const [showReview, setShowReview]=useState(false)

    return(
        <div>
            <h3>{props.movie.title}</h3>

            <p>Genre: {props.movie.genre}</p>

            <p>Rating: {props.movie.rating}</p>

            <button onClick={()=>setShowReview(true)}>Write Reviews</button>

            {showReview && (
                <ReviewForm 
                    movie={props.movie}
                    currentUser={props.currentUser}
                />
            )}
        </div>
    )
}

export default MovieCard