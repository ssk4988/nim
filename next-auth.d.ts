import NextAuth from "next-auth";

declare module "next-auth" {
    // session object passed to frontend
    interface Session {
        user: {
            id: number; // Add the custom `id` field
            name: string;
            username: string; // Add the custom `username` field
            email: string;
            image?: string;
            token: string; // Add the custom `token` field, JWT of id, name, email
        };
    }
    // token object encoded in JWT, passed to frontend and websocket server from frontend
    interface TokenInfo {
        id: number; // Add the custom `id` field
        username: string; // Add the custom `username` field
        name: string;
        email: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        email: string;
    }
}
