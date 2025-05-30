import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { isValidEmail, isValidUsername } from "@/types/user";
import { DEBUG } from "@/lib/constants";

const prisma = new PrismaClient();

interface RequestBody {
    name: string;
    email: string;
    username: string;
    token: string;
};

function isValidRequestBody(body: any): body is RequestBody {
    return (
        typeof body === "object" &&
        body !== null &&
        "name" in body &&
        "email" in body &&
        "username" in body &&
        "token" in body &&
        typeof body.name === "string" &&
        typeof body.email === "string" &&
        typeof body.username === "string" &&
        typeof body.token === "string"
    );
}

export async function POST(req: Request) {
    const requestBody = await req.json();
    if (!("name" in requestBody)) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!("email" in requestBody)) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!("username" in requestBody)) return NextResponse.json({ error: "Username is required" }, { status: 400 });
    if (!("token" in requestBody)) return NextResponse.json({ error: "Token is required" }, { status: 400 });
    if (!isValidRequestBody(requestBody)) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    const { name, email, username, token } = requestBody;
    if (DEBUG) console.log(name, email, token);

    try {
        jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.log("Token is valid");
    if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (!isValidUsername(username)) return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    const existingUser = await prisma.users.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) return NextResponse.json({ error: "User already exists with that email" }, { status: 400 });
    const existingUsername = await prisma.users.findUnique({
        where: {
            username,
        },
    });
    if (existingUsername) return NextResponse.json({ error: "User already exists with that username" }, { status: 400 });
    const newUser = await prisma.users.create({
        data: {
            name,
            email,
            username,
        },
    });
    if (!newUser) return NextResponse.json({ error: "Error creating user" }, { status: 500 });
    const response = NextResponse.json({ message: "User created successfully" }, { status: 200 });
    console.log("New user created: ", newUser);
    return response;
}
