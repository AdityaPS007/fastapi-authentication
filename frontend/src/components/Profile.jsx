
import { useEffect, useState } from "react"


function Profile(props) {

    // Store the user's profile information
    const [user, setUser] = useState(null)

    // Store the user's reviews
    const [reviews, setReviews] = useState([])

    // Store movie information for each review
    const [movieDetails, setMovieDetails] = useState({})

    // Control the loading state
    const [loading, setLoading] = useState(true)

    // Control whether the profile is in edit mode
    const [isEditing, setIsEditing] = useState(false)

    // Store the name while the user is editing
    const [editName, setEditName] = useState("")

    // Store the email while the user is editing
    const [editEmail, setEditEmail] = useState("")

    // Store an error message
    const [error, setError] = useState("")

    // Store a success message
    const [successMessage, setSuccessMessage] = useState("")

    // Control the save button while the request is running
    const [saving, setSaving] = useState(false)

    const [showReviews, setShowReviews] = useState(false)

    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")
    const [changingPassword, setChangingPassword] = useState(false)

    // Controls whether the current password is visible or hidden
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)

    // Controls whether the new password is visible or hidden
    const [showNewPassword, setShowNewPassword] = useState(false)

    // Controls whether the confirmation password is visible or hidden
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)


    // Fetch profile, reviews, and movie information
    const fetchProfileData = async () => {

        const token = localStorage.getItem("access_token")

        try {

            // Get the logged-in user's profile
            const profileResponse = await fetch(
                "http://localhost:8000/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (!profileResponse.ok) {
                throw new Error("Failed to load profile")
            }

            const profileData = await profileResponse.json()

            setUser(profileData)


            // Get all reviews written by the logged-in user
            const reviewResponse = await fetch(
                "http://localhost:8000/profile/reviews",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (!reviewResponse.ok) {
                throw new Error("Failed to load reviews")
            }

            const reviewData = await reviewResponse.json()

            setReviews(reviewData)


            // Fetch movie information for every review
            const movieResults = await Promise.all(

                reviewData.map(async (review) => {

                    try {

                        const movieResponse = await fetch(
                            `http://localhost:8000/movies/${review.movie_id}`
                        )

                        // Movie may not exist on TMDB
                        if (!movieResponse.ok) {
                            return {
                                movieId: review.movie_id,
                                movie: null
                            }
                        }

                        const movie = await movieResponse.json()

                        return {
                            movieId: review.movie_id,
                            movie: movie
                        }

                    } catch (error) {

                        // Keep the review even if movie information fails
                        return {
                            movieId: review.movie_id,
                            movie: null
                        }
                    }
                })
            )


            // Convert the movie results into an object
            const movieMap = {}

            movieResults.forEach((item) => {

                movieMap[item.movieId] = item.movie

            })


            setMovieDetails(movieMap)

        } catch (error) {

            console.error("Failed to load profile:", error)

        } finally {

            setLoading(false)

        }
    }


    // Fetch profile data when the page loads
    useEffect(() => {

        fetchProfileData()

    }, [])


    // Start editing the profile
    const handleEdit = () => {

        setEditName(user.name)
        setEditEmail(user.email)

        setError("")
        setSuccessMessage("")

        setIsEditing(true)
    }


    // Cancel profile editing
    const handleCancel = () => {

        setIsEditing(false)

        setEditName("")
        setEditEmail("")

        setError("")
        setSuccessMessage("")
    }


    // Save the updated profile
    const handleSave = async () => {

        // Remove previous messages
        setError("")
        setSuccessMessage("")


        // Make sure the name is not empty
        if (editName.trim() === "") {

            setError("Name cannot be empty")

            return
        }


        // Make sure the email is not empty
        if (editEmail.trim() === "") {

            setError("Email cannot be empty")

            return
        }


        setSaving(true)


        const token = localStorage.getItem("access_token")


        try {

            // Send the updated information to the backend
            const response = await fetch(
                "http://localhost:8000/profile",
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: editName.trim(),
                        email: editEmail.trim()
                    })
                }
            )


            const data = await response.json()


            // Handle errors returned by FastAPI
            if (!response.ok) {

                setError(
                    data.detail || "Failed to update profile"
                )

                return
            }


            // Get the updated profile from the backend
            const profileResponse = await fetch(
                "http://localhost:8000/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )


            if (!profileResponse.ok) {

                setError(
                    "Profile was updated, but could not be refreshed."
                )

                return
            }


            const updatedUser = await profileResponse.json()


            // Update the profile displayed on this page
            setUser(updatedUser)


            // Tell App.jsx that the user information changed
            props.onProfileUpdate(updatedUser)


            // Exit edit mode
            setIsEditing(false)

            setEditName("")
            setEditEmail("")

            setSuccessMessage(
                "Profile updated successfully."
            )

        } catch (error) {

            console.error("Failed to update profile:", error)

            setError(
                "Unable to update profile. Please try again."
            )

        } finally {

            setSaving(false)

        }
    }

    // Calculate profile statistics from the user's reviews
    const totalReviews = reviews.length

    const moviesReviewed = new Set(
        reviews.map((item) => item.movie_id)
    ).size

    const averageRating =
        totalReviews > 0
            ? reviews.reduce(
                (sum, item) => sum + item.rating,
                0
            ) / totalReviews
            : 0

    const fiveStarReviews = reviews.filter(
        (item) => item.rating === 5
    ).length


    // Show loading message while data is being fetched
    if (loading) {

        return (
            <section className="profile-page">

                <p>Loading profile...</p>

            </section>
        )
    }


    const handleChangePassword = async () => {
        setPasswordError("")
        setPasswordSuccess("")

        // Frontend validation
        if (!currentPassword.trim()) {
            setPasswordError("Current password cannot be empty")
            return
        }

        if (!newPassword.trim()) {
            setPasswordError("New password cannot be empty")
            return
        }

        if (!confirmPassword.trim()) {
            setPasswordError("Please confirm your new password")
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match")
            return
        }

        if (newPassword === currentPassword) {
            setPasswordError(
                "New password must be different from current password"
            )
            return
        }

        setChangingPassword(true)

        try {
            const token = localStorage.getItem("access_token")

            const response = await fetch(
                "http://localhost:8000/profile/password",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        current_password: currentPassword,
                        new_password: newPassword
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                setPasswordError(
                    data.detail || "Failed to change password"
                )
                return
            }

            // Password was successfully changed
            setPasswordSuccess("Password changed successfully.")

            // Clear password fields after successful change
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")

            // Close the password form
            setIsChangingPassword(false)

        } catch (error) {
            console.error("Failed to change password:", error)
            setPasswordError(
                "Something went wrong. Please try again."
            )
        } finally {
            setChangingPassword(false)
        }
    }


    return (

        <section className="profile-page">

            {/* Return to the movie list */}
            <button
                type="button"
                onClick={props.onBack}
            >
                ← Back to Movies
            </button>


            <h2>My Profile</h2>


            {/* User information */}
            {user && (
                <>

                <div className="profile-info">

                    {isEditing ? (

                        <>
                            {/* Name input */}
                            <div className="profile-edit-field">

                                <label>Name</label>

                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(event) =>
                                        setEditName(event.target.value)
                                    }
                                />

                            </div>


                            {/* Email input */}
                            <div className="profile-edit-field">

                                <label>Email</label>

                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(event) =>
                                        setEditEmail(event.target.value)
                                    }
                                />

                            </div>


                            {/* Show update error */}
                            {error && (

                                <p className="profile-error">
                                    {error}
                                </p>

                            )}


                            {/* Save and cancel buttons */}
                            <div className="profile-edit-actions">

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"
                                    }
                                </button>


                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                            </div>

                        </>

                    ) : (

                        <>
                            {/* Display current user information */}
                            <h3>{user.name}</h3>

                            <p>{user.email}</p>


                            {/* Open edit mode */}
                            <button
                                type="button"
                                className="edit-profile-button"
                                onClick={handleEdit}
                            >
                                Edit Profile
                            </button>


                            {/* Show successful update */}
                            {successMessage && (

                                <p className="profile-success">
                                    {successMessage}
                                </p>

                            )}

                        </>

                    )}

                </div>

                {/* Profile statistics */}
                <div className="profile-stats">
                    <h3>My Statistics</h3>

                    <div className="profile-stats-grid">

                        {/* Number of unique movies reviewed */}
                        <div className="profile-stat-card">
                            <span className="profile-stat-icon">🎬</span>
                            <strong>{moviesReviewed}</strong>
                            <span>Movies Reviewed</span>
                        </div>

                        {/* Average rating given by the user */}
                        <div className="profile-stat-card">
                            <span className="profile-stat-icon">⭐</span>
                            <strong>
                                {averageRating.toFixed(1)}
                            </strong>
                            <span>Average Rating</span>
                        </div>

                        {/* Number of 5-star reviews */}
                        <div className="profile-stat-card">
                            <span className="profile-stat-icon">🌟</span>
                            <strong>{fiveStarReviews}</strong>
                            <span>5-Star Reviews</span>
                        </div>

                    </div>
                </div>
                </>

            )}

            <div className="profile-security">

                <div className="profile-security-header">
                    <h3>Account Security</h3>

                    {!isChangingPassword && (
                        <button
                            type="button"
                            className="change-password-button"
                            onClick={() => {
                                setPasswordError("")
                                setPasswordSuccess("")
                                setCurrentPassword("")
                                setNewPassword("")
                                setConfirmPassword("")
                                setIsChangingPassword(true)
                            }}
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {isChangingPassword && (
                    <div className="profile-password-form">

                        <div className="profile-edit-field">
                            <label htmlFor="current-password">
                                Current Password
                            </label>
                            
                            <div className="password-input-wrapper">
                                <input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(event) =>
                                        setCurrentPassword(event.target.value)
                                    }
                                    placeholder="Enter current password"
                                />

                                <button
                                type="button"
                                className="password-toggle-button"
                                onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                }
                                aria-label={
                                    showCurrentPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                >
                                <span
                                    className={
                                        showCurrentPassword
                                            ? "eye-icon eye-hidden"
                                            : "eye-icon"
                                    }
                                ></span>
                                </button>
                            </div>
                        </div>

                        <div className="profile-edit-field">
                            <label htmlFor="new-password">
                                New Password
                            </label>
                            
                            <div className="password-input-wrapper">
                                <input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    placeholder="Enter new password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle-button"
                                    onClick={() =>
                                        setShowNewPassword(!showNewPassword)
                                    }
                                    aria-label={
                                        showNewPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <span
                                        className={
                                            showNewPassword
                                                ? "eye-icon eye-hidden"
                                                : "eye-icon"
                                        }
                                    ></span>
                                </button>
                            </div>
                        </div>

                        <div className="profile-edit-field">
                            <label htmlFor="confirm-password">
                                Confirm New Password
                            </label>
                            
                            <div className="password-input-wrapper">
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    placeholder="Confirm new password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle-button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <span
                                        className={
                                            showConfirmPassword
                                                ? "eye-icon eye-hidden"
                                                : "eye-icon"
                                        }
                                    ></span>
                                </button>
                            </div>
                        </div>

                        {passwordError && (
                            <p className="profile-error">
                                {passwordError}
                            </p>
                        )}

                        <div className="profile-edit-actions">

                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                            >
                                {changingPassword
                                    ? "Changing..."
                                    : "Change Password"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsChangingPassword(false)
                                    setCurrentPassword("")
                                    setNewPassword("")
                                    setConfirmPassword("")
                                    setPasswordError("")
                                    setPasswordSuccess("")
                                }}
                                disabled={changingPassword}
                            >
                                Cancel
                            </button>

                        </div>
                    </div>
                )}

                {!isChangingPassword && passwordSuccess && (
                    <p className="profile-success">
                        {passwordSuccess}
                    </p>
                )}

            </div>


            {/* User reviews */}
            <div className="profile-reviews">
                
                <div className="profile-reviews-header">
                    <h3>My Reviews</h3>

                    <button
                        type="button"
                        className="toggle-reviews-button"
                        onClick={() => setShowReviews(!showReviews)}
                    >
                        {showReviews ? "Hide My Reviews" : "View My Reviews"}
                    </button>
                </div>

                {showReviews && (
                    <>

                        {reviews.length === 0 ? (

                            <p>You haven't written any reviews yet.</p>

                        ) : (

                            reviews.map((item) => {

                                // Get movie information for this review
                                const movie = movieDetails[item.movie_id]

                                return (

                                    <div
                                        className="profile-review-card"
                                        key={item.id}
                                        onClick={() => {
                                            if (movie) {
                                                props.onMovieSelect(movie)
                                            }
                                        }}
                                    >

                                        {/* Movie information */}
                                        {movie ? (

                                            <div className="profile-movie-info">

                                                {movie.poster_path && (

                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                                        alt={movie.title}
                                                        className="profile-movie-poster"
                                                    />

                                                )}

                                                <div>

                                                    <h4>
                                                        {movie.title}
                                                    </h4>

                                                </div>

                                            </div>

                                        ) : (
                                            
                                            <h4>
                                                Movie ID: {item.movie_id}
                                            </h4>

                                        )}


                                        {/* User rating */}
                                        <p className="profile-review-rating">

                                            {"★".repeat(item.rating)}

                                            {"☆".repeat(5 - item.rating)}

                                        </p>


                                        {/* User review */}
                                        <p className="profile-review-text">

                                            {item.review}

                                        </p>

                                    </div>

                                )

                            })

                        )}

                    </>

                )}

            </div>

        </section>
    )
}


export default Profile