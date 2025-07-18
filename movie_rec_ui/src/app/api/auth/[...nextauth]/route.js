import { loginUser } from "@/app/services/user"
import djangoRoute from "@/app/apiRoutes/djangoAPI"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

// Configure auth
export const authOptions = {
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: {label: "Username", type: "text",},
                password: {label: "Password", type: "password"}
            },
            async authorize(credentials) {

                if (credentials) {

                    console.log("Username: ", credentials.username);
                    console.log("Password: ", credentials.password);

                    try {

                    const response = await loginUser({
                        username: credentials.username,
                        password: credentials.password,
                    })

                    console.log(response);

                } catch (error) {
                    console.log("Error logging in: ", error);
                }



                    return {
                        username: credentials.username,
                        password: credentials.password
                    };
                }
                // Could not verify credentials
                return null;
            }
        }),

        GoogleProvider({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET_KEY
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET_KEY,
};

// Send it to the project
const handler =  NextAuth(authOptions);
export {handler as GET, handler as POST};