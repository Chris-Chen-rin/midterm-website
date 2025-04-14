import { createServerSupabaseClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { email, password } = await request.json()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.message === "Invalid login credentials" 
            ? "電子郵件或密碼錯誤" 
            : error.message 
        },
        { status: 401 }
      )
    }

    const cookieStore = cookies()
    const session = data.session
    if (session) {
      cookieStore.set('sb-access-token', session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      cookieStore.set('sb-refresh-token', session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "登入成功",
        user: data.user 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "伺服器錯誤" },
      { status: 500 }
    )
  }
} 