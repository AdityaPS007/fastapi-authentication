import { useState } from "react";

function RegisterForm({onSwitchToLogin}) {

    const[name, setName]=useState("")
    const[email, setEmail]=useState("")
    const[password, setPassword]=useState("")
    
    // Store backend feedback to display in the UI
    const[message, setMessage]=useState("")

    const handleSubmit= async(event)=>{

        event.preventDefault()
        
        const formData={
            "name":name,
            "email":email,
            "password":password
        }

        const response=await fetch("http://localhost:8000/register",{
            method:"POST",
            
            // Tell FastAPI that we're sending JSON
            headers:{"Content-Type":"application/json"},

            // Convert our JavaScript object into JSON
            body:JSON.stringify(formData)
        }

        )

        const data=await response.json()
        
        if (response.ok){

            // Show successful registration message
            setMessage(data.message)
        }
        else {

            // Show backend error message
            setMessage(data.detail)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Sign Up</h2>

            <label>Name</label>
            <input
                type="text"
                value={name}
                onChange={(event)=>setName(event.target.value)} 
            />

            <label>Email</label>
            <input
                type="email"
                value={email}
                onChange={(event)=>setEmail(event.target.value)}
            />

            <label>Password</label>
            <input
                type="password"
                value={password}
                onChange={(event)=>setPassword(event.target.value)}
            />

            <button type="submit">Sign Up</button>

            <p>{message}</p>

            <p>
                Already have an account?
                <button type="button" onClick={onSwitchToLogin}>Log In</button>
            </p>
        </form>
    )
}

export default RegisterForm