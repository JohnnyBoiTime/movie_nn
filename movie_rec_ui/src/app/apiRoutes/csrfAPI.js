import axios from 'axios';
import Cookies from 'js-cookie';

// Axios for pre-csrf
const preCSRFF = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
});


// Axios for csrf 
const csrfRoute = axios.create({
    baseURL: '/api',
    withCredentials: true,
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

    config.headers['X-CSRFToken'] = Cookies.get('csrftoken');
    return config;
})


export default csrfRoute;