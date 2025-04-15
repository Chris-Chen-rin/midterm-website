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
  const [userProfile, setUserProfile] = useState<any>(null)
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

        // 獲取用戶個人資料
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error("獲取個人資料錯誤:", profileError)
        } else {
          setUserProfile(profile)
        }
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
        console.log("正在獲取訊息...", user.id)
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })

        if (messagesError) {
          console.error("獲取訊息錯誤:", messagesError.message, messagesError.details, messagesError.hint)
          throw messagesError
        }

        // 獲取所有相關的用戶資料
        const userIds = messages?.map(msg => msg.user_id) || []
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)

        if (profilesError) {
          console.error("獲取用戶資料錯誤:", profilesError.message, profilesError.details, profilesError.hint)
          throw profilesError
        }

        // 合併訊息和用戶資料
        const mergedData = messages?.map(msg => {
          const profile = profiles?.find(p => p.id === msg.user_id)
          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            user_id: msg.user_id,
            profiles: {
              username: profile?.username || '未知用戶',
              avatar_url: profile?.avatar_url || null
            }
          }
        }) || []

        setMessages(mergedData)
      } catch (error: any) {
        console.error('Error fetching messages:', error.message, error.details, error.hint)
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
      console.log("正在發送訊息...", user.id)
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) {
        console.error("發送訊息錯誤:", error.message, error.details, error.hint)
        throw error
      }

      if (data) {
        // 獲取用戶資料
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error("獲取用戶資料錯誤:", profileError.message, profileError.details, profileError.hint)
          throw profileError
        }

        setMessages(prev => [{
          id: data.id,
          content: data.content,
          created_at: data.created_at,
          user_id: data.user_id,
          profiles: {
            username: profile?.username || '未知用戶',
            avatar_url: profile?.avatar_url || null
          }
        }, ...prev])
        setNewMessage('')
        toast({
          title: "成功",
          description: "訊息發送成功！",
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error('發送訊息失敗:', error.message, error.details, error.hint)
      toast({
        title: "錯誤",
        description: error.message || "發送訊息失敗，請稍後再試",
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">留言板</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>發送新留言</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={userProfile?.avatar_url || ""} 
                    alt={userProfile?.username || user?.email || "User"}
                  />
                  <AvatarFallback>{userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="輸入您的留言..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[100px] flex-1"
                />
              </div>
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
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={message.profiles.avatar_url || ""} 
                      alt={message.profiles.username}
                    />
                    <AvatarFallback>{message.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold">{message.profiles.username}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      {user?.id === message.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(message.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
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

