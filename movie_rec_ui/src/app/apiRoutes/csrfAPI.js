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
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
    headers: {
        'Content-Type': 'application/json',
    },
});
   

// Cookeis + csrf token
csrfRoute.interceptors.request.use(async (config) => {
    if (!Cookies.get('csrftoken')) {
        await preCSRFF.get('/csrf/');

        console.log("CSRF token fetched and set in cookies.");
    }

    const cookie = Cookies.get("csrftoken")

    config.headers['X-CSRFToken'] = cookie;

    return config;
})


export default csrfRoute;