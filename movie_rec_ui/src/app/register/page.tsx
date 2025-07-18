'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {signIn} from "next-auth/react";
import {registerUser, User} from "../services/user"

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
    });
    const router = useRouter();

    // Registration proccess
    async function registrationForm(e: React.FormEvent) {

        console.log("Submitting:", form)

        e.preventDefault();

        const registerTheUser = await registerUser(form);
        if (registerTheUser.status !== 201) {
            console.error("Could not register user: ", registerTheUser.data);
        } else {
            console.log("Successfully registered!");
            router.push("./login");
        }
    }

    return (
        <div>
            <div>
                {/* Very basic registration form */}
                <form onSubmit={registrationForm} className="flex flex-col space-y-4">
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
        </div>
    );
} 