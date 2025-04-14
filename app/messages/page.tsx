"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  user_email: string
  user_avatar: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const { addToast } = useToast()

  useEffect(() => {
    async function getMessages() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        addToast(error.message, "error")
        return
      }

      setMessages(data.map(message => ({
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        user_id: message.user_id,
        user_email: message.profiles.email,
        user_avatar: message.profiles.avatar_url,
      })))
      setLoading(false)
    }

    getMessages()

    // 設置即時訂閱
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        getMessages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('請先登入')

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          user_id: user.id,
        })

      if (error) throw error

      setNewMessage("")
      addToast("您的留言已發布", "success")
    } catch (error: any) {
      addToast(error.message, "error")
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (messageId: string, userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('請先登入')
      if (user.id !== userId) throw new Error('您只能刪除自己的留言')

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      addToast("留言已刪除", "success")
    } catch (error: any) {
      addToast(error.message, "error")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">載入中...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>留言板</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="寫下您的留言..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              {sending ? "發送中..." : "發送留言"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={message.user_avatar} alt={message.user_email} />
                  <AvatarFallback>{message.user_email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{message.user_email}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                    <DeleteButton
                      messageId={message.id}
                      userId={message.user_id}
                      onDelete={() => handleDelete(message.id, message.user_id)}
                    />
                  </div>
                  <p className="mt-2">{message.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DeleteButton({ messageId, userId, onDelete }: { messageId: string, userId: string, onDelete: () => void }) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getCurrentUser()
  }, [supabase])

  if (!currentUser || currentUser.id !== userId) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-700"
      onClick={onDelete}
    >
      刪除
    </Button>
  )
}
