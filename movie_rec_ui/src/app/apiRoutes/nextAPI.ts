import axios from 'axios';

// Abstract the env variable yay
export const nextRoute = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_ROUTE,
});

export default nextRoute