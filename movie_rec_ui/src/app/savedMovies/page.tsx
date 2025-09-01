'use client';

import React from 'react'
import Image from 'next/image';
import { useGetSavedMoviesQuery } from '../redux/slices/savedMoviesSlice';

export default function SavedMovies() {
  const {data} = useGetSavedMoviesQuery();

  const movies = data ? data : [];

  if (movies.length === 0) {
    return (
      <div>
        <p> No saved movies</p>
      </div>
    )
  }

  return (
    <div>
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
