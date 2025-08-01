import { loginUser } from "@/app/services/user"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

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
                    await loginUser({
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
    ],
    secret: process.env.NEXTAUTH_SECRET_KEY,
};

// Send it to the project
export default NextAuth(authOptions);