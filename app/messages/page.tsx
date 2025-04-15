"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

type Message = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

type SupabaseMessage = {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!session?.user) {
          router.push("/login")
          return
        }
        setUser(session.user)
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [supabase, router])

  useEffect(() => {
    if (!user) return

    const fetchMessages = async () => {
      try {
        console.log("正在獲取訊息...")
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            user_id,
            profiles (
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error("獲取訊息錯誤:", error)
          throw error
        }
        
        console.log("獲取到的訊息:", data)
        const typedData = data as unknown as SupabaseMessage[]
        setMessages(typedData?.map(msg => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          user_id: msg.user_id,
          profiles: {
            username: msg.profiles.username,
            avatar_url: msg.profiles.avatar_url
          }
        })) || [])
      } catch (error: any) {
        console.error('Error fetching messages:', error)
        toast({
          title: "錯誤",
          description: error.message || "無法獲取訊息",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage,
            user_id: user.id
          }
        ])
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      if (data) {
        const typedData = data as unknown as {
          id: string;
          content: string;
          created_at: string;
          user_id: string;
          profiles: {
            username: string;
            avatar_url: string | null;
          };
        };
        
        setMessages(prev => [{
          id: typedData.id,
          content: typedData.content,
          created_at: typedData.created_at,
          user_id: typedData.user_id,
          profiles: {
            username: typedData.profiles.username,
            avatar_url: typedData.profiles.avatar_url
          }
        }, ...prev])
        setNewMessage('')
        toast({
          title: "成功",
          description: "訊息發送成功！",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('發送訊息失敗:', error)
      toast({
        title: "錯誤",
        description: "發送訊息失敗，請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "成功",
        description: "訊息已刪除",
        variant: "default",
      })
    } catch (error: any) {
      console.error("刪除訊息錯誤:", error)
      toast({
        title: "錯誤",
        description: error.message || "無法刪除訊息",
        variant: "destructive",
      })
    }
  }

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
      <Toaster />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">訊息牆</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>發送新訊息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <Textarea
                placeholder="輸入您的訊息..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                發送
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={message.profiles.avatar_url || ""} />
                    <AvatarFallback>{message.profiles.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{message.profiles.username}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                      {user?.id === message.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-2">{message.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

