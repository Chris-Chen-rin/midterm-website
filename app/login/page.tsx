"use client"

import type React from "react"
import { useState } from "react"
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
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const supabase = getSupabaseBrowserClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 使用 username 作為 email，加上特定域名
      const email = `${username}@user.local`
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "登入成功",
        description: "歡迎回來！",
        duration: 3000,
      })
      
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error("登入錯誤:", error)
      toast({
        title: "登入錯誤",
        description: "使用者名稱或密碼錯誤",
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
      // 使用 username 作為 email，加上特定域名
      const email = `${username}@user.local`
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 創建 profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: username,
              updated_at: new Date().toISOString()
            }
          ])

        if (profileError) throw profileError

        toast({
          title: "註冊成功",
          description: "您的帳號已經創建成功，請立即登入。",
          action: <Button onClick={() => setActiveTab("login")}>前往登入</Button>,
          duration: 5000,
        })
        
        setPassword("")
        setUsername("")
        setActiveTab("login")
      }
    } catch (error: any) {
      console.error("註冊錯誤:", error)
      toast({
        title: "註冊錯誤",
        description: error.message === "User already registered" 
          ? "此使用者名稱已被使用" 
          : "註冊過程中發生錯誤",
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
                  <Label htmlFor="username">使用者名稱</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="輸入使用者名稱"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  <Label htmlFor="register-username">使用者名稱</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="輸入使用者名稱"
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
