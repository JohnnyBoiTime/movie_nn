import axios from 'axios'

const djangoRoute = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_DJANGO_API_ROUTE}`, // For production
  // baseURL: process.env.NEXT_PUBLIC_DJANGO_API_ROUTE_TEST, // For testing
  withCredentials: true,
})

export default djangoRoute;