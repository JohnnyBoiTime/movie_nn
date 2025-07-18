import axios from 'axios'

const djangoRoute = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DJANGO_API_ROUTE,  
  withCredentials: true,
})

export default djangoRoute;