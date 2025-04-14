import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar({ user, avatarUrl }: { user: any; avatarUrl: string | null }) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          首頁
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/messages"
                className="text-sm hover:text-primary transition-colors"
              >
                訊息
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={avatarUrl || ""} />
                    <AvatarFallback>
                      {user.email ? user.email[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">個人資料</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    登出
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm hover:text-primary transition-colors"
            >
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
