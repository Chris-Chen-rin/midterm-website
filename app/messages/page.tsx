"use client"

import type { FormEvent } from "react"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"

interface Message {
  id: number
  content: string
  created_at: string
  user_email: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchMessages()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    setUserEmail(user.email)
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "錯誤",
        description: "無法載入留言",
        variant: "destructive",
      })
      return
    }

    setMessages(data || [])
    setIsLoading(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase.from("messages").insert([
      {
        content: newMessage.trim(),
        user_email: userEmail,
      },
    ])

    if (error) {
      toast({
        title: "錯誤",
        description: "無法發送留言",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "成功",
      description: "留言已發送",
    })

    setNewMessage("")
    fetchMessages()
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">載入中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8">留言板</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="輸入您的留言..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            發送
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{message.user_email}</span>
                <span className="text-sm text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700">{message.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
