import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MovieList from './components/MovieList'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import MovieDetails from './components/MovieDetails'
import Profile from './components/Profile'

function App() {
  
  // Restore login state from the stored access token
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem("access_token")!==null)
  
  // Store information about the currently logged-in user
  const [currentUser, setCurrentUser]=useState(null)

  // Store the movie currently selected by the user
  const [selectedMovie, setSelectedMovie] = useState(null)

  // Controls whether the user's profile is displayed
  const [showProfile, setShowProfile] = useState(false)


  useEffect(() => {

    const restoreUser = async () => {

        const accessToken = localStorage.getItem("access_token")
        const refreshToken = localStorage.getItem("refresh_token")

        // No tokens means the user is not logged in
        if (!accessToken) {
            return
        }

        try {

            // First, try the existing access token
            let profileResponse = await fetch("http://localhost:8000/profile", {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            // If access token is expired, use the refresh token
            if (profileResponse.status === 401 && refreshToken) {

                const refreshResponse = await fetch("http://localhost:8000/refresh", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${refreshToken}`
                    }
                })

                // Refresh token is also invalid
                if (!refreshResponse.ok) {
                    localStorage.removeItem("access_token")
                    localStorage.removeItem("refresh_token")

                    setIsLoggedIn(false)
                    setCurrentUser(null)

                    return
                }

                const refreshData = await refreshResponse.json()

                // Save the newly generated access token
                localStorage.setItem("access_token", refreshData.access_token)

                // Try /profile again with the new access token
                profileResponse = await fetch("http://localhost:8000/profile", {
                    headers: {
                        Authorization: `Bearer ${refreshData.access_token}`
                    }
                })
            }

            // If we still don't have a valid profile response, log out
            if (!profileResponse.ok) {
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")

                setIsLoggedIn(false)
                setCurrentUser(null)

                return
            }

            const profileData = await profileResponse.json()

            // Restore the logged-in user's information
            setCurrentUser(profileData)
            setIsLoggedIn(true)

        } catch (error) {

            console.error("Failed to restore user:", error)

            setIsLoggedIn(false)
            setCurrentUser(null)
        }
    }

    restoreUser()

}, [])


  
  // Controls which auth form is displayed
  const[showRegister, setShowRegister]=useState(false)

  // Controls whether the login/register modal is visible
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleLogout=async ()=> {
    
    // Get the JWT we want to revoke
    const token=localStorage.getItem("access_token")
    try{
        // Tell FastAPI to invalidate this token
        await fetch("http://localhost:8000/logout", {
          method:"POST",
          headers: {Authorization: `Bearer ${token}`}

        })
    } finally{
        // Remove authentication data from the browser
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")

        // Update React authentication state
        setIsLoggedIn(false)
        
        // Remove the logged-in user's information
        setCurrentUser(null)
    }
  }

  // Scroll the user to the login section when login is requested
  const handleLoginRequest=() => {
    document.getElementById("login-section")?.scrollIntoView({
        behavior:"smooth"
    })
  }

  return (
    <div>
      <Navbar title="Movie Review System"
              username={currentUser?.name || "User"} 
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              onLoginRequest={()=>{
                setShowRegister(false)
                setShowAuthModal(true)
              }}
              onProfileClick={() => {
                  setSelectedMovie(null)
                  setShowProfile(true)
              }}
      />

      {showAuthModal && (
            <div className="auth-modal-overlay">

                <div className="auth-modal">

                    {/* Close button */}
                    <button
                        type="button"
                        className="auth-modal-close"
                        onClick={() => setShowAuthModal(false)}
                    >
                        ×
                    </button>

                    {showRegister ? (

                        <RegisterForm
                            onSwitchToLogin={() => setShowRegister(false)}
                        />

                    ) : (

                        <LoginForm
                            onLogin={(profileData) => {
                                setIsLoggedIn(true)
                                setCurrentUser(profileData)
                                setShowAuthModal(false)
                            }}
                            onSwitchToRegister={() => setShowRegister(true)}
                        />

                    )}

                </div>

            </div>
      )}
      
      {/* {isLoggedIn && (<button onClick={handleLogout}>Logout</button>)} */}
      
      {!selectedMovie && !showProfile && <Hero />}
    

      {/* {selectedMovie ? (

            <MovieDetails
                movie={selectedMovie}
                currentUser={currentUser}
                onBack={() => setSelectedMovie(null)}
            />

        ) : (

            <MovieList 
                isLoggedIn={isLoggedIn}
                currentUser={currentUser}
                onLoginRequest={handleLoginRequest}
                onMovieSelect={setSelectedMovie}
            />

        )} */}

        {showProfile ? (

                <Profile
                    onBack={() => setShowProfile(false)}
                    onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
                    onMovieSelect={(movie) => {
                        setShowProfile(false)
                        setSelectedMovie(movie)
                    }}
                />

            ) : selectedMovie ? (

                <MovieDetails
                    movie={selectedMovie}
                    currentUser={currentUser}
                    onBack={() => setSelectedMovie(null)}
                />

            ) : (

                <MovieList 
                    isLoggedIn={isLoggedIn}
                    currentUser={currentUser}
                    onLoginRequest={handleLoginRequest}
                    onMovieSelect={setSelectedMovie}
                />

            )}
      
    </div>
  )
}

export default App
