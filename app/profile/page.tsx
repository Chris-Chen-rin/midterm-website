"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { User } from "@supabase/supabase-js"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirect=/profile")
        return
      }

      setUser(user)

      // Fetch profile data
      const { data, error } = await supabase.from("profiles").select("username, avatar_url").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        })
      } else if (data) {
        setUsername(data.username)
        setAvatarUrl(data.avatar_url)
      }

      setLoading(false)
    }

    fetchUser()
  }, [router, supabase])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // Check file type
      if (!file.type.match(/image\/(jpeg|png)/)) {
        toast({
          title: "Invalid file type",
          description: "Only JPG and PNG images are allowed",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 2MB",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)

      // Create a preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateProfile = async () => {
    if (!user) return

    setUpdating(true)
    setError(null)

    try {
      let newAvatarUrl = avatarUrl

      // Upload avatar if a new one was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop()
        const filePath = `avatars/${user.id}.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        // Get the public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath)

        newAvatarUrl = publicUrl
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Refresh the page to show updated data
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-md py-12">
        <p className="text-center">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-12">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-6">Your Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile information and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} alt={username} />
              <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>

            <div className="w-full">
              <Label htmlFor="avatar" className="block mb-2">
                Profile Picture (JPG or PNG only)
              </Label>
              <Input id="avatar" type="file" accept="image/jpeg, image/png" onChange={handleAvatarChange} />
              <p className="text-xs text-muted-foreground mt-1">Maximum file size: 2MB</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled />
            <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={updateProfile} disabled={updating || !username.trim()} className="w-full">
            {updating ? "Updating..." : "Update Profile"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
