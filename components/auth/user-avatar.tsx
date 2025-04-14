"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@supabase/supabase-js"

interface UserAvatarProps {
  user: User | null
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ user, avatarUrl, size = "md" }: UserAvatarProps) {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20",
  }

  // Get initials from email or username
  const getInitials = () => {
    if (!user) return "G" // Guest

    const email = user.email || ""
    return email.charAt(0).toUpperCase()
  }

  return (
    <Avatar className={sizeClass[size]}>
      <AvatarImage src={avatarUrl || ""} alt="Profile" />
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  )
}
