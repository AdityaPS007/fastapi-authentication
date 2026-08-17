import { useState } from "react";

function LoginForm({onLogin, onSwitchToRegister}) {

    const [email, setEmail]=useState("")
    const [password, setPassword]=useState("")
    
    // Runs when the form is submitted
    const handleSubmit=async (event)=>{
        event.preventDefault()          // Don't let the browser reload the page
        
        // creates an empty container for the data we're going to send
        const formData=new URLSearchParams()

        formData.append("username", email)
        formData.append("password", password)

        const response=await fetch("http://localhost:8000/login", {
            method:"POST",
            body:formData
        })

        const data=await response.json()         // Turn the backend's JSON response into a JavaScript object.

        console.log(data)

        if(data.access_token) {
            localStorage.setItem("access_token", data.access_token)      // Store the JWT in the browser
            
            // Store refresh token for renewing the access token later
            localStorage.setItem("refresh_token", data.refresh_token)   
            
            // Get the stored JWT back from localStorage
            const token=localStorage.getItem("access_token")

            // Tell App that login was successful
            onLogin()
            
            // Get refresh token when we need to renew the access token
            const refreshToken=localStorage.getItem("refresh_token")
            
            // Send the JWT to a protected FastAPI endpoint
            const profileResponse=await fetch("http://localhost:8000/profile",
                {
                    // Send JWT to FastAPI using the Authorization header
                    headers: {Authorization: `Bearer ${token}`}
                }
            )

            const refreshResponse=await fetch("http://localhost:8000/refresh",
                {
                    method:"POST",
                    headers:{Authorization: `Bearer ${refreshToken}`}
                }

            )

            const profileData=await profileResponse.json()

            console.log(profileData)

            const refreshData= await refreshResponse.json()

            console.log(refreshData)

            if(refreshData.access_token) {

                // Replace old access token with the new one
                localStorage.setItem("access_token", refreshData.access_token)
            }
        }

    }

    return(
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            <label>Email</label>

            <input 
                type="email"
                value={email}
                onChange={(event)=>setEmail(event.target.value)}
            />

            <label>Password</label>

            <input
                type="password"
                value={password}    // Input displays whatever is currently stored in password
                onChange={(event)=>setPassword(event.target.value)}    // Every time the user types, update the password state
            />

            <button type="submit">Login</button>

            <p>
                Don't have an account?{" "}
                <button type="button" onClick={onSwitchToRegister}>Sign Up</button> 
            </p>

        </form>
    )
}

export default LoginForm