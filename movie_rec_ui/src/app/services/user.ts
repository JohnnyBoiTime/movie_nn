import djangoRoute from "../apiRoutes/djangoAPI";
import csrfRoute from "../apiRoutes/csrfAPI";

export interface Registration {
    username: string;
    email: string;
    password: string;
}

export interface Login {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
}

/********************************
 * API calls
 ********************************/
export async function registerUser(data: Registration) {

    const response = await djangoRoute.post('/register/', data);

    console.log(response);

    return response;
}

export async function loginUser(data: Login) {

    console.log("Inside of loginUser function:", data);

    const response = await djangoRoute.post('/login/', data);

    console.log("Response from the await: ", response);

    return response;
}

export async function fetchLoggedinUser() {

     const response = await djangoRoute.post('/user/');

    console.log(response);

    return response;
}