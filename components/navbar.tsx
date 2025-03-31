import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-black text-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white">
              My Website
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
              Home
            </Link>
            <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
              About
            </Link>
            <Link href="/users" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-gray-800">
              Users
            </Link>
            <Link
              href="/users/create"
              className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create User
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

