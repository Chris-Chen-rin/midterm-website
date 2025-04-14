"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.push(redirectTo)
      }
    }

    checkUser()
  }, [router, redirectTo, supabase.auth])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 檢查是否是未註冊用戶
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "登入失敗",
            description: "此電子郵件尚未註冊或密碼錯誤。需要註冊新帳號嗎？",
            action: <Button onClick={() => setActiveTab("register")}>立即註冊</Button>,
            duration: 5000,
          })
          return
        }
        throw error
      }

      toast({
        title: "登入成功",
        description: "歡迎回來！",
        duration: 3000,
      })
      
      // 延遲重定向以顯示成功訊息
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error("登入錯誤:", error.message)
      toast({
        title: "登入錯誤",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log('開始註冊流程')

    if (!username.trim()) {
      toast({
        title: "需要使用者名稱",
        description: "請輸入使用者名稱",
        variant: "destructive",
        duration: 3000,
      })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      toast({
        title: "密碼太短",
        description: "密碼必須至少包含 6 個字符",
        variant: "destructive",
        duration: 3000,
      })
      setLoading(false)
      return
    }

    try {
      console.log('嘗試註冊用戶:', { email, username })
      
      // 直接嘗試註冊
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        }
      })

      console.log('註冊結果:', { authData, error: authError?.message })

      if (authError) {
        if (authError.message.includes("User already registered")) {
          toast({
            title: "註冊錯誤",
            description: "此電子郵件已經註冊。請直接登入。",
            action: <Button onClick={() => setActiveTab("login")}>前往登入</Button>,
            duration: 5000,
          })
          return
        }
        throw authError
      }

      if (authData.user) {
        console.log('用戶創建成功，正在創建 profile')
        
        // 手動創建 profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: username,
              email: email,
              updated_at: new Date().toISOString()
            }
          ])

        console.log('Profile 創建結果:', { error: profileError?.message })

        if (profileError) {
          console.error('Profile 創建失敗:', profileError)
          throw profileError
        }

        toast({
          title: "註冊成功",
          description: "您的帳號已經創建成功，請立即登入。",
          action: <Button onClick={() => setActiveTab("login")}>前往登入</Button>,
          duration: 5000,
        })
        
        // 清空表單
        setEmail("")
        setPassword("")
        setUsername("")
        setActiveTab("login")
      }
    } catch (error: any) {
      console.error("註冊錯誤:", error)
      toast({
        title: "註冊錯誤",
        description: error.message || "註冊過程中發生錯誤",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Toaster />
      <Card className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登入</TabsTrigger>
              <TabsTrigger value="register">註冊</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">電子郵件</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密碼</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "登入中..." : "登入"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">電子郵件</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">使用者名稱</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">密碼</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "註冊中..." : "註冊"}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
