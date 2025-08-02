'use client';
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SubmissionForm, {Movies} from "../components/submitForm";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { getRecommendations } from "../services/neuralNet";

// Format of the json response
    interface Movie {
        id: number,
        movie: string,
        yearOfRelease: string,
        description: string,
        poster: string,
        similarityScore: number
    };


export default function RecommendationPage() {

  const router = useRouter();

  // Store results and let user know if loading or not
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<Movie[] | null | undefined | number>(null);

  const user = useSelector((state: RootState) => state.profile)

  // Send form results to the model and retrieve 
  // similar movies
  const handleQuery = async ({title, year, k}: Movies) => {
    setLoading(true)
    setResults(null)

     
     const response: Movie[] | number | undefined = await getRecommendations(title.trim(), year, k);

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
        setMessage("Please check how you typed in the movie! Do you have the correct day and year? If the movie was entered in correctly, the movie may not exist in the database!")
     }

     else {
        setResults(response);
        setMessage("Top Movies: ")
        setLoading(false);
     }
  }

    return (
      // Show user the results of their query
      <div>
          <div>
            User: {user.username}
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
          </div>
          )}
        <SubmissionForm onSubmit={handleQuery} loading={loading}/>
        {/* Reaching here means their query was a success */}
        <div>
          {results === null ? (
              <p>Press enter to query (CASE SENSITIVE), top movies will show here. Some movies may not exist in the system, and some movies may not have
                enough worthy recommendations to show, so shown results may be less than amount chosen 
                to recommend
              </p>
          ) : ( 
            <ul>
              {message}
              {/* List out their recommendations */}
              {Array.isArray(results) && results.map((r: Movie) => (
                <li key={r.id}>
                  <strong>Movie: {r.movie} ({r.yearOfRelease}) {r.similarityScore}</strong>
                  <Image src={r.poster} width={200} height={200} alt="Movie" />
                  <div>
                    <strong>Description:</strong>
                    <div>
                      <strong>{r.description}  </strong>
                    </div>
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

