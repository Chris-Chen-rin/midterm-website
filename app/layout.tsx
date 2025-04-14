import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Providers } from "./providers"
import { Suspense, ErrorBoundary } from "react"
import type { ReactNode } from "react"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap'
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

function LoadingFallback() {
  return <div className="flex items-center justify-center min-h-screen">載入中...</div>
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-red-600">發生錯誤</h2>
      <p>{error.message}</p>
    </div>
  )
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
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
        <body className={inter.className}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Providers>
              <Suspense fallback={<LoadingFallback />}>
                <Navbar user={user} avatarUrl={avatarUrl} />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
              </Suspense>
            </Providers>
          </ErrorBoundary>
        </body>
      </html>
    )
  } catch (error) {
    console.error("Root layout error:", error)
    return (
      <html lang="zh-tw">
        <body className={inter.className}>
          <ErrorFallback error={error as Error} />
        </body>
      </html>
    )
  }
}