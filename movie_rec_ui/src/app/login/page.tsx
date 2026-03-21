import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";
import LoginPage from "./loginClient";

// Ensures a session for the user to either
// reactivate the users session, or have
// them log in as a guest
export default async function Login() {

    const session = await getServerSession(authOptions);

    // Reactivate users session
    if (session) {
        return redirect("/recommendationPage");
    }

    // No session, so go to login page
    else {
        return <LoginPage />
    }
}
