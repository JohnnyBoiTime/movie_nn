// https://www.freecodecamp.org/news/how-to-integrate-rtk-query-with-redux-toolkit

import { createApi, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

/**
 * 
    title = models.CharField(max_length=90)
    year = models.PositiveIntegerField(null=True, blank=True)
    movie_poster_url = models.URLField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
 */


// Form of movie that is saved
type MovieFormat = {
    title: string,
    year: number,
    movie_poster_url: string,
    description: string,
};

// Form of saved movie returned from the backend
type SavedMovie = {
    id: number,
    tmdb_id: number,
    added_at: string,
    movie: MovieFormat,
}




// Helper function to fetch csrf token for the session
const getCsrfToken = async () => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_ROUTE}/csrf/`, {
        credentials: "include",
    });
    if (!result.ok) {
        throw new Error("DID NOT WORK!");
    }
    const {csrfToken} = await result.json();
    return csrfToken as string;
}

export const savedMoviesapi = createApi({
    reducerPath: "savedMovies",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_DJANGO_API_ROUTE,
        credentials: "include",// For sessionId cookies
    }),

    // https://redux-toolkit.js.org/rtk-query/usage/automated-refetching
    tagTypes: ['SavedMovies'], // Caches results for fast retrieval, cache key based on timdb_id
    // Endpoints to retrieve the users saved movies
    endpoints: (builder) => {
        return {
            getSavedMovies: builder.query<SavedMovie[], void>({
                query: () => ({
                    url: "/savedMovies/",
            }),
            providesTags: (result) => 
                        result 
                        ? ['SavedMovies', ...result.map((r: SavedMovie) => ({type: 'SavedMovies' as const, id: r.id}))]
                        : ['SavedMovies'],
            }),
            
            // Adds a movie, so "mutates" the slice based on database change
            // SavedMovie = payload format sent in post
            // MovieFormat = format returned
            addSavedMovie: builder.mutation<SavedMovie, MovieFormat>({
                async queryFn(movie, queryApi, extraOptions, baseQuery) {
                    try {
                        const csrfToken = await getCsrfToken();
                        const result = await baseQuery({
                            url: "/savedMovies/",
                            method: "POST",
                            body: movie,
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrfToken,
                            },
                        });
                        
                        // Catch HTTP errors seperate from thrown errors
                        if ('error' in result) {
                            return {error: result.error as FetchBaseQueryError}
                        }
                        return { data: result.data as SavedMovie};
                    } catch (error: any) {
                        return {error};
                    };  
                },
                // Dont need to cache the saved movies. Once saved,
                // can forget
                invalidatesTags: ['SavedMovies']

            })
        }
    }

});

export const {useGetSavedMoviesQuery, useAddSavedMovieMutation} = savedMoviesapi;
