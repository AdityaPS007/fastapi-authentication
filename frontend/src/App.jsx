import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MovieList from './components/MovieList'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'


function App() {
  
  // Restore login state from the stored access token
  const [isLoggedIn, setIsLoggedIn]=useState(localStorage.getItem("access_token")!==null)
  
  // Controls which auth form is displayed
  const[showRegister, setShowRegister]=useState(false)

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
    }
  }

  return (
    <div>
      <Navbar title="Movie Review System"
              username="Aditya Pratap"
              role="admin"
              isLoggedIn={isLoggedIn}
      />
      
      {isLoggedIn && (<button onClick={handleLogout}>Logout</button>)}
      
      <Hero />

      {!isLoggedIn && (
        <>
            {showRegister?(<RegisterForm onSwitchToLogin={()=>setShowRegister(false)}/>):(<LoginForm onLogin={()=>setIsLoggedIn(true)} onSwitchToRegister={()=> setShowRegister(true)} />)}
        </>
      )}

      <MovieList isLoggedIn={isLoggedIn}/>
      
    </div>
  )
}

export default App
