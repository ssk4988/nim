import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: number; // Add the custom `id` field
            name: string;
            email: string;
            image?: string;
            token: string; // Add the custom `token` field, JWT of id, name, email
        };
    }
    interface TokenInfo {
        id: number; // Add the custom `id` field
        name: string;
        email: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        email: string;
    }
}
