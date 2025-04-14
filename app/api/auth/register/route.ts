import { NextResponse } from 'next/server';

// 模擬資料庫中的用戶
const MOCK_USERS = [
  {
    username: 'admin',
    password: 'password123',
    email: 'admin@example.com'
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, email } = body;

    // 檢查用戶名是否已存在
    if (MOCK_USERS.some(user => user.username === username)) {
      return NextResponse.json(
        { success: false, message: '此用戶名已被使用' },
        { status: 409 }
      );
    }

    // 在實際應用中，這裡應該將用戶資料存入資料庫
    MOCK_USERS.push({
      username,
      password,
      email
    });

    return NextResponse.json(
      { success: true, message: '註冊成功' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    );
  }
} 