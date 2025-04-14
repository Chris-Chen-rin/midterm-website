'use client';

import Link from "next/link"
import { FC } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useEffect, useState } from "react"

const Home: FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "登出錯誤",
        description: error.message,
        variant: "destructive",
      })
      return
    }
    
    toast({
      title: "登出成功",
      description: "您已成功登出",
    })
    
    router.refresh()
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <Toaster />
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/background.svg?height=1080&width=1920')",
          // Replace the above with your actual image path when available
        }}
      >
        {/* Overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 text-white">
        <h1 className="text-4xl font-bold mb-6">Welcome to My Website</h1>
        <p className="text-xl text-center max-w-2xl mb-8">
          This is a brand new midterm website of 網路攻防實習 Practicum of Attacking and Defense of Network Security
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/about"
            className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-center hover:bg-white/30 transition-colors"
          >
            Learn About Me
          </Link>
          <Link
            href="/messages"
            className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-center hover:bg-white/30 transition-colors"
          >
            Messages
          </Link>
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500/80 hover:bg-red-500/90 text-white rounded-lg text-center transition-colors"
            >
              登出
            </Button>
          ) : (
            <Link
              href="/login"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition-colors"
            >
              Login/Register
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
