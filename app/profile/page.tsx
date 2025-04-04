'use client';
import { signOut } from "next-auth/react";
import { use, useEffect, useState } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Profile() {
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<User | null>(null);
    const router = useRouter();

    const handleLogout = async () => {
        setIsLoading(true);
        await signOut({ callbackUrl: "/" });
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch("/api/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                console.log("Profile data: ", data);
            } else {
                console.error("Failed to fetch profile");
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
                <div className="text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        )
    }
    if (!profile) {
        return (
            <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
                <div className="text-center">
                    <p className="text-lg font-semibold">Profile not found</p>
                </div>
            </div>
        )
    }
    const createdat = new Date(profile.createdat);
    // format data as Month Year
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
    const formattedDate = createdat.toLocaleDateString("en-US", options);
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <p className="text-sm text-muted-foreground">Member since {formattedDate}</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
            <div className="container mx-auto mt-8">
                <h2>Games Played: {profile.games}</h2>
            </div>
        </div>
    )
}
