"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("正在獲取用戶會話...")
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log("會話數據:", session)
        if (error) {
          console.error("獲取會話錯誤:", error)
          throw error
        }
        setUser(session?.user || null)
        console.log("當前用戶狀態:", session?.user || null)
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("登入狀態變化:", _event, session?.user)
      setUser(session?.user || null)
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  console.log("渲染時的用戶狀態:", user)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">載入中...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          {user ? `歡迎回來，${user.email}` : "歡迎來到我們的網站"}
        </h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>關於我們</CardTitle>
              <CardDescription>了解更多關於我們的信息</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                這是一個展示 Next.js 和 Supabase 整合的示例網站。
              </p>
            </CardContent>
          </Card>

          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>快速連結</CardTitle>
                <CardDescription>訪問您的個人空間</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild>
                  <a href="/messages">查看訊息</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/profile">編輯個人資料</a>
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={async () => {
                    console.log("正在登出...")
                    await supabase.auth.signOut()
                    console.log("登出完成")
                    router.refresh()
                  }}
                >
                  登出
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>登入或註冊</CardTitle>
                <CardDescription>開始使用我們的服務</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button asChild>
                  <a href="/login">登入</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/login">註冊</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
