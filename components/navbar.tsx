"use client"

import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

interface NavbarProps {
  user: User | null
  avatarUrl: string | null
}

export default function Navbar({ user, avatarUrl }: NavbarProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

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
              首頁
            </Link>
            <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
              關於
            </Link>

            {user ? (
              <>
                <Link
                  href="/messages"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800"
                >
                  訊息
                </Link>
                <Link
                  href="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800"
                >
                  個人資料
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-white hover:bg-gray-800"
                  size="sm"
                >
                  登出
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                登入
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
