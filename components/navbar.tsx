"use client"

import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user: initialUser }: NavbarProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(true) // ✅ 加入 loading 判斷

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setLoading(false)
      }
    }
    getCurrentUser()
  }, [supabase])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 300)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold text-white">
            My Website
          </Link>
          {!loading && (
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800"
              >
                首頁
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800"
              >
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
          )}
        </div>
      </div>
    </nav>
  )
}
