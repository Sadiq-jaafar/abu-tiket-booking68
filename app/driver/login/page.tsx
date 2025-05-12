"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { SiteFooter } from "@/components/site-footer"

export default function DriverLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

   const handleDriverLogin = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setError("")
  
      try {
        // Check if driver exists in the database
        let { data: driver, error: driverError } = await supabase
          .from("drivers")
          .select("*")
          .eq('email', email)
          .single()
  
        // If not found in drivers table, try the driver table (singular)
        if (driverError || !driver) {
          const { data: driverAlt, error: driverAltError } = await supabase
            .from("driver")
            .select("*")
            .eq('email', email)
            .single()
  
          if (driverAltError || !driverAlt) {
            setError("Invalid driver ID or email")
            setIsLoading(false)
            return
          }
  
          driver = driverAlt
        }
  
        // For demo purposes, we'll use a simple password check
        if (password === "12345678") {
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
    <div className=" flex flex-col min-h-screen">
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Driver Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your shuttle dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleDriverLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="driver@abu.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/driver/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">Contact admin for account issues</p>
        </CardFooter>
      </Card>
      
    </div>
    <SiteFooter />
    </div>
  )
}
