import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_BASE_ROUTE;

// Axios for pre-csrf
const preCSRFF = axios.create({
    baseURL: `${API_BASE}/api`, // For production
    // baseURL: '/api', // For testing
    withCredentials: true,
    
});



// Axios for csrf 
const csrfRoute = axios.create({
    baseURL: `${API_BASE}/api`,
    //baseURL: '/api', // For testing
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

// Cookeis + csrf token
csrfRoute.interceptors.request.use(async (config) => {
    if (!document.cookie.includes('csrftoken=')) {
    await csrfRoute.get('/csrf/'); 
    console.log('CSRF token fetched');
  }
  return config;
})


export default csrfRoute;