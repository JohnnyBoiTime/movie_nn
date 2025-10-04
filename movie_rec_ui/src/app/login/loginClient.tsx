'use client';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {signIn} from "next-auth/react";
import { useDispatch} from "react-redux";
import {AppDispatch } from "../redux/store";
import { loginUser } from "../services/user";
import {setUsername} from "../redux/slices/profileSlice";

export default function LoginPage() {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });
    const router = useRouter();

    const dispatch = useDispatch<AppDispatch>();

    // Registration and login
    async function loginForm(e: React.FormEvent) {

        e.preventDefault();

            // Create a next_auth session! 
            const nextAuthorize = await signIn("credentials", {
                redirect: false,
                username: form.username,
                password: form.password,
            });


            // Create a django session as well so we can have CSRF protection!
            await loginUser({
                username: form.username,
                password: form.password,
            })

            console.log("Response from login: ", nextAuthorize);

            // Session created and user logged in!
            if (nextAuthorize?.ok){
                dispatch(setUsername(form.username));
                router.replace("/");
            }
            else {
                console.error("Could not create session: ", nextAuthorize);
            }
    }

    return (
        <div>
            <div>
                <h1 className="text-center text-4xl font-extrabol mb-8">Welcome to movieNN!</h1>
                <h2 className="text-center text-xl mb-8"> Neural-network powered movie recommendation system.</h2>
                <h2 className="text-center text-xl mb-8"> Backend instance activates per request, so may take a while on first recommendation</h2>
                <h2 className="text-center text-xl mb-8"> Since instance is on a cold start and needs to warm up</h2>
            </div>
            <div className="h-screen w-full flex items-center justify-center px-4">
                <div className="w-full max-w-sm  p-8 rounded-2xl shadow-lg border">
                    <h1 className="text-center">Log in</h1>
                     {/* Very basic login form */}
                    <form onSubmit={loginForm} className="flex flex-col space-y-4">
                        <input 
                            type="text"
                            placeholder="Username"
                            value={form.username}
                            onChange={e => setForm({...form, username: e.target.value})}
                            required
                        />
                        <input 
                            type="text"
                            placeholder="Password"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            required
                        />

                            <button type="submit">
                                Login 
                            </button>
                    </form>
                    {/*
                    <div className="text-center border">
                    
                        <button onClick={() => signIn("google", {callbackUrl: "/"})} >
                            Sign in using google
                        </button>
                    
                    </div>
                    */}
                    <div className="text-center">
                        <Link href="/recommendationPage" style={{textDecoration: 'underline'}}  onClick={() => dispatch(setUsername("Guest")) }>
                            Continue as Guest
                        </Link>
                    </div>
                     <div className="text-center">
                        --OR--
                    </div>
                    <div className="text-center">
                        <Link className="text-center" style={{textDecoration: 'underline'}} href="/register">
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 