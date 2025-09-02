'use client';

import React from 'react'
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useGetSavedMoviesQuery } from '../redux/slices/savedMoviesSlice';

export default function SavedMovies() {
  const {data} = useGetSavedMoviesQuery();
  const router = useRouter();

  const movies = data ? data : [];

  if (movies.length === 0) {
    return (
      <div>
        <p> No saved movies</p>
      </div>
    )
  }

  const backToRecommendationPage = () => {
    router.push("/recommendationPage");
  }
  

  return (
    <div>
      <div>
        <button onClick={backToRecommendationPage}>
          Back to recommendation page
        </button>
      </div>
      SavedMovies:
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
