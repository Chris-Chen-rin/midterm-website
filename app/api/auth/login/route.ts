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
    if (username === MOCK_USER.username) {
      if (password === MOCK_USER.password) {
        return NextResponse.json(
          { success: true, message: '登入成功' },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: '密碼錯誤' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: '用戶不存在' },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 