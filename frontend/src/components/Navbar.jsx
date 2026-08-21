function Navbar(props) {
    return(
        <nav>
            <h2>{props.title}</h2>
            {props.isLoggedIn ? <h3>Welcome {props.username}</h3> : <h3>Please Login</h3> }
            <h3> {props.role}</h3>
        </nav>
    )
}

export default Navbar