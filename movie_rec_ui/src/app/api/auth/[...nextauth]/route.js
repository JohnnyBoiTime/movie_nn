import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Configure auth
export const authOptions = {
    providers: [
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