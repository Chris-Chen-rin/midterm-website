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
  const [error, setError] = useState("")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "登入成功",
          description: "歡迎回來！",
          variant: "default",
        })
        router.push("/profile")
      } else {
        if (response.status === 404) {
          toast({
            title: "登入失敗",
            description: "此帳號不存在",
            variant: "destructive",
          })
        } else {
          toast({
            title: "登入失敗",
            description: "請檢查您的用戶名和密碼",
            variant: "destructive",
          })
        }
      }
    } catch (err) {
      toast({
        title: "系統錯誤",
        description: "發生錯誤，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push(redirectTo)
      router.refresh()
    } catch (error: any) {
      console.error("Error signing in:", error.message)
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
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
        title: "註冊失敗",
        description: "請輸入用戶名",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "註冊成功",
          description: "您的帳號已成功創建",
          variant: "default",
        })
        router.push("/login")
      } else {
        if (response.status === 409) {
          toast({
            title: "註冊失敗",
            description: "此用戶名已被使用",
            variant: "destructive",
          })
        } else {
          toast({
            title: "註冊失敗",
            description: data.message || "註冊過程中發生錯誤",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "系統錯誤",
        description: "發生錯誤，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <Card className="w-full max-w-md">
        <Tabs defaultValue="login">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登入</TabsTrigger>
              <TabsTrigger value="register">註冊</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用戶名</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="請輸入用戶名"
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
                    placeholder="請輸入密碼"
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
                    placeholder="請輸入電子郵件"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-username">用戶名</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="請輸入用戶名"
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
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
