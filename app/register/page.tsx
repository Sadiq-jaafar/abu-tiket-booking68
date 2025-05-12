"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LockIcon, MailIcon, UserIcon, PhoneIcon, AlertCircle, CheckCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signUp } from "@/lib/auth"
import { SiteFooter } from "@/components/site-footer"
import {User} from "@/lib/definitions"

type RegistrationError = {
  message: string;
  code?: string;
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",           // Changed from firstName
    last_name: "",           // Changed from lastName
    phone_number: "",        // Changed from phoneNumber
    id_type: "student_id",
    id_number: "",
    user_type: "student",
    role: "passenger" as "passenger" | "admin" | "driver", // Default role
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate required fields
      if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        setError("Please fill in all required fields")
        return
      }

      // Create user data object that matches User interface
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        id_type: formData.id_type,
        id_number: formData.id_number,
        user_type: formData.user_type,
        role: formData.role as "passenger" | "admin" | "driver",
        email: formData.email
      }

      const result = await signUp(formData.email, formData.password, userData)

      if (result.error) {
        setError(result.error)
        return
      }

      // Successfully created user
      setSuccess("Registration successful! Please check your email to confirm your account.")
      
      // Clear form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        id_type: "student_id",
        id_number: "",
        user_type: "student",
        role: "passenger",
      })

      // Redirect to login page after delay
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 3000)

    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const isPasswordValid = (password: string) => {
    return password.length >= 8
  }

  const doPasswordsMatch = (password: string, confirmPassword: string) => {
    return password === confirmPassword
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader isLoggedIn={false} />

      <main className="container flex flex-col items-center justify-center px-4 py-12 mx-auto">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#006400]">Create an Account</h1>
            <p className="mt-2 text-gray-600">Join ABU Tiket for easy campus transportation</p>
          </div>

          <Card className="border-t-4 border-[#006400]">
            <CardHeader>
              <CardTitle className="text-[#006400]">Register</CardTitle>
              <CardDescription>Enter your details to create an account</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                      <Input
                        id="first_name"
                        name="first_name"
                        placeholder="First name"
                        className="pl-10"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                      <Input
                        id="last_name"
                        name="last_name"
                        placeholder="Last name"
                        className="pl-10"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <MailIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email address"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <PhoneIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                    <Input
                      id="phone_number"
                      name="phone_number"
                      placeholder="Your phone number"
                      className="pl-10"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Type</Label>
                    <Select 
                      value={formData.id_type} 
                      onValueChange={(value) => handleSelectChange("id_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student_id">Student ID</SelectItem>
                        <SelectItem value="staff_id">Staff ID</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      name="id_number" // Changed to match formData
                      placeholder="Your ID number"
                      value={formData.id_number} // Changed to match formData
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userType">User Type</Label>
                    <Select 
                      value={formData.user_type} 
                      onValueChange={(value) => handleSelectChange("user_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passenger">Passenger</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className={`pl-10 ${!isPasswordValid(formData.password) && formData.password 
                        ? 'border-red-500 focus-visible:ring-red-500' 
                        : ''}`}

                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {formData.password && !isPasswordValid(formData.password) && (
                    <p className="text-xs text-red-500">Password must be at least 8 characters long</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className={`pl-10 ${!doPasswordsMatch(formData.password, formData.confirmPassword) 
                        && formData.confirmPassword 
                        ? 'border-red-500 focus-visible:ring-red-500' 
                        : ''}`}

                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {formData.confirmPassword && !doPasswordsMatch(formData.password, formData.confirmPassword) && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#006400] hover:bg-[#005000]" 
                  disabled={isLoading || 
                    !isPasswordValid(formData.password) || 
                    !doPasswordsMatch(formData.password, formData.confirmPassword)}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-[#006400] hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <SiteFooter/>
{/* 
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
      </footer> */}
    </div>
  )
}
