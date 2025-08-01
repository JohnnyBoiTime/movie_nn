import djangoRoute from "../apiRoutes/djangoAPI";
import csrfRoute from "../apiRoutes/csrfAPI";
import axios from "axios";

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

    try {

    const response = await csrfRoute.post('/register/', data);

    return response;

    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            // To many requests to register
            if (status === 429) {
                return 429;
            }
            // Other error
            else {
                return 201;
            }
        }
    }
}

export async function loginUser(data: Login) {

    const response = await djangoRoute.post('/login/', data);

    return response;
}

export async function fetchLoggedinUser() {

     const response = await djangoRoute.post('/user/');

    console.log(response);

    return response;
}