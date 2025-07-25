'use client';
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { liveGameTypes, liveTimeControlTypes } from "@/websocket/game-util";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayGameType, displayTimeControl } from "@/types/games";
import LoadingScreen from "@/components/ui/loading";
import { useSnackbar } from "@/components/snackbar";
import { UserProfile } from "@/types/user";
import { DEBUG } from "@/lib/constants";

function NotFoundProfile() {
    return (
        <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
            <div className="text-center">
                <p className="text-lg font-semibold">Profile not found</p>
            </div>
        </div>
    )
}

export default function Profile() {
    const params = useParams();
    const username = params.username as string;
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const { addSnackbarMessage } = useSnackbar();
    
    const handleLogout = async () => {
        setIsLoading(true);
        await signOut({ callbackUrl: "/" });
    };
    
    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                }),
                credentials: "include",
            });
            
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                if (DEBUG) console.log("Profile data: ", data);
            } else {
                addSnackbarMessage({ text: response.statusText, error: true, duration: 5000 });
                console.error("Failed to fetch profile: ", response.statusText);
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);
    
    if (!username) return <NotFoundProfile />;

    if (isLoading) {
        return <LoadingScreen text="Loading profile..." />;
    }
    if (!profile) {
        return <NotFoundProfile />;
    }
    const createdat = new Date(profile.createdat);
    // format data as Month Year
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
    const formattedDate = createdat.toLocaleDateString("en-US", options);

    const gamesInfo = liveGameTypes.map((game) => {
        return liveTimeControlTypes.map((timeControl) => {
            const gameConfigString = `${game}_${timeControl}`;
            const gameWinString = `${game}_${timeControl}_wins`;
            const gameCountString = `${game}_${timeControl}_games`;
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
                    <p className="text-3xl font-bold">{profile.username}</p>
                    <p className="text-lg font-semibold">{profile.name}</p>
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
                <h2 className="text-2xl font-bold mb-4">Live Game Statistics</h2>
                {gamesInfo.length > 0 ?
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {gamesInfo}
                    </div> :
                    <p>No game statistics available. Play some live games!</p>}

            </div>
        </div>
    )
}
