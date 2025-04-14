import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ToastProvider } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Minterm-MiniProjedt",
  description: "A website, built by v0.dev, is here with chatboard and login/register function.",
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
    <html lang="zh-tw">
      <body className={inter.className}>
        <ToastProvider>
          <Navbar user={user} avatarUrl={avatarUrl} />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </ToastProvider>
      </body>
    </html>
  )
}


import './globals.css'