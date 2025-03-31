import Image from "next/image"

export default function About() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* About Us section with image */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-6">About Us</h1>
          <div className="prose max-w-none">
            <p className="mb-4">
              Welcome to our about page. This is where you can learn more about our company, mission, and values.
            </p>
            <p className="mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt,
              nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt,
              nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
            </p>
            <p className="mb-4">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
              rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
              explicabo.
            </p>
          </div>
        </div>
        <div className="md:w-1/3 flex justify-end">
          <div className="relative w-full h-64 md:h-80">
            <Image
              src="/placeholder.svg?height=400&width=300"
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
              Our mission is to provide the best service to our customers. We strive to be the best in our industry and
              to provide the best experience for our users.
            </p>
            <p className="mb-4">
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
              dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
              sit amet, consectetur, adipisci velit.
            </p>
            <p className="mb-4">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti
              atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
            </p>
          </div>
        </div>
        <div className="md:w-1/3 flex justify-end">
          <div className="relative w-full h-64 md:h-80">
            <Image
              src="/placeholder.svg?height=400&width=300"
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
            Our team consists of experienced professionals who are dedicated to providing the best service to our
            customers. We have a diverse team with various backgrounds and expertise, allowing us to approach problems
            from different angles.
          </p>
          <p className="mb-4">
            Each member of our team brings unique skills and perspectives, contributing to our collective success. We
            believe in collaboration, innovation, and continuous improvement.
          </p>
        </div>
      </div>
    </div>
  )
}

