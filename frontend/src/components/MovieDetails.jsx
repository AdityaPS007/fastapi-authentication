import { useEffect, useState } from "react"
import ReviewForm from "./ReviewForm"

function MovieDetails(props) {

        // Store the number of reviews for this movie
    const [reviewCount, setReviewCount] = useState(0)

    // Store the average rating given by our users
    const [userAverageRating, setUserAverageRating] = useState(0)


    // Fetch reviews so we can calculate the community rating
    const fetchReviewSummary = async () => {

        const response = await fetch(
            `http://localhost:8000/reviews/${props.movie.id}`
        )

        // Stop if the request failed
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

            setUserAverageRating(0)
        }
    }


    // Fetch the rating whenever the selected movie changes
    useEffect(() => {
        fetchReviewSummary()
    }, [props.movie.id])

    return (
        <section className="movie-details">

            {/* Back button */}
            <button
                type="button"
                className="back-to-movies"
                onClick={props.onBack}
            >
                ← Back to Movies
            </button>

            <div className="movie-details-content">

                {/* Movie poster */}
                {props.movie.poster_path && (
                    <img
                        className="movie-details-poster"
                        src={`https://image.tmdb.org/t/p/w500${props.movie.poster_path}`}
                        alt={props.movie.title}
                    />
                )}

                <div className="movie-details-info">

                    {/* Movie title */}
                    <h1>{props.movie.title}</h1>

                    {/* Movie metadata */}
                    <div className="movie-details-meta">

                        <span>
                            ⭐ {props.movie.vote_average.toFixed(1)}
                        </span>

                        <span>
                            {props.movie.release_date}
                        </span>

                    </div>

                    {/* Rating from users of our application */}
                    <div className="movie-community-rating">

                        <h3>Community Rating</h3>

                        {reviewCount > 0 ? (
                            <p>
                                ⭐ {userAverageRating.toFixed(1)} · {reviewCount}{" "}
                                {reviewCount === 1 ? "user review" : "user reviews"}
                            </p>
                        ) : (
                            <p>No user reviews yet</p>
                        )}

                    </div>

                    {/* Movie overview */}
                    <div className="movie-details-overview">
                        <h3>Overview</h3>
                        <p>
                            {props.movie.overview}
                        </p>
                    </div>

                </div>

            </div>

            {/* Review section */}
            <div className="movie-details-reviews">
                <ReviewForm
                    movie={props.movie}
                    currentUser={props.currentUser}
                    onReviewChange={fetchReviewSummary}
                />
            </div>

        </section>
    )
}

export default MovieDetails