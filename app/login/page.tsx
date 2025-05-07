"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LockIcon, MailIcon, UserIcon, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/"

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Passenger login state
  const [passengerEmail, setPassengerEmail] = useState("")
  const [passengerPassword, setPassengerPassword] = useState("")

  // Admin login state
  const [adminEmail, setAdminEmail] = useState("admin@abu.edu.ng")
  const [adminPassword, setAdminPassword] = useState("")

  // Driver login state
  const [driverId, setDriverId] = useState("")
  const [driverPassword, setDriverPassword] = useState("")

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (isLoggedIn) {
      const userType = localStorage.getItem("userType")
      if (userType === "admin") {
        router.push("/admin/dashboard")
      } else if (userType === "driver") {
        router.push("/driver/dashboard")
      } else {
        router.push("/")
      }
    }
  }, [router])

  const handlePassengerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { user, error } = await signIn(passengerEmail, passengerPassword)

      if (error) {
        setError(error)
        setIsLoading(false)
        return
      }

      if (!user) {
        setError("Invalid credentials")
        setIsLoading(false)
        return
      }

      if (user.role !== "passenger") {
        setError("This account is not registered as a passenger")
        setIsLoading(false)
        return
      }

      // Store user info in localStorage for demo purposes
      localStorage.setItem("userType", "passenger")
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userName", `${user.first_name} ${user.last_name}`)
      localStorage.setItem("userInitials", `${user.first_name[0]}${user.last_name[0]}`)
      localStorage.setItem("userId", user.id)
      localStorage.setItem("userEmail", user.email || "")

      router.push(redirectUrl)
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login. Please try again.")
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // For demo purposes, we'll use a hardcoded admin password
      if (adminEmail === "admin@abu.edu.ng" && adminPassword === "12345678") {
        // Store admin info in localStorage
        localStorage.setItem("userType", "admin")
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("adminAuthenticated", "true")
        localStorage.setItem("adminId", "admin-123")
        localStorage.setItem("adminName", "Admin User")
        localStorage.setItem("userName", "Admin User")
        localStorage.setItem("userInitials", "AU")

        router.push("/admin/dashboard")
      } else {
        setError("Invalid admin credentials. Use admin@abu.edu.ng and password: 12345678")
      }
    } catch (err) {
      console.error("Admin login error:", err)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Check if driver exists in the database
      let { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .or(`driver_id.eq.${driverId},email.eq.${driverId}`)
        .single()

      // If not found in drivers table, try the driver table (singular)
      if (driverError || !driver) {
        const { data: driverAlt, error: driverAltError } = await supabase
          .from("driver")
          .select("*")
          .or(`driver_id.eq.${driverId},email.eq.${driverId}`)
          .single()

        if (driverAltError || !driverAlt) {
          setError("Invalid driver ID or email")
          setIsLoading(false)
          return
        }

        driver = driverAlt
      }

      // For demo purposes, we'll use a simple password check
      if (driverPassword === "12345678") {
        // Get shuttle details for this driver
        const { data: shuttle } = await supabase
          .from("shuttles")
          .select("*")
          .eq("shuttle_id", driver.shuttle_id)
          .single()

        // Store driver info in localStorage
        localStorage.setItem("userType", "driver")
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem(
          "driverAuth",
          JSON.stringify({
            id: driver.driver_id,
            name: driver.driver_name,
            email: driver.email || "driver@abu.edu.ng",
            shuttleId: driver.shuttle_id,
            shuttleType: shuttle?.type || "Campus Bus",
            route: shuttle?.route || "Main Campus to Kongo Campus",
          }),
        )
        localStorage.setItem("userName", driver.driver_name)
        localStorage.setItem(
          "userInitials",
          driver.driver_name
            .split(" ")
            .map((n: string) => n[0])
            .join(""),
        )

        router.push("/driver/dashboard")
      } else {
        setError("Invalid password")
      }
    } catch (err) {
      console.error("Driver login error:", err)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader isLoggedIn={false} />

      <main className="container flex flex-col items-center justify-center px-4 py-12 mx-auto">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#006400]">Welcome Back</h1>
            <p className="mt-2 text-gray-600">Sign in to your ABU Tiket account</p>
          </div>

          <Card className="border-t-4 border-[#006400]">
            <CardHeader>
              <CardTitle className="text-[#006400]">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="passenger" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="passenger">Passenger</TabsTrigger>
                  <TabsTrigger value="driver">Driver</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                <TabsContent value="passenger" className="mt-4 space-y-4">
                  <form onSubmit={handlePassengerLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="passenger-email">Email</Label>
                      <div className="relative">
                        <MailIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                        <Input
                          id="passenger-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={passengerEmail}
                          onChange={(e) => setPassengerEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="passenger-password">Password</Label>
                      <div className="relative">
                        <LockIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                        <Input
                          id="passenger-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          value={passengerPassword}
                          onChange={(e) => setPassengerPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm font-normal">
                          Remember me
                        </Label>
                      </div>
                      <Link href="/forgot-password" className="text-sm text-[#006400] hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" className="w-full mt-4 bg-[#006400] hover:bg-[#005000]" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="driver" className="mt-4 space-y-4">
                  <form onSubmit={handleDriverLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="driver-id">Driver ID or Email</Label>
                      <div className="relative">
                        <UserIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                        <Input
                          id="driver-id"
                          placeholder="Enter your driver ID or email"
                          className="pl-10"
                          value={driverId}
                          onChange={(e) => setDriverId(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="driver-password">Password</Label>
                      <div className="relative">
                        <LockIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                        <Input
                          id="driver-password"
                          type="password"
                          placeholder="Enter your password (default: 12345678)"
                          className="pl-10"
                          value={driverPassword}
                          onChange={(e) => setDriverPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="driver-remember" />
                        <Label htmlFor="driver-remember" className="text-sm font-normal">
                          Remember me
                        </Label>
                      </div>
                      <Link href="/forgot-password" className="text-sm text-[#006400] hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" className="w-full mt-4 bg-[#006400] hover:bg-[#005000]" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin" className="mt-4 space-y-4">
                  <form onSubmit={handleAdminLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <div className="relative">
                        <MailIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="admin-password">Password</Label>
                      <div className="relative">
                        <LockIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Password (use: 12345678)"
                          className="pl-10"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="admin-remember" />
                        <Label htmlFor="admin-remember" className="text-sm font-normal">
                          Remember me
                        </Label>
                      </div>
                      <Link href="/forgot-password" className="text-sm text-[#006400] hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" className="w-full mt-4 bg-[#006400] hover:bg-[#005000]" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-center text-gray-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-[#006400] hover:underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="py-8 mt-12 bg-[#006400] text-white">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">ABU Tiket</h4>
              <p className="text-sm text-green-200">
                Ahmadu Bello University's official transportation booking platform.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">University</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    About ABU
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Campus Map
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Faculties
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
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
    </div>
  )
}
