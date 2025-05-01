'use client';

import { useSnackbar } from "@/components/snackbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validUsername } from "@/types/user";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Signup() {
    const searchParams = useSearchParams();
    const nameParam = searchParams.get("name");
    const { addSnackbarMessage } = useSnackbar();
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token");
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState(nameParam || "");
    const [username, setUsername] = useState("");

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value[0])) {
            addSnackbarMessage({ text: "Username must start with a letter", error: true, duration: 5000 });
            return;
        }
        if (value.length > 20) {
            addSnackbarMessage({ text: "Username must be 20 or fewer characters", error: true, duration: 5000 });
            return;
        }
        if (value.length < 3) {
            addSnackbarMessage({ text: "Username must be at least 3 characters", error: true, duration: 5000 });
            setUsername(value);
            return;
        }
        if (!validUsername(value)) {
            addSnackbarMessage({ text: "Username can only contain letters, numbers, and underscores", error: true, duration: 5000 });
            return;
        }
        setUsername(value);
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("signing up...")
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                token,
                username
            }),
            credentials: "include",
        });
        if (res.ok) {
            addSnackbarMessage({ text: "Account created successfully", duration: 5000 });
            // Log in the user with FakeCredentials
            const loginResponse = await signIn("credentials", {
                email, // Pass the email
                token, // Pass the token
                callbackUrl: "/", // Redirect to home page after login
                redirect: false, // Prevent automatic redirection to handle response manually
            });

            if (loginResponse?.error) {
                addSnackbarMessage({ text: "Error signing in: " + loginResponse.error, error: true, duration: 5000 });
                console.error("Error signing in: ", loginResponse.error);
            } else {
                console.log("User signed in successfully");
                // Redirect to the home page
                window.location.href = "/";
            }
        } else {
            console.error("Signup failed");
            const errorData = await res.json();
            addSnackbarMessage({ text: "Error signing up: " + errorData.error, error: true, duration: 5000 });
            console.error("Error: ", errorData);
        }
        setIsLoading(false);
    }
    return (
        <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
            <Card>
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Welcome! Let's complete your account setup.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <Input
                                id="signup-email"
                                type="email"
                                placeholder="example@example.com"
                                value={email}
                                disabled
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={handleUsernameChange}
                                required
                            />
                            {/* <p className="text-sm text-muted-foreground">
                                Usernames are alphanumeric and can contain underscores, and must be between 3 and 20 characters long.
                                Must start with a letter.
                            </p> */}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
