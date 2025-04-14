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
import { useToast } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const supabase = getSupabaseBrowserClient()
  const { addToast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setShowRegisterPrompt(true)
          return
        }
        throw error
      }

      addToast("登入成功，歡迎回來！", "success")
      
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error("登入錯誤:", error)
      addToast("電子郵件或密碼錯誤", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (password.length < 6) {
      addToast("密碼必須至少包含 6 個字符", "error")
      setLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes("User already registered")) {
          setShowLoginPrompt(true)
          return
        }
        throw authError
      }

      if (authData.user) {
        addToast("註冊成功，您的帳號已經創建成功！", "success")
        
        setPassword("")
        setEmail("")
        setActiveTab("login")
      }
    } catch (error: any) {
      console.error("註冊錯誤:", error)
      addToast(error.message || "註冊過程中發生錯誤", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      {/* 未註冊用戶提示對話框 */}
      <Dialog open={showRegisterPrompt} onOpenChange={setShowRegisterPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>尚未註冊？</DialogTitle>
            <DialogDescription>
              此電子郵件尚未註冊。您想要創建新帳號嗎？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowRegisterPrompt(false)}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                setActiveTab("register")
                setShowRegisterPrompt(false)
              }}
            >
              立即註冊
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 已註冊用戶提示對話框 */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>已經註冊？</DialogTitle>
            <DialogDescription>
              此電子郵件已經註冊。請直接登入。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowLoginPrompt(false)}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                setActiveTab("login")
                setShowLoginPrompt(false)
              }}
            >
              前往登入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <Label htmlFor="email">電子郵件</Label>
                  <Input
                    id="email"
                    type="email"
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
                  <p className="text-sm text-gray-500">
                    密碼必須至少包含 6 個字符
                  </p>
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
