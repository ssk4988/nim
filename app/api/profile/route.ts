import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();


// gets the user profile
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user;
    const userId = user.id;
    const userProfile = await prisma.users.findUnique({
        where: {
            userid: userId,
        },
    });
    if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(userProfile, { status: 200 });
}
