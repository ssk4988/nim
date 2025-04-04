import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// increments the number of games played by the user
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;
    const userId = user.id;
    
    try {
        const updatedUser = await prisma.users.update({
            where: {
                userid: userId,
            },
            data: {
                games: {
                    increment: 1, // Increment the `games` field by 1
                },
            },
        });
        if(!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Error updating games:", error);
        return NextResponse.json({ error: "Failed to update games" }, { status: 500 });
    }
}
