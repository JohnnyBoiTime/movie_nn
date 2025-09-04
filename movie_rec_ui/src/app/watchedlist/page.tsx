'use client';

import React from 'react'
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useGetWatchedMoviesQuery } from '../redux/slices/watchedList';

export default function WatchedMovies() {
  const {data} = useGetWatchedMoviesQuery();
  const router = useRouter();

  const movies = data ? data : [];

   const backToRecommendationPage = () => {
    router.push("/recommendationPage");
  }

  if (movies.length === 0) {
    return (
      <div>
        <p> No watched movies</p>
        <div>
          <button onClick={backToRecommendationPage}>
            Back to recommendation page
          </button>
        </div>
      </div>
    )
  }

  

  return (
    <div>
      <div>
        <button onClick={backToRecommendationPage}>
          Back to recommendation page
        </button>
      </div>
      WatchedMovies:
      <div>
        <ul>
          {movies.map((movie) => (
            <li key={movie.id}>
              <div>
                {movie.movie.title} ({movie.movie.year}) Saved: {new Date(movie.added_at).toLocaleDateString()}
              </div>
              <div>
                 <Image src={movie.movie.movie_poster_url} width={200} height={200} alt="Movie" />
              </div>
              <div>
                Description: {movie.movie.description}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>

  )
}
