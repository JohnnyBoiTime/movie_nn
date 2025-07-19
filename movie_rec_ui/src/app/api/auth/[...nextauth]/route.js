import { loginUser } from "@/app/services/user"
import djangoRoute from "@/app/apiRoutes/djangoAPI"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

// Configure auth
export const authOptions = {

    // Custom login page
    pages: {
        signIn: "/login",
    },
    providers: [

        // Basic credentials provider
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: {label: "Username", type: "text",},
                password: {label: "Password", type: "password"}
            },
            async authorize(credentials) {

                if (credentials) {

                    try {
                    
                        // Login the user by seeing if it exists in the database
                    const response = await loginUser({
                        username: credentials.username,
                        password: credentials.password,
                    })

                } catch (error) {
                    console.log("Error logging in: ", error);
                }
                    // Return user if it exists
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