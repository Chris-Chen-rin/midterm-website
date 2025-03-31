import Image from "next/image"

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* About Us section with image */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-6">About Us</h1>
            <div className="prose max-w-none">
              <p className="mb-4">
                歡迎來到我的關於頁面，在這裡可以了解更多有關我的資訊。
              </p>
              <p className="mb-4">
                我的學號是B11901083。
              </p>
              <p className="mb-4">

              </p>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-end">
            <div className="relative w-full h-64 md:h-80">
              <Image
                src="/selfie.svg?height=280&width=210"
                alt="About Us"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Our Mission section with image */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <div className="prose max-w-none">
            <p className="mb-4">
              我的目標是在有限的時間內創造出最優良的成果，以在LAB中獲得較高的評分。
            </p>
            <p className="mb-4">
              
            </p>
            <p className="mb-4">
              
            </p>
          </div>
          </div>
          <div className="md:w-1/3 flex justify-end">
            <div className="relative w-full h-64 md:h-80">
              <Image
                src="/complain.svg?height=240&width=240"
                alt="Our Mission"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Our Team section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Team</h2>
          <div className="prose max-w-none">
            <p className="mb-4">
            我的專案是由許多富有創造力的成員一起協作而成，包含ChatGPT、plexity、v0.dev等。
            </p>
            <p className="mb-4">
            如此頁面，就是由v0.dev產出大綱，再由我進行個人化的修改。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

