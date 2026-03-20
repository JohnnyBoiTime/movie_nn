import { verifyUser } from "@/app/services/user"
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

            if (!credentials) return null;

            try {
                const response = await verifyUser({
                    username: credentials.username,
                    password: credentials.password,
                });

                if (response.status === 200) {
                    return {
                        id: response.data.id ?? credentials.username,
                        name: credentials.username,
                    };
                }

                return null;

            } catch (error) {
                console.log("Error logging in: ", error);
                return null; 
            }
        }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET_KEY,
};
