"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"

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

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirect=/messages")
        return
      }

      setUser(user)
      fetchMessages()
    }

    const fetchMessages = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("messages")
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
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setMessages(data || [])
      setLoading(false)
    }

    checkUser()

    // Set up real-time subscription
    const subscription = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchMessages()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post a message",
        variant: "destructive",
      })
      return
    }

    if (!newMessage.trim()) return

    setSubmitting(true)

    try {
      const { error } = await supabase.from("messages").insert({
        content: newMessage.trim(),
        user_id: user.id,
      })

      if (error) throw error

      setNewMessage("")
    } catch (error: any) {
      console.error("Error posting message:", error.message)
      toast({
        title: "Error posting message",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("messages").delete().eq("id", id)

      if (error) throw error

      // Update local state
      setMessages(messages.filter((message) => message.id !== id))

      toast({
        title: "Message deleted",
        description: "Your message has been deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting message:", error.message)
      toast({
        title: "Error deleting message",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading && !user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Message Board</CardTitle>
          <CardDescription>Share your thoughts with others</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Write your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[100px]"
              required
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post Message"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Messages</h2>

        {loading ? (
          <div className="text-center p-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center p-8 bg-muted rounded-md">No messages yet. Be the first to post!</div>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex p-4">
                  <div className="mr-4 flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.profiles.avatar_url || ""} alt={message.profiles.username} />
                      <AvatarFallback>{message.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{message.profiles.username}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(message.created_at)}</p>
                      </div>
                      {user && user.id === message.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(message.id)}
                          aria-label="Delete message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="mt-2 whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
