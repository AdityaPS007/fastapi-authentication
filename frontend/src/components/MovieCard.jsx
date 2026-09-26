import { useState, useEffect } from "react"
import ReviewForm from "./ReviewForm"

function MovieCard(props) {
    
    // Controls whether the review form is visible
    const [showReview, setShowReview]=useState(false)

    // Controls whether the login warning is visible
    const [showLoginMessage, setShowLoginMessage] = useState(false)

    // Store the number of reviews for this movie
    const [reviewCount, setReviewCount] = useState(0)

    // Store the average rating given by our users
    const [userAverageRating, setUserAverageRating] = useState(0)

    // Fetch user reviews so the movie card can display the rating summary
    const fetchReviewSummary = async () => {

        const response = await fetch(
            `http://localhost:8000/reviews/${props.movie.id}`
        )

        // Stop if the backend request failed
        if (!response.ok) {
            return
        }

        const data = await response.json()

        // Store the number of reviews
        setReviewCount(data.length)

        // Calculate the average user rating
        if (data.length > 0) {

            const totalRating = data.reduce(
                (sum, item) => sum + item.rating,
                0
            )

            setUserAverageRating(totalRating / data.length)

        } else {

            // Reset the average when there are no reviews
            setUserAverageRating(0)
        }
    }

    // Load the review summary whenever the movie changes
    useEffect(() => {
        fetchReviewSummary()
    }, [props.movie.id])

    return(
        <div className="movie-card"
             onClick={() => props.onMovieSelect(props.movie)}
        >

            {/* Movie poster */}
            {props.movie.poster_path && (
                <img
                    src={`https://image.tmdb.org/t/p/w500${props.movie.poster_path}`}
                    alt={props.movie.title}
                />
            )}

            <div className="movie-info">

                <h3>{props.movie.title}</h3>

                <div className="movie-meta">
                    <span>⭐ {props.movie.vote_average.toFixed(1)}</span>
                    <span>{props.movie.release_date}</span>
                </div>

                <p className="movie-overview">{props.movie.overview}</p>

                {reviewCount > 0 ? (
                    <p className="movie-user-rating">
                        ⭐ {userAverageRating.toFixed(1)} · {reviewCount}{" "}
                        {reviewCount === 1 ? "user review" : "user reviews"}
                    </p>
                ) : (
                    <p className="movie-user-rating">
                        No user reviews yet
                    </p>
                )}

                <div className="movie-actions">
                
                    {/* Everyone can open the reviews */}
                    <button onClick={(event) => {
                            event.stopPropagation()
            
                            // Toggle the reviews section
                            setShowReview(!showReview)
                        
                            // Hide the login message when the section is toggled
                            setShowLoginMessage(false)
                        
                    }}>
                        {showReview ? "Hide Reviews" : "Reviews"}
                    </button>

                    {/* Only logged-in users can write a review */}
                    <button onClick={(event)=>{
                        event.stopPropagation()
                        if (props.currentUser) {
                            
                            // Open the review section for authenticated users
                            setShowReview(true)
                            
                            // Hide any previous login message
                            setShowLoginMessage(false)
                        } else {
                            // Hide any previous login message
                            setShowLoginMessage(true)
                        }
                    }}>Write Review</button>

                </div>

                {/* Tell logged-out users that login is required */}
                {showLoginMessage && (
                    <div>
                        <p>Please Log In to Review</p>
                        <button onClick={props.onLoginRequest}>Login</button>
                    </div>
                )}
                
                {/* Show reviews to everyone */}
                {showReview && (
                    <ReviewForm 
                        movie={props.movie}
                        currentUser={props.currentUser}
                        onReviewChange={fetchReviewSummary}
                    />
                )}
            </div>
        </div>
    )
}

export default MovieCard