'use client'
import { useState } from "react";
import Image from "next/image";
import SubmissionForm, {Movies} from "./components/submitForm";
import djangoRoute from "./apiRoutes/djangoAPI";
import nextRoute from "./apiRoutes/nextAPI";

// Format of the json response
interface Movie {
  id: number,
  movie: string,
  yearOfRelease: string,
  description: string,
  poster: string,
  similarityScore: number
};

export default function Home() {

  // Store results and let user know if loading or not
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[] | null>(null);

  const handleQuery = async ({title, year, k}: Movies) => {
    setLoading(true)
    setResults(null)


    try {

     const response = await djangoRoute.get<Movie[]>("/movieRecommendationService/",
            {
              params: {title, year, k}
            }
          );  

          const movies = response.data;

          console.log(movies[0].poster)

      setResults(movies)

    /*
    // Image url info
    const imageURL = 'https://image.tmdb.org/t/p/';
    const imageSize = 'w200';

    // Store all the movies to set to results later to show user
    const movieArray: Movie[] = [];

    // Send info from the form to the api endpoint
    try {
       for (let i = 0; i < k; i++) {
          const nnResponse = await djangoRoute.get("/movieRecommendationService/",
            {
              params: {title, year, k}
            }
          );  
        
          const movieTitle = nnResponse.data[i].movie.split(" (")[0]; // Get title
          const movieYear = nnResponse.data[i].movie.split(" (")[1].split(")")[0]; // Get year    
          // Now get information about the recommended movies via TMDB database
          const { data } = await nextRoute.get("/search/movie",
            {
              params: {query: movieTitle, year: movieYear}
            }
          );    

          // Construction of the list of recommendations for the user
          movieArray[i] = {
            id: i,
            movie: movieTitle,
            yearOfRelease: data.release_date.split("-")[0],
            description: data.overview,
            poster: `${imageURL}${imageSize}${data.poster_path}`,
            similarityScore: nnResponse.data[i].similarityScore
          }
      } 

      */

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
