'use client';
import { useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SubmissionForm, {Movies} from "../components/submitForm";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useAddSavedMovieMutation } from "../redux/slices/savedMoviesSlice";
import { fetchLoggedinUser } from "../services/user";
import { getRecommendations } from "../services/neuralNet";

// Format of the json response
interface Movie {
    id: number,
    tmdb_id: number,
    movie: string,
    yearOfRelease: string,
    description: string,
    poster: string,
};

// Form of movie that is saved
type MovieFormat = {
    tmdb_id: number,
    title: string,
    year: number,
    movie_poster_url: string,
    description: string,
};

export default function RecommendationPage() {

  const [addSavedMovie] = useAddSavedMovieMutation();

  const router = useRouter();

  // Store results and let user know if loading or not
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<Movie[] | null | undefined | number>(null);

  const user = useSelector((state: RootState) => state.profile)

  // Send form results to the model and retrieve 
  // similar movies
  const handleQuery = async ({title, year, numGenres, k}: Movies) => {
    setLoading(true)
    setResults(null)

    // k + 1 because the user asks for 5 recommended movies.
    // Since we include the current queried movie, we do 
    // k + 1 to have their 5 recommended movies based on their
    // query
    const recommendedMovies = k + 1;
     
     const response: Movie[] | number | undefined = await getRecommendations(title.trim().toLowerCase(), year, numGenres, recommendedMovies);
     
     console.log(numGenres)

     console.log(response);

    // Too many requests
     if (response == 429) {
        setLoading(true)
        setResults(null);
        router.push("/tooManyRequests");
     }  

     // Movie does not exist, or error typing in movie
     else if (response == 300) {
        setResults([]);
        setLoading(false);
        setMessage("Do you have the correct day and year? If the movie was entered in correctly, the movie may not exist in the database!")
     }

     else {
        setResults(response);
        setLoading(false);
     }
  }

  const verifyUser = async () => {
    console.log("INSIDE")
    const response = await fetchLoggedinUser();
    console.log(response);
  }

  // Sends movie to database to save it
  const handleSavingMovie = useCallback(async (saveMovie: MovieFormat) => {
    try {

      console.log(saveMovie);

      await addSavedMovie(saveMovie).unwrap();
    }
    catch(error) {
      console.error("Could not save the movie!:", error);
    }
  }, [addSavedMovie]);

    return (
      // Show user the results of their query
      <div>
        <div className="horizontal flex justify-between">
          <div>
            User: {user.username}
          </div>
          {user.username === 'Guest' ? (
            <div>
              Log in to save movies!
            </div>
          ) : (
            <div>
             <Link href='/savedMovies' style={{textDecoration: 'underline'}}>
             Saved Movies
              </Link>
          </div>
          )}
        </div>
          {user.username === 'Guest' ? (
          <div>        
            <Link href="/login" style={{textDecoration: 'underline'}}>
              Go back to login
            </Link>
          </div>
          ) : (
            <div>        
            <button onClick={() => signOut({
              callbackUrl: "/"
              })}> Sign Out 
            </button>
            <div>
              <button onClick={verifyUser}>
                Verfify login
              </button>
              </div>
          </div>
          )}
        <SubmissionForm onSubmit={handleQuery} loading={loading}/>
        {/* Reaching here means their query was a success */}
        <div>
          {results === null && loading === false ? (
              <p>Press enter to query, top movies will show here. Some movies may not exist in the system, and some movies may not have
                enough worthy recommendations to show, so shown results may be less than amount chosen 
                to recommend.
              </p>
          ) : ( 
            <ul>
              {message}
              {/* List out their recommendations */}
              {Array.isArray(results) && results.map((r: Movie) => (
                <li key={r.id}>
                  <strong>Movie: {r.movie} ({r.yearOfRelease}) </strong>
                  <Image src={r.poster} width={200} height={200} alt="Movie" />
                  <div>
                    <strong>Description:</strong>
                    <div>
                      <strong>{r.description}  </strong>
                    </div>
                    {user.username === 'Guest' ? (
                      <div>
                        Log in to save movies
                      </div>
                    ) : (
                      <div>
                      <button onClick={() => handleSavingMovie({tmdb_id: r.tmdb_id, title: r.movie, year: Number(r.yearOfRelease), movie_poster_url: r.poster, description: r.description})}>
                      Save Movie
                    </button>
                    </div>
                    )}

                      
                  </div>
                  <br />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
}

