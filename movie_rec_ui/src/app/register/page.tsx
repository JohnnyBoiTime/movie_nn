'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {registerUser} from "../services/user"

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
    });
    const router = useRouter();

    // Registration proccess
    async function registrationForm(e: React.FormEvent) {

        e.preventDefault();

        const registerTheUser = await registerUser(form);

        if (registerTheUser === 201) {
            console.error("Could not register user: ", registerTheUser);
        } else if (registerTheUser === 429) {
            router.push('/tooManyRegistrations')
        } else {
            console.log("Successfully registered!");
            router.replace("./login");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black-100">
            <div className="bg-black p-8 rounded-2xl shadow-md w-full max-w-md">
                <div className="justify-center items-center text-center">
                    <h1 className="text-white text-xl font-bold mb-4">
                        Create an Account
                    </h1>
                </div>
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
                    <button 
                    type="submit"
                    className="cursor-pointer">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
} 