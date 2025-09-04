import axios from 'axios';

    const API_BASE = process.env.NEXT_PUBLIC_BASE_ROUTE; // prod

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
   

// This works for session based CSRF tokens
csrfRoute.interceptors.request.use(async (config) => {

    const token = await preCSRFF.get('/csrf/');

    
    config.headers['X-CSRFToken'] = token.data.csrfToken;    
    return config;
})


// USE SESSION BASED CSRF TOKENS
// REMEMBER TO CLEAR COOKIES BEFORE TESTING EVERY TIME!
// Check for CSRF cookie every time before the request to
// register
/*
csrfRoute.interceptors.request.use(async (config) => {    
    if (!Cookies.get('csrftoken')) {        
        
        await preCSRFF.get('/csrf/');      
        console.log("CSRF token fetched and set in cookies.");    
    } 

    config.headers['X-CSRFToken'] = Cookies.get('csrftoken'); 
    
    
    return config;
})
    */


export default csrfRoute;