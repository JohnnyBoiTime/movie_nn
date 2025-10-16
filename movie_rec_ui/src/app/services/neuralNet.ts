import djangoRoute from "../apiRoutes/djangoAPI";
import axios from "axios";

// Format of the json response
interface Movie {
    id: number,
    tmdb_id: number,
    movie: string,
    yearOfRelease: string,
    description: string,
    poster: string,
    trailerSite: string,
    trailerKey: string,
};

// Gets the recommendations from the neural network
export async function getRecommendations(title: string, year: string, numGenres: number, k: number){

    try {

        const response = await djangoRoute.get<Movie[] | null>("/movieRecommendationService/",
                {
                params: {title, year, numGenres, k}
                }
            );  
    
        console.log(response);

        return response.data ?? [];

   } catch(error: unknown) {
     if (axios.isAxiosError(error)) {
      const status = error.response?.status;

        // Too many requests!
        if (status === 429) {
          return 429;
        }
        else {
          return 300;
        }

     }
      
  
  } finally {
    console.log("Finished getting recs!");
  };

}     