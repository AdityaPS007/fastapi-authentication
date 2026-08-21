import { useState, useEffect } from "react";

function ReviewForm(props) {
    
    console.log("Current user:", props.currentUser)
    const [review, setReview]=useState("")
    const [rating, setRating]=useState(0)
    
    // Store the ID of the review currently being edited
    const [editingReviewId, setEditingReviewId]=useState(null)

    //stores the text of the existing review that we're currently editing
    const [editingText, setEditingText] = useState("")

    // Store the rating of the review currently being edited
    const [editingRating, setEditingRating] = useState(0)

    // Store the ID of the review waiting for delete confirmation
    const [deleteReviewId, setDeleteReviewId] = useState(null)

    // Store all reviews returned by the FastAPI backend
    const [reviews, setReviews]=useState([])

    // Store validation error message
    const[error, setError]=useState("")

    // Fetch all reviews belonging to the current movie
    const fetchReviews= async () => {
        const response= await fetch(`http://localhost:8000/reviews/${props.movie.id}`)

        // Convert FastAPI's JSON response into a JavaScript array
        const data=await response.json()

        // Store the reviews in React state
        setReviews(data)
    }

    // Fetch reviews whenever the displayed movie changes
    useEffect(()=>{fetchReviews()},[props.movie.id])

    // Get a new access token using the refresh token
    const refreshAccessToken= async ()=> {

        // Get the refresh token that was saved during login
        const refreshToken=localStorage.getItem("refresh_token")

        // Send the refresh token to FastAPI's refresh endpoint
        const response= await fetch("http://localhost:8000/refresh",{
            method:"POST",
            headers:{Authorization:`Bearer ${refreshToken}`}
        })

        const data=await response.json()
        
        // If the refresh request was successful adn FastAPI gave us a new access token
        if(response.ok && data.access_token) {

            // Replace the expired access token with the newly generated access token
            localStorage.setItem("access_token", data.access_token)

            // Give the new token back to handleSubmit()
            return data.access_token
        }
        // Return null if we could not get a new access token
        return null
    }
    
    // Runs when the user submits the review form
    const handleSubmit= async (event)=> {
        event.preventDefault()

        // Remove any previous validation error
        setError("")
        
        // Check whether the review contains only whitespace
        if(review.trim()==="") {
            setError("Please write a review")

            // Stop handleSubmit() here
            return
        }

        if(rating===0) {
            setError("Please select a rating")

            // Stop handleSubmit() here
            return
        }
        
        // Get the JWT access token saved during login
        const token=localStorage.getItem("access_token")

        // Send the review to our FastAPI backend
        let response=await fetch("http://localhost:8000/reviews",{
            method: "POST",                              // Send the JWT so FastAPI knows which user is submitting the review
            headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`},
            body: JSON.stringify({
                movie_id:props.movie.id,
                review:review,
                rating:rating
            })

        })

        if(response.status===401) {
            const newToken=await refreshAccessToken()

            if(newToken){
                response=await fetch("http://localhost:8000/reviews",{
                    method:"POST",
                    headers:{"Content-Type":"application/json", Authorization:`Bearer ${newToken}`},
                    body:JSON.stringify({
                        movie_id:props.movie.id,
                        review:review,
                        rating:rating
                    })
                })
            }
        }
        
        // Convert FastAPI's response from JSON into a JavaScript object
        const data=await response.json()

        console.log(data)

        // Clear the form after the review is successfully saved
        if (response.ok){

            // Clear the review textarea
            setReview("")

            // Reset the rating back to zero
            setRating(0)

            // Fetch the updated reviews so the new review appears immediately
            fetchReviews()
        }
            
    }

    // Update an existing review in the backend
    const handleUpdate = async (reviewId) => {

        // Get the current access token
        let token = localStorage.getItem("access_token")

        // Send the updated review to FastAPI
        let response = await fetch(`http://localhost:8000/reviews/${reviewId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                review: editingText,
                rating: editingRating
            })
        })

        // If the access token has expired, get a new one
        if (response.status === 401) {

            const newToken = await refreshAccessToken()

            // Stop if we could not refresh the access token
            if (!newToken) {
                setError("Your session has expired. Please log in again.")
                return
            }

            // Try the update again using the new access token
            token = newToken

            response = await fetch(`http://localhost:8000/reviews/${reviewId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    review: editingText,
                    rating: editingRating
                })
            })
        }

        // Convert FastAPI's response into a JavaScript object
        const data = await response.json()

        console.log(data)

        // If the update was successful
        if (response.ok) {

            // Leave edit mode
            setEditingReviewId(null)

            // Clear the editing text
            setEditingText("")

            // Reset the editing rating
            setEditingRating(0)

            // Fetch the latest reviews from the backend
            fetchReviews()
        }
    }

    // Delete an existing review from the backend
    const handleDelete = async (reviewId) => {

        // Get the current access token
        let token = localStorage.getItem("access_token")

        // Send the delete request to FastAPI
        let response = await fetch(`http://localhost:8000/reviews/${reviewId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        // If the access token has expired, get a new one
        if (response.status === 401) {

            const newToken = await refreshAccessToken()

            // Stop if we could not refresh the access token
            if (!newToken) {
                setError("Your session has expired. Please log in again.")
                return
            }

            // Try the delete request again with the new access token
            token = newToken

            response = await fetch(`http://localhost:8000/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }

        // Convert FastAPI's response into a JavaScript object
        const data = await response.json()

        console.log(data)

        // If the deletion was successful
        if (response.ok) {

            // Fetch the latest reviews so the deleted review disappears
            fetchReviews()
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>

                <h4>Review for {props.movie.title}</h4>

                <div>
                    <label>Review: </label>

                    <textarea
                        value={review}
                        // Update review state whenever the user types
                        onChange={(event)=> setReview(event.target.value)}
                        placeholder="Write your review..."
                    />
                </div>

                <div>
                    <p>Rating</p>

                    {[1,2,3,4,5].map((star)=> (
                        <button
                            // Keep star buttons from submitting the form
                            type="button"
                            key={star}
                            onClick={()=> setRating(star)}
                        >
                            {star<=rating ? "★" : "☆"}
                        </button>
                    ))}
                </div>

                {/* Display validation error if one exists */}

                {error && (
                    <p className="review-error">{error}</p>
                )}

                <button type="submit">Submit Review</button>
            </form>

            {/* Display reviews retrieved from the backend */}

            <div className="reviews-section">

                <h4>Reviews</h4>

                {reviews.map((item)=>{

                    const isMyReview=props.currentUser && item.user_id===props.currentUser.id
                    const isEditing = editingReviewId === item.id

                    return (

                        // One review card for one review object
                        <div className="review-card" key={item.id}>

                            {/* Name of the user who wrote the review */}
                            <h4 className="review-user">{item.user_name}</h4>
                        
                            {/* Display the rating as filled and empty stars */}
                            <p className="review-rating">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</p>
                        
                            {/* The actual review written by the user */}
                            {isEditing ? (
                                <textarea
                                    defaultValue={item.review}
                                    onChange={(event)=>setEditingText(event.target.value)}
                                />
                            ) : ( 
                                <p className="review-text">{item.review}</p>
                            )}

                            {isEditing && (
                                <div>
                                    <p>Rating</p>

                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setEditingRating(star)}
                                        >
                                            {star <= editingRating ? "★" : "☆"}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {isEditing && (
                                <div>

                                    {/* Save the changes made to this review */}
                                    <button
                                        type="button"
                                        onClick={() => handleUpdate(item.id)}
                                    >
                                        Save
                                    </button>

                                    {/* Cancel editing and return to the normal review */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingReviewId(null)
                                            setEditingText("")
                                            setEditingRating(0)
                                        }}
                                    >
                                        Cancel
                                    </button>

                                </div>
                            )}

                            {isMyReview && !isEditing && (
                                <div>
                                    <button 
                                        type="button"
                                        onClick={()=>{

                                            // Remember which review we are editing
                                            setEditingReviewId(item.id)

                                            // Load the existing review text into the editing form
                                            setEditingText(item.review)

                                            // Load the existing rating into the editing form
                                            setEditingRating(item.rating)
                                        }}
                                    >Edit</button>

                                    {/* Ask for confirmation before deleting this review */}
                                    <button
                                        type="button"
                                        onClick={() => setDeleteReviewId(item.id)}
                                    >
                                        Delete
                                    </button>

                                    {deleteReviewId === item.id && (
                                    <div className="delete-confirmation">

                                        {/* Ask the user to confirm the deletion */}
                                        <p>Are you sure you want to delete this review?</p>

                                        {/* Confirm the deletion */}
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>

                                        {/* Cancel the deletion */}
                                        <button
                                            type="button"
                                            onClick={() => setDeleteReviewId(null)}
                                        >
                                            Cancel
                                        </button>

                                    </div>
                                )}
                                </div>
                            )}

                    </div>
                    )
                })}
            </div>
        </>
    )
}

export default ReviewForm