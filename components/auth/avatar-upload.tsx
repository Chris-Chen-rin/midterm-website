"use client"

import type React from "react"

import { useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/auth/user-avatar"
import type { User } from "@supabase/supabase-js"
import { AlertCircle, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AvatarUploadProps {
  user: User
  avatarUrl: string | null
  onUploadComplete: (url: string) => void
}

export function AvatarUpload({ user, avatarUrl, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowser()

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()

      // Validate file type
      if (!["jpg", "jpeg", "png"].includes(fileExt?.toLowerCase() || "")) {
        throw new Error("Only jpg and png images are allowed.")
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Image size should be less than 2MB.")
      }

      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true })

      if (error) throw error

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      // Update user profile
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)

      if (updateError) throw updateError

      onUploadComplete(publicUrl)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <UserAvatar user={user} avatarUrl={avatarUrl} size="lg" />

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => document.getElementById("avatar-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Avatar"}
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/jpeg, image/png"
          onChange={uploadAvatar}
          className="hidden"
        />
      </div>
      <p className="text-xs text-muted-foreground">JPG or PNG. Max size 2MB.</p>
    </div>
  )
}
