function Hero() {
    
    return(
        <section>
            <h1>Discover. Review. Discuss.</h1>

            <p>
                Explore movies, read what others think, and share your own review.
            </p>

            <button onClick={()=>{
                document.getElementById("movies-section")?.scrollIntoView({
                    behavior:"smooth"
                })
            }}>Browse movies</button>
        </section>
    )
}

export default Hero