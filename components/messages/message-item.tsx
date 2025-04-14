"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { getSupabaseBrowser } from "@/lib/supabase"
import { UserAvatar } from "@/components/auth/user-avatar"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MessageItemProps {
  id: string
  content: string
  createdAt: string
  userId: string
  username: string
  avatarUrl: string | null
  currentUser: User | null
  onMessageDeleted: () => void
}

export function MessageItem({
  id,
  content,
  createdAt,
  userId,
  username,
  avatarUrl,
  currentUser,
  onMessageDeleted,
}: MessageItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = getSupabaseBrowser()

  const canDelete = currentUser && currentUser.id === userId

  const handleDelete = async () => {
    if (!canDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("messages").delete().eq("id", id)

      if (error) throw error

      onMessageDeleted()
    } catch (error) {
      console.error("Error deleting message:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="flex-shrink-0">
        <UserAvatar user={{ id: userId, email: username } as User} avatarUrl={avatarUrl} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Message</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this message? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="mt-2 whitespace-pre-wrap break-words">{content}</div>
      </div>
    </div>
  )
}
