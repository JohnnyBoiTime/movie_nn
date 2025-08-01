import axios from 'axios';
import Cookies from 'js-cookie';

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
    },
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
});

// Cookeis + csrf token
csrfRoute.interceptors.request.use(async (config) => {
    if (!Cookies.get('csrftoken')) {
        await preCSRFF.get('/csrf/');

        console.log("CSRF token fetched and set in cookies.");
    }

    config.headers['X-CSRFToken'] = Cookies.get('csrftoken=');

    return config;
})


export default csrfRoute;