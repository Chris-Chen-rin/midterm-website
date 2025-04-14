import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: "Minterm-MiniProjedt",
  description: "A website, built by v0.dev, is here with chatboard and login/register function.",
  generator: 'v0.dev',
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Minterm-MiniProjedt",
    description: "A website with chatboard and authentication features",
    type: "website"
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const cookieStore = cookies()
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    let avatarUrl = null

    if (user) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
        }

        if (data) {
          avatarUrl = data.avatar_url
        }
      } catch (error) {
        console.error("Error in profile fetch:", error)
      }
    }

    return (
      <html lang="zh-tw">
        <head>
          <link
            rel="preload"
            href={inter.style.fontFamily}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        </head>
        <body className={inter.className}>
          <Providers>
            <Navbar user={user} avatarUrl={avatarUrl} />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </Providers>
          <Toaster />
        </body>
      </html>
    )
  } catch (error) {
    console.error("Root layout error:", error)
    return (
      <html lang="zh-tw">
        <body className={inter.className}>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-red-600">系統錯誤</h2>
            <p>請稍後再試</p>
          </div>
        </body>
      </html>
    )
  }
}