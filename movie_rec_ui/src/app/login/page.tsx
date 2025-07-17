'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import {signIn} from "next-auth/react";
import { registerUser, loginUser, User} from "../services/user"

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
    });
    const router = useRouter();

    // Registration and login
    async function submissionForm(e: React.FormEvent) {

        console.log("Submitting:", form)

        e.preventDefault();

        // Registration process
        const registerTheUser = await registerUser(form);
        if (registerTheUser.status !== 201) {
            console.error("Registration failed: ", registerTheUser.data);
        }

        // Login process
        const loginTheUser = await loginUser({
            username: form.username,
            password: form.password,
        });
        if (loginTheUser.status === 200) {
            router.push("/");
        } else {
            console.error("Could not log in: ", loginTheUser.data);
        }
    }

    return (
        <div>
            <div>
                <form onSubmit={submissionForm} className="flex flex-col space-y-4">
                    <input 
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={e => setForm({...form, username: e.target.value})}
                        required
                    />
                    <input 
                        type="text"
                        placeholder="Email"
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
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
                        Register 
                    </button>
                </form>
            </div>
            <div>
                ---OR---
            </div>
            <div>
                <button onClick={() => signIn("google", {callbackUrl: "/"})} >
                    Sign in using google
                </button>
            </div>
        </div>
    );
} 