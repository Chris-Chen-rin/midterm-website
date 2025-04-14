"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

type Profile = {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)

      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching profiles:", error)
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setProfiles(data || [])
      setLoading(false)
    }

    fetchProfiles()
  }, [supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Registered Users</h1>

      {loading ? (
        <div className="text-center p-8">Loading users...</div>
      ) : profiles.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-md">No users registered yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{profile.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                    <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined: {formatDate(profile.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
