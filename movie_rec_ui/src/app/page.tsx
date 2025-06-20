'use client'
import { useState } from "react";
import SubmissionForm, {Movies} from "./components/submitForm";
import api from "./apiRoutes/api";

// Format of the json response
interface Movie {
  id: number,
  movie: string,
  similarityScore: number
};

export default function Home() {

  // Store results and let user know if loading or not
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[] | null>(null);

  const handleQuery = async ({title, year, k}: Movies) => {
    setLoading(true)
    setResults(null)

    // Send info from the form to the api endpoint
    try {
      const nnResponse = await api.get("/movieRecommendationService/",
        {
          params: {title, year, k}
        }
      );
      console.log(nnResponse.data)
      setResults(nnResponse.data) // Store to show user
    } catch(error) {
      console.error("Could not do it: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Show user the results of their query
    <div>
      <SubmissionForm onSubmit={handleQuery} loading={loading}/>

      {/* Reaching here means their query was a success */}
      {results && (
        <ul>

          {/* List out their recommendations */}
          {results.map((r) => (
            <li key={r.id}>
              <strong>Movie: {r.movie}, similarity: {r.similarityScore} </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
