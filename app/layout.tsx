import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Multi-page Website",
  description: "A website with multiple pages and navigation",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let avatarUrl = null

  if (user) {
    const { data } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

    if (data) {
      avatarUrl = data.avatar_url
    }
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={user} avatarUrl={avatarUrl} />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}


import './globals.css'