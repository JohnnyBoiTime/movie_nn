import djangoRoute from "../apiRoutes/djangoAPI";
import nextRoute from "../apiRoutes/nextAPI";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {authOptions} from "../api/auth/[...nextauth]/route"

// Format of the json response
interface Movie {
  id: number,
  movie: string,
  yearOfRelease: string,
  description: string,
  poster: string,
  similarityScore: number
};

// Gets the recommendations from the neural network
export async function getRecommendations(title: string, year: string, k: number) {

    // User is logged in! Can proceed with giving them recommendations 
    const movieArray: Movie[] = [];

    try {

        const response = await djangoRoute.get<Movie[] | null>("/movieRecommendationService/",
                {
                params: {title, year, k}
                }
            );  
    
        console.log(response);

        return response.data;

   } catch(error) {
      console.error("Could not do it: ", error);
  } finally {
    console.log("Finished getting recs!");
  };

}     