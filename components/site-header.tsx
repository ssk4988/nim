"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mountain } from "lucide-react"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { signIn, useSession } from "next-auth/react"

export function SiteHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;
    const userName = user?.name || "Guest";

    const profileButton = user ? (
        <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">{userName}</Link>
        </Button>
    ) : (
        <Button size="sm" variant="ghost" onClick={() => signIn("google", undefined, { prompt: "login" })}>
            Login
        </Button>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Mountain className="h-5 w-5" />
                    <span className="hidden font-bold sm:inline-block">Nim Hub</span>
                </Link>

                <NavigationMenu className="hidden md:ml-auto md:flex">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <Link href="/play" legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${pathname === "/" ? "bg-accent/50" : ""}`}
                                >
                                    Play
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/games" legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${pathname === "/" ? "bg-accent/50" : ""}`}
                                >
                                    Games
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/articles" legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${pathname.startsWith("/articles") ? "bg-accent/50" : ""}`}
                                >
                                    Articles
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="ml-auto flex items-center gap-2 md:ml-0">
                    {profileButton}
                </div>
            </div>
        </header>
    )
}

