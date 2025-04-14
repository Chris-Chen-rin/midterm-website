import { NextResponse } from 'next/server';

// 這裡應該替換成真實的用戶驗證邏輯
const MOCK_USER = {
  username: 'admin',
  password: 'password123'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 在實際應用中，這裡應該要連接資料庫進行驗證
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      // 在實際應用中，這裡應該生成 JWT 或其他身份驗證令牌
      return NextResponse.json(
        { success: true, message: '登入成功' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: '用戶名或密碼錯誤' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 