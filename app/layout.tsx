import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { createServerSupabaseClient } from "@/lib/supabase"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { cookies, headers } from "next/headers" // ✅ 修正
import { User } from "@supabase/supabase-js"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "My Website",
  description: "A website built with Next.js and Supabase",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient({ // ✅ 正確建立 server client
    cookies,
    headers,
  })

  let user: User | null = null
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    user = session?.user || null
  } catch (error) {
    console.error("Error getting session in layout:", error)
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={user} />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
