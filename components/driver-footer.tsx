import Link from "next/link"

export function DriverFooter() {
  return (
    <footer className="bg-gray-100 border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} ABU Tiket. All rights reserved.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <Link href="/driver/help" className="text-sm text-gray-600 hover:text-gray-900">
              Help & Support
            </Link>
            <Link href="/driver/terms" className="text-sm text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="/driver/privacy" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Ahmadu Bello University, Zaria</p>
          <p className="mt-1">Driver Portal v1.0</p>
        </div>
      </div>
    </footer>
  )
}
