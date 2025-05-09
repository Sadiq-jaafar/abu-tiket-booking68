import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="py-8 mt-12 bg-[#006400] text-white">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase">ABU Tiket</h4>
            <p className="text-sm text-green-200">
              Ahmadu Bello University's official transportation booking platform.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/serch-results" className="text-sm text-gray-300 hover:text-white">
                  Shuttles
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="text-sm text-gray-300 hover:text-white">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-gray-300 hover:text-white">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-gray-300 hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-300 hover:text-white">
                  Register
                </Link>
              </li>
              
              <li>
                <Link href="/settings" className="text-sm text-gray-300 hover:text-white">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase">University</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-green-200 hover:text-white">
                  About ABU
                </Link>
              </li>
              <li>
                <Link href="/campus-map" className="text-green-200 hover:text-white">
                  Campus Map
                </Link>
              </li>
              <li>
                <Link href="/faculties" className="text-green-200 hover:text-white">
                  Faculties
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-green-200 hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-green-200 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-green-200 hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-green-200 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-green-200 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-green-200 hover:text-white">
                  Student Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 text-sm text-center text-green-200 border-t border-green-700">
          © {new Date().getFullYear()} Ahmadu Bello University, Zaria. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
