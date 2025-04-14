"use client"

import type React from "react"

import { useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@supabase/supabase-js"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MessageFormProps {
  user: User
  onMessagePosted: () => void
}

export function MessageForm({ user, onMessagePosted }: MessageFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError("Message cannot be empty")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase.from("messages").insert({
        user_id: user.id,
        content: content.trim(),
      })

      if (error) throw error

      setContent("")
      onMessagePosted()
    } catch (error: any) {
      setError(error.message || "Failed to post message")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Textarea
        placeholder="Write your message here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="resize-none"
      />

      <Button type="submit" className="w-full" disabled={isSubmitting || !content.trim()}>
        {isSubmitting ? "Posting..." : "Post Message"}
      </Button>
    </form>
  )
}
