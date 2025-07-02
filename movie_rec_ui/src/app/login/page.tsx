'use client'
import {signIn} from "next-auth/react";

export interface LoginInfo {
    email: string,
    username: string,
    password: string
};

export default function LoginPage() {
    return (
        <div>
            <button onClick={() => signIn("google", {callbackUrl: "/"})} >
                Sign in using google
            </button>
        </div>
    );
}