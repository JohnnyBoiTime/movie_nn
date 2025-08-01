import axios from 'axios';

    const API_BASE = process.env.NEXT_PUBLIC_BASE_ROUTE; // Dev
    // const API_BASE = process.env.NEXT_PUBLIC_BASE_ROUTE_TEST; // Prod

// Axios for pre-csrf
const preCSRFF = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true,
});


// Axios for csrf 
const csrfRoute = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': 'csrftoken',
    },
});
   

// Cookeis + csrf token
csrfRoute.interceptors.request.use(async (config) => {

    const token = await preCSRFF.get('/csrf/');
    config.headers['X-CSRFToken'] = token;    

    return config;
})


export default csrfRoute;