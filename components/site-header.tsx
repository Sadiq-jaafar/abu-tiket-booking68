"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BellIcon,
  BookIcon,
  CreditCardIcon,
  HistoryIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface SiteHeaderProps {
  isLoggedIn?: boolean
  userType?: "student" | "staff" | "admin" | "driver"
  userName?: string
  userInitials?: string
}

export function SiteHeader({
  isLoggedIn = false,
  userType = "student",
  userName = "Guest User",
  userInitials = "GU",
}: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Check if user is logged in from localStorage on client side
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUserType = localStorage.getItem("userType")
    const storedUserName = localStorage.getItem("userName")
    const storedUserInitials = localStorage.getItem("userInitials")

    if (storedIsLoggedIn && !isLoggedIn) {
      // Update props with localStorage values if they exist
      isLoggedIn = storedIsLoggedIn
      userType = (storedUserType as any) || userType
      userName = storedUserName || userName
      userInitials = storedUserInitials || userInitials
    }
  }, [])

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userType")
    localStorage.removeItem("userName")
    localStorage.removeItem("userInitials")
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("driverAuth")

    // Redirect to login page
    router.push("/login")
  }

  return (
    <header className="bg-[#006400] text-white shadow-md">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            ABU Tiket
          </Link>
          <nav className="hidden md:flex md:space-x-4">
            <Link href="/" className="text-sm font-medium text-white hover:text-green-200">
              Home
            </Link>
            <Link href="/search-results" className="text-sm font-medium text-white hover:text-green-200">
              Shuttles
            </Link>
            {isLoggedIn && (
              <Link href="/my-bookings" className="text-sm font-medium text-white hover:text-green-200">
                My Bookings
              </Link>
            )}
            <Link href="/help" className="text-sm font-medium text-white hover:text-green-200">
              Help
            </Link>
          </nav>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
                <MenuIcon className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#006400] text-white border-none">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xl font-bold">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {isLoggedIn && (
                  <div className="flex items-center mb-6 space-x-3 p-3 bg-green-700 rounded-md">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback className="bg-green-800">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{userName}</p>
                      <Badge variant="outline" className="mt-1 text-xs border-green-200 text-green-200">
                        {userType.charAt(0).toUpperCase() + userType.slice(1)}
                      </Badge>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col space-y-4">
                  <Link
                    href="/"
                    className="flex items-center px-2 py-2 text-white hover:bg-green-700 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/search-results"
                    className="flex items-center px-2 py-2 text-white hover:bg-green-700 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shuttles
                  </Link>
                  {isLoggedIn && (
                    <>
                      <Link
                        href="/my-bookings"
                        className="flex items-center px-2 py-2 text-white hover:bg-green-700 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center px-2 py-2 text-white hover:bg-green-700 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-2 py-2 text-white hover:bg-green-700 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                    </>
                  )}
                  <Link
                    href="/help"
                    className="flex items-center px-2 py-2 text-white hover:bg-green-700 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Help
                  </Link>
                </nav>

                <div className="mt-auto">
                  {isLoggedIn ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-white border-white hover:bg-green-700"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                    >
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-center text-white border-white hover:bg-green-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full justify-center bg-white text-[#006400] hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/register">Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop auth buttons or profile */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-green-700">
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 rounded-full" size="icon">
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="bg-green-700">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {userType.charAt(0).toUpperCase() + userType.slice(1)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserIcon className="w-4 h-4 mr-2" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-bookings" className="cursor-pointer">
                        <HistoryIcon className="w-4 h-4 mr-2" />
                        <span>Booking History</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/search-results" className="cursor-pointer">
                        <BookIcon className="w-4 h-4 mr-2" />
                        <span>New Booking</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="#" className="cursor-pointer">
                        <CreditCardIcon className="w-4 h-4 mr-2" />
                        <span>Payment Methods</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="#" className="cursor-pointer">
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-green-700">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="bg-white text-[#006400] hover:bg-gray-100">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
