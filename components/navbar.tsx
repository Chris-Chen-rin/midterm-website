import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

interface NavbarProps {
  user: User | null
  avatarUrl: string | null
}

export default function Navbar({ user, avatarUrl }: NavbarProps) {
  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              My Website
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
              Home
            </Link>
            <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
              About
            </Link>
            <Link href="/users" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
              View Users
            </Link>

            {user ? (
              <>
                <Link
                  href="/messages"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800"
                >
                  Messages
                </Link>
                <div className="flex items-center gap-2">
                  <Link href="/profile">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={avatarUrl || undefined} alt={user.email || "User"} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <form action="/api/auth/signout" method="post">
                    <Button type="submit" variant="ghost" className="text-white hover:bg-gray-800" size="sm">
                      Logout
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
