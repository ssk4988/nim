'use client';
import { signOut } from "next-auth/react";
import { use, useEffect, useState } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { gamesToSetup, timeControlsToSetup } from "@/websocket/game-util";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayGameType, displayTimeControl } from "@/types/games";
import LoadingScreen from "@/components/ui/loading";

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
        return <LoadingScreen text="Loading profile..." />;
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

    const gamesInfo = gamesToSetup.map((game) => {
        return timeControlsToSetup.map((timeControl) => {
            let gameConfigString = `${game}_${timeControl}`;
            let gameWinString = `${game}_${timeControl}_wins`;
            let gameCountString = `${game}_${timeControl}_games`;
            if (!(gameCountString in profile) || !(gameWinString in profile)) return null;
            const gameCount = profile[gameCountString as keyof typeof profile] as number;
            const gameWins = profile[gameWinString as keyof typeof profile] as number;
            if (gameCount === 0) return null;
            return <Card key={gameConfigString}>
                <CardHeader>
                    <CardTitle>{displayGameType(game)} {displayTimeControl(timeControl)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Games Played: {gameCount}</p>
                    <p>Wins: {gameWins}</p>
                    <p>Win Rate: {(gameWins / gameCount * 100).toFixed(2)}%</p>
                </CardContent>
            </Card>
        });
    }).flat().filter((game) => game !== null);

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
                <h2>Total Games Played: {profile.games}</h2>
            </div>
            <div className="container mx-auto mt-8">
                <h2 className="text-2xl font-bold">Game Statistics</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {gamesInfo}
                </div>
            </div>
        </div>
    )
}
