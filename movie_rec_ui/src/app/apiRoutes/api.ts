import axios from 'axios';

// Abstract the env variable yay
export default axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_ROUTE,
});