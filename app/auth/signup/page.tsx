'use client';

import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function Signup() {
    const searchParams = useSearchParams();
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const { data: session } = useSession();
    console.log("session: ", session)

    const handleSignup = async () => {
        console.log("signing up...")
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                token
            }),
            credentials: "include",
        });
        if (res.ok) {
            console.log("Signup successful!");
            // Log in the user with FakeCredentials
            const loginResponse = await signIn("credentials", {
                email, // Pass the email
                token, // Pass the token
                callbackUrl: "/", // Redirect to home page after login
                redirect: false, // Prevent automatic redirection to handle response manually
            });

            if (loginResponse?.error) {
                console.error("Error signing in: ", loginResponse.error);
            } else {
                console.log("User signed in successfully");
                // Redirect to the home page
                window.location.href = "/";
            }
        } else {
            console.error("Signup failed");
            const errorData = await res.json();
            console.error("Error: ", errorData);
        }
    }
    return (
        <div>
            <h1>Welcome, {session?.user?.name}! Let's complete your account setup.</h1>
            <p> Name: {name}</p>
            <p> Email: {email}</p>
            <button onClick={handleSignup}>Finish Signup</button>
        </div>
    );
}
