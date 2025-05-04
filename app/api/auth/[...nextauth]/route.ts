import { PrismaClient } from "@prisma/client";
import NextAuth, { NextAuthOptions, TokenInfo, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { localAuthOptions } from "../authoptions";



// do not name this authOptions and export, as it will conflict with the default export of NextAuth



const handler = NextAuth(localAuthOptions);

export { handler as GET, handler as POST };
