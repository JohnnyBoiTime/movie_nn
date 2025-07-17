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

    const response = await csrfRoute.post('/register/', data);

    console.log(response);

    return response;
}

export async function loginUser(data: Login) {

    const response = await csrfRoute.post('/login/', data);

    console.log(response);

    return response;
}

export async function fetchLoggedinUser() {

     const response = await csrfRoute.post('/user/');

    console.log(response);

    return response;
}