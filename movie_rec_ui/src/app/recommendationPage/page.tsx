'use client';
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const [locked, setLocked] = useState(true);
  const [tooManyRequests, setTooManyRequests] = useState(false);
  const [results, setResults] = useState<Movie[] | any>(null);
  

  const user = useSelector((state: RootState) => state.profile)

  // Send form results to the model and retrieve 
  // similar movies
  const handleQuery = async ({title, year, k}: Movies) => {
    setLoading(true)
    setResults(null)

     
     const response: Movie[] | unknown = await getRecommendations(title, year, k);

     console.log(response);

     if (response != 429) {
        setResults(response);
        setLoading(false);
     }  

     // Too many requests
     else if (response == 429) {
      setLoading(true)
      setResults(null);
      router.push("/tooManyRequests");
     }

     else {
        setResults(null)
        setLoading(true)
        router.push("/unkownError");
     }
  }

    return (
      // Show user the results of their query
      <div>
          <div>
            User: {user.username}
          </div>
          <div>
            <button onClick={() => signOut({
              callbackUrl: "/"
              })}> Sign Out 
            </button>
          </div>
        <SubmissionForm onSubmit={handleQuery} loading={loading}/>
        {/* Reaching here means their query was a success */}
        <div>
          {results === null ? (
              <p>Press enter to query, top movies will show here</p>
          ) : ( 
            <ul>
              Top movies:
              {/* List out their recommendations */}
              {results.map((r: any) => (
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

