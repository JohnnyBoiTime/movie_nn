'use client'
import { useState } from "react";
import Image from "next/image";
import SubmissionForm, {Movies} from "../components/submitForm";
import { getRecommendations } from "../services/neuralNet";

export default function RecommendationPage() {

    // Format of the json response
    interface Movie {
        id: number,
        movie: string,
        yearOfRelease: string,
        description: string,
        poster: string,
        similarityScore: number
    };

  // Store results and let user know if loading or not
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[] | any>(null);

  const handleQuery = async ({title, year, k}: Movies) => {
    setLoading(true)
    setResults(null)

     const response = await getRecommendations(title, year, k);

     console.log(response);

     if (response) {
        setResults(response);
        setLoading(false);
     } else {
        console.error("No recommendations found.");
     }
  }


    return (
      // Show user the results of their query
      <div>
        <SubmissionForm onSubmit={handleQuery} loading={loading}/>

        {/* Reaching here means their query was a success */}
        {results && (
          <ul>

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
    );
}

