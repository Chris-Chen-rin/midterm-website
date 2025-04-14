import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { username, email, password } = await request.json()

    // 檢查用戶名是否已存在
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "此用戶名已被使用" },
        { status: 409 }
      )
    }

    // 創建新用戶
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      return NextResponse.json(
        { success: false, message: signUpError.message },
        { status: 400 }
      )
    }

    if (authData.user) {
      // 更新用戶資料
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", authData.user.id)

      if (profileError) {
        return NextResponse.json(
          { success: false, message: "創建用戶資料失敗" },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { success: true, message: "註冊成功" },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: false, message: "註冊失敗" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, message: "伺服器錯誤" },
      { status: 500 }
    )
  }
} 