import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: number; // Add the custom `id` field
            name: string;
            email: string;
            image?: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        email: string;
    }
}
