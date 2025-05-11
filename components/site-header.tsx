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
import { signIn, useSession } from "next-auth/react"

function HeaderButton({ href, name, pathname }: {
    href: string,
    name: string,
    pathname: string
}) {
    let isActive = pathname.startsWith(href);
    let className = "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50";
    if (isActive) {
        className += " underline decoration-2 underline-offset-4";
    }
    return <NavigationMenuItem>
        <Link href={href} legacyBehavior passHref>
            <NavigationMenuLink
                className={className}
            >
                {name}
            </NavigationMenuLink>
        </Link>
    </NavigationMenuItem>

}

export function SiteHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;
    const userName = user?.username || "Guest";

    const profileButton = user ? (
        <Button variant="link" size="sm" asChild>
            <Link href={`/profile/${userName}`}>{userName}</Link>
        </Button>
    ) : (
        <Button size="sm" variant="ghost" onClick={() => signIn("google", undefined, { prompt: "login" })}>
            Login
        </Button>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center">
                <Link href="/" className="flex items-center gap-2 ml-2">
                    <Mountain className="h-5 w-5" />
                    <span className="hidden font-bold sm:inline-block">Nim Games</span>
                </Link>

                <NavigationMenu className="hidden md:ml-auto md:flex">
                    <NavigationMenuList>
                        <HeaderButton href="/articles" name="Articles" pathname={pathname} />
                        <HeaderButton href="/games" name="Games" pathname={pathname} />
                        <HeaderButton href="/live" name="Live" pathname={pathname} />
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="ml-auto flex items-center gap-2 md:ml-0">
                    {profileButton}
                </div>
            </div>
        </header>
    )
}

