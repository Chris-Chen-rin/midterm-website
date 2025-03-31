import Link from "next/link"

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/image/background.jpg?height=1080&width=1920')",
          // Replace the above with your actual image path when available
        }}
      >
        {/* Overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 text-white">
        <h1 className="text-4xl font-bold mb-6">Welcome to My Website</h1>
        <p className="text-xl text-center max-w-2xl mb-8">
          This is the main page of our multi-page website. Use the navigation at the top to explore other pages.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/about"
            className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-center hover:bg-white/30 transition-colors"
          >
            Learn About Us
          </Link>
          <Link
            href="/users"
            className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-center hover:bg-white/30 transition-colors"
          >
            View Users
          </Link>
          <Link
            href="/users/create"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            Create a User
          </Link>
        </div>
      </div>
    </div>
  )
}

