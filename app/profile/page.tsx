"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/toast"

export default function ProfilePage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const { addToast } = useToast()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setAvatarUrl(data.avatar_url)
      }
    }

    getUser()
  }, [router, supabase])

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('請選擇一個圖片檔案')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      
      // 檢查檔案類型
      if (!['jpg', 'jpeg', 'png'].includes(fileExt?.toLowerCase() || '')) {
        throw new Error('只允許上傳 JPG 或 PNG 格式的圖片')
      }

      // 檢查檔案大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('圖片大小不能超過 5MB')
      }

      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(publicUrl)
      addToast("您的頭像已更新", "success")
    } catch (error: any) {
      addToast(error.message || "上傳頭像時發生錯誤", "error")
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>個人資料</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatarUrl || undefined} alt={user.email} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="outline"
                className="relative"
                disabled={uploading}
              >
                {uploading ? "上傳中..." : "更換頭像"}
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/jpeg,image/png"
                  onChange={uploadAvatar}
                  disabled={uploading}
                />
              </Button>
              <p className="text-sm text-gray-500">
                支援的格式：JPG、PNG（最大 5MB）
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">電子郵件</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
