"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Upload } from "lucide-react"
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
  const [avatarFileName, setAvatarFileName] = useState<string>("")
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

      setUser(user)

      // Fetch profile data
      const { data, error } = await supabase.from("profiles").select("username, avatar_url").eq("id", user?.id).single()

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
  }, [supabase])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // Check file type
      if (!file.type.match(/image\/(jpeg|png)/)) {
        toast({
          title: "無效的檔案類型",
          description: "只允許 JPG 和 PNG 圖片",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "檔案太大",
          description: "最大檔案大小為 5MB",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      setAvatarFileName(file.name)

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
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        // 先嘗試刪除舊的頭像（如果存在）
        if (avatarUrl && avatarUrl.includes('avatars')) {
          const oldFileName = avatarUrl.split("/").pop()
          if (oldFileName) {
            await supabase.storage
              .from("avatars")
              .remove([`${user.id}/${oldFileName}`])
          }
        }

        // 上傳新的頭像
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, {
            upsert: true,
            cacheControl: "3600"
          })

        if (uploadError) {
          console.error("Upload error:", uploadError)
          throw uploadError
        }

        // 獲取公開 URL
        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName)

        newAvatarUrl = publicUrl
      }

      // 更新個人資料
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Update error:", updateError)
        throw updateError
      }

      toast({
        title: "個人資料已更新",
        description: "您的個人資料已成功更新",
      })

      // 刷新頁面以顯示更新後的數據
      router.refresh()
    } catch (error: any) {
      console.error("Profile update error:", error)
      setError(error.message || "更新個人資料失敗")
      toast({
        title: "更新個人資料失敗",
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
      <h1 className="text-3xl font-bold text-center mb-6">個人資料</h1>

      <Card>
        <CardHeader>
          <CardTitle>個人資訊</CardTitle>
          <CardDescription>更新你的個人資訊和頭像</CardDescription>
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
              <AvatarImage src={avatarUrl || ""} alt={username} />
              <AvatarFallback>{username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>

            <div className="w-full">
              <Label htmlFor="avatar" className="block mb-2">
                頭像 (僅限 JPG 或 PNG)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  選擇圖片
                </Button>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {avatarFileName && (
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {avatarFileName}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">僅限 JPG 或 PNG，最大檔案大小：5MB</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input id="email" value={user?.email || ""} disabled />
            <p className="text-xs text-muted-foreground">無法更改電子郵件</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">用戶名稱</Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={updateProfile} 
            disabled={updating || !username.trim()} 
            className="w-full"
          >
            {updating ? "更新中..." : "更新個人資料"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
