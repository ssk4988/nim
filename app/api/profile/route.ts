import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { localAuthOptions } from "../auth/authoptions";
import { isValidUsername, UserProfile } from "@/types/user";

const prisma = new PrismaClient();

// gets the user profile
export async function POST(req: Request) {
    const requestBody = await req.json();
    if (!("username" in requestBody)) {
        return NextResponse.json({ error: "No username provided" }, { status: 400 });
    }
    const username = requestBody.username;
    if (typeof username !== "string" || !isValidUsername(username)) {
        return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }
    const userProfile = await prisma.users.findUnique({
        where: {
            username: username,
        },
    });
    if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { email, userid, ...untypedUserProfile } = userProfile;
    const userProfileTyped: UserProfile = untypedUserProfile as UserProfile;
    
    return NextResponse.json(userProfileTyped, { status: 200 });
}
