import { PageLayout } from "@/components/page-layout"
import Link from "next/link"
import { HelpCircle, Book, Phone, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function HelpCenterPage() {
  return (
    <PageLayout title="Help Center" description="Find answers to your questions and get support for ABU Tiket services">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-4 flex items-center">
            <HelpCircle className="mr-2 h-5 w-5" />
            How Can We Help You?
          </h2>
          <p className="text-gray-700 mb-6">
            Welcome to the ABU Tiket Help Center. Here you can find answers to frequently asked questions, learn how to
            use our services, and get in touch with our support team if you need further assistance.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#006400]">Quick Guides</CardTitle>
                <CardDescription>Step-by-step instructions for common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Book className="h-4 w-4 mr-2 text-[#006400]" />
                    <Link href="/new-booking" className="text-[#006400] hover:underline">
                      How to book a shuttle
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <Book className="h-4 w-4 mr-2 text-[#006400]" />
                    <Link href="/my-bookings" className="text-[#006400] hover:underline">
                      Managing your bookings
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <Book className="h-4 w-4 mr-2 text-[#006400]" />
                    <Link href="/payment-methods" className="text-[#006400] hover:underline">
                      Payment methods
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <Book className="h-4 w-4 mr-2 text-[#006400]" />
                    <Link href="/settings" className="text-[#006400] hover:underline">
                      Account settings
                    </Link>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-[#006400] text-[#006400] hover:bg-[#e6f2e6]">
                  View All Guides
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#006400]">FAQs</CardTitle>
                <CardDescription>Answers to commonly asked questions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-[#006400]" />
                    <Link href="/faqs" className="text-[#006400] hover:underline">
                      Booking and cancellation
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-[#006400]" />
                    <Link href="/faqs" className="text-[#006400] hover:underline">
                      Account management
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-[#006400]" />
                    <Link href="/faqs" className="text-[#006400] hover:underline">
                      Shuttle services
                    </Link>
                  </li>
                  <li className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-[#006400]" />
                    <Link href="/faqs" className="text-[#006400] hover:underline">
                      Technical issues
                    </Link>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full border-[#006400] text-[#006400] hover:bg-[#e6f2e6]">
                  <Link href="/faqs">View All FAQs</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#006400]">Contact Support</CardTitle>
                <CardDescription>Get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-[#006400]" />
                    <span>+234 8012 345 678</span>
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-[#006400]" />
                    <span>support@abutiket.edu.ng</span>
                  </li>
                  <li className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-[#006400]" />
                    <span>Live chat (8am - 8pm)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-[#006400] hover:bg-[#005000]">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-4">Popular Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {popularTopics.map((topic, index) => (
              <div key={index} className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">{topic.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                <Link href={topic.link} className="text-sm text-[#006400] hover:underline">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

const popularTopics = [
  {
    title: "Booking a Shuttle",
    description: "Learn how to search for and book a shuttle for your campus transportation needs.",
    link: "/search-results",
  },
  {
    title: "Premium Service",
    description: "Discover the benefits of our premium door-to-door service and how to upgrade.",
    link: "/new-booking",
  },
  {
    title: "Cancellation Policy",
    description: "Understand our cancellation policy and how to cancel or modify a booking.",
    link: "/my-bookings",
  },
  {
    title: "QR Code Tickets",
    description: "Learn how to use your QR code ticket for boarding and verification.",
    link: "/my-bookings",
  },
]
