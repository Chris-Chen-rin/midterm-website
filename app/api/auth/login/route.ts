import { createServerSupabaseClient } from "@/lib/supabase"
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
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { success: false, message: "電子郵件或密碼錯誤" },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    if (data?.user) {
      return NextResponse.json(
        { 
          success: true, 
          message: "登入成功",
          user: {
            id: data.user.id,
            email: data.user.email,
          }
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: false, message: "登入失敗" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "伺服器錯誤" },
      { status: 500 }
    )
  }
} 