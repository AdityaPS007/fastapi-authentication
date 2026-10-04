function Navbar(props) {
    return(
        <nav className="navbar">
            <h2 className="navbar-brand">
                <span className="navbar-brand-icon">🎬</span>
                <span>Movie Review System</span>
            </h2>

            <div className="navbar-user">
                {props.isLoggedIn ? (
                    <>
                        <button
                            type="button"
                            className="profile-button"
                            onClick={props.onProfileClick}
                        >
                            Welcome, {props.username}
                        </button>

                        <button onClick={props.onLogout}>Logout</button>
                    </>
                ):(
                    <button
                        type="button"
                        onClick={props.onLoginRequest}
                    >
                        Please LogIn
                    </button>
                )}
            </div>
            
        </nav>
    )
}

export default Navbar