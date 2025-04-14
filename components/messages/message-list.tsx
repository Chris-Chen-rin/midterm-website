"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase"
import { MessageItem } from "@/components/messages/message-item"
import type { User } from "@supabase/supabase-js"
import { Skeleton } from "@/components/ui/skeleton"

interface MessageListProps {
  currentUser: User | null
}

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export function MessageList({ currentUser }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowser()

  const fetchMessages = async () => {
    setLoading(true)
    try {
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

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    // Set up real-time subscription
    const subscription = supabase
      .channel("messages-channel")
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
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-muted-foreground">No messages yet. Be the first to post!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          id={message.id}
          content={message.content}
          createdAt={message.created_at}
          userId={message.user_id}
          username={message.profiles.username}
          avatarUrl={message.profiles.avatar_url}
          currentUser={currentUser}
          onMessageDeleted={fetchMessages}
        />
      ))}
    </div>
  )
}
