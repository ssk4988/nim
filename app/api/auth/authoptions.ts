import { PrismaClient } from "@prisma/client";
import NextAuth, { NextAuthOptions, TokenInfo, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const localAuthOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                token: { label: "Token", type: "text" }
            },
            authorize: async (Credentials, req) => {
                console.log("Authorizing Credentials: ", Credentials);
                const { email, token } = Credentials as { email: string, token: string };
                // Verify the token
                try {
                    jwt.verify(token, process.env.JWT_SECRET!);
                    console.log("Token is valid");
                } catch (error) {
                    console.error("Token verification failed:", error);
                    throw new Error("Token verification failed");
                }
                console.log("Credentials: ", email);
                // Check if the user exists in the database
                const user = await prisma.users.findUnique({
                    where: { email },
                });
                console.log("User: ", user);
                if (user) {
                    // If user exists, return the partial user object (used in callbacks)
                    return {
                        id: user.userid,
                        email: user.email,
                    } as unknown as User; // suspect type casting
                } else {
                    // If user does not exist, return null
                    return null;
                }
            },
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 1 * 24 * 60 * 60, // 1 day
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("sign in: ", user, account, profile);

            // Check if the user exists in the database
            const existingUser = await prisma.users.findUnique({
                where: { email: user.email! },
            });
            // Redirect to the sign-up page if the user does not exist
            if (!existingUser) {
                console.log(`User ${user.email} does not exist, redirecting to sign-up`);
                const token = jwt.sign(
                    { email: user.email, name: user.name, valid: true },
                    process.env.JWT_SECRET!,
                    { expiresIn: "10m" }
                );
                const queryParams = new URLSearchParams({
                    name: user.name || "",
                    email: user.email || "",
                    token
                });
                return `/auth/signup?${queryParams}`; // Redirect to the sign-up page
            }
            console.log(`User ${user.email} exists, allowing sign-in`);
            return true; // Allow sign-in if the user exists
        },
        async session({ session, token }) {
            console.log("session callback: ", session, token);
            // Add the user ID to the session object
            if (token.email && session.user) {
                if(!session.user.id || !session.user.name || !session.user.email || !session.user.username) {
                    const dbUser = await prisma.users.findUnique({
                        where: { email: token.email },
                    });
                    if (dbUser) {
                        if(dbUser.userid) session.user.id = dbUser.userid;
                        if(dbUser.name) session.user.name = dbUser.name;
                        if(dbUser.email) session.user.email = dbUser.email;
                        if(dbUser.username) session.user.username = dbUser.username;
                    }
                }
                if(!session.user.token) {
                    let token_info: TokenInfo = { email: session.user.email, name: session.user.name, id: session.user.id, username: session.user.username };
                    session.user.token = jwt.sign(
                        token_info,
                        process.env.JWT_SECRET!,
                        { expiresIn: "1d" } // 1 day
                    );
                }
            }
            return session;
        }

    },
    events: {
        createUser: async ({ user }) => {
            console.log("New user created:", user);
        },
    },
};
