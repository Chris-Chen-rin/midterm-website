import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

interface NavbarProps {
  user: User | null
  avatarUrl: string | null
}

export default function Navbar({ user, avatarUrl }: NavbarProps) {
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('登出失敗');
      }

      toast({
        title: "登出成功",
        description: "期待您的再次造訪！",
        variant: "default",
      });

      // 等待 toast 顯示後再重新整理頁面
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('登出錯誤:', error);
      toast({
        title: "登出錯誤",
        description: "請稍後再試",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              My Website
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
                Home
              </Link>
              <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
                About
              </Link>
              <Link href="/users" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
                View Users
              </Link>
              {user && (
                <Link
                  href="/messages"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800"
                >
                  Messages
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800"
                >
                  <span>My Account</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl || undefined} alt={user.email || "User"} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="text-white hover:bg-gray-800"
                  size="sm"
                >
                  登出
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
