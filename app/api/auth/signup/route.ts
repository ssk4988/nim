import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { name, email, token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }
        console.log(name, email, token);

        jwt.verify(token, process.env.JWT_SECRET!);
        console.log("Token is valid");
        const newUser = await prisma.users.create({
            data: {
                name,
                email,
            },
        });
        const response = NextResponse.json({ message: "User created successfully" }, { status: 200 });
        console.log("New user created: ", newUser);
        return response;
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
}
