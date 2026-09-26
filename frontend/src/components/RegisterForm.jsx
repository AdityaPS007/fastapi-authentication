import { useState } from "react";

function RegisterForm({onSwitchToLogin}) {

    const[name, setName]=useState("")
    const[email, setEmail]=useState("")
    const[password, setPassword]=useState("")
    
    // Store backend feedback to display in the UI
    const[message, setMessage]=useState("")

    // Controls whether the registration password is visible or hidden
    // false = password is hidden
    // true = password is visible
    const [showPassword, setShowPassword] = useState(false)

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
            
            <div className="auth-field">
                <label>Name</label>
                <input
                    type="text"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(event)=>setName(event.target.value)} 
                />
            </div>
            
            <div className="auth-field">
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter your Email..."
                    value={email}
                    onChange={(event)=>setEmail(event.target.value)}
                />
            </div>
            
            <div className="auth-field">
                <label>Password</label>

                <div className="password-input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose your password..."
                        value={password}
                        onChange={(event)=>setPassword(event.target.value)}
                    />

                    <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        <span className={showPassword ? "eye-icon eye-hidden" : "eye-icon"}></span>
                    </button>
                </div>
            </div>

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