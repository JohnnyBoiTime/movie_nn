// https://www.freecodecamp.org/news/how-to-integrate-rtk-query-with-redux-toolkit

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";

export const savedMoviesapi = createApi({
    reducerPath: "savedMovies",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_DJANGO_API_ROUTE,
        credentials: "include",
        prepareHeaders: (headers) => {

        }

    }),
    endpoints: (builder) => {
        return {
            getSavedMovies: builder.query({
                query: (user) => ({
                    url: "savedMovies",
                    method: "GET",
                    body: user,
                })
            }),

            addSavedMovie: builder.mutation({
                query: (movie) => ({
                    url: "savedMovies",
                    method: "POST",
                    body: movie
                })
            })
        }
    }

})