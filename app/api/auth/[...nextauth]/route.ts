import NextAuth from "next-auth";
import { localAuthOptions } from "../authoptions";



// do not name this authOptions and export, as it will conflict with the default export of NextAuth



const handler = NextAuth(localAuthOptions);

export { handler as GET, handler as POST };
