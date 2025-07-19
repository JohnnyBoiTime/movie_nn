'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import {signIn} from "next-auth/react";
import { useDispatch} from "react-redux";
import {RootState, AppDispatch } from "../redux/store";
import {setUsername} from "../redux/slices/profileSlice";

interface Login {
    username: string;
    password: string;
}

export default function LoginPage() {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });
    const router = useRouter();

    const dispatch = useDispatch<AppDispatch>();

    // Registration and login
    async function loginForm(e: React.FormEvent) {

        console.log("Submitting:", form)

        e.preventDefault();

        // user exists in the database,
        // now log them in using next-auth and
        // create a session!
             const response = await signIn("credentials", {
                redirect: false,
                username: form.username,
                password: form.password,
            });

            console.log("Response from login: ", response);

            // Session created and user logged in!
            if (response?.ok){
                console.log("SUCCESSFULLY LOGGED IN!");
                dispatch(setUsername(form.username));
                router.replace("/");
            }
            else {
                console.error("Could not create session: ", response);
            }
    }

    return (
        <div>
            <div>
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
            </div>
            <div>
                <button onClick={() => signIn("google", {callbackUrl: "/"})} >
                    Sign in using google
                </button>
            </div>
            <div>
                --OR--
            </div>
            <div>
                <button onClick={() => router.push("/register")}>
                    Register
                </button>
            </div>
        </div>
    );
} 