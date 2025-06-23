import { NextResponse } from 'next/server';
import tmdbRoute from '../../../apiRoutes/tmdbAPI'   

// Get request for getting information from TMDB API
// for things like the recommended movie description,
// release date, etc. 

// Reroutes all GET requests to here.
export async function GET(request: Request) {

  // Obtain the search parameters to query the correct 
  // movie
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('query')  || ''
  const year  = searchParams.get('year')   || ''

  // Return data that is recieved, named "data"
  const { data } = await tmdbRoute.get('/search/movie', {
    params: { query: title, year }
  })

  // Send back json
  const first = data.results?.[0] ?? null
  return NextResponse.json(first)
}