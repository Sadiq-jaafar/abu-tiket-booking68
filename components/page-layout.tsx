"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function PageLayout({ children, title, description }: PageLayoutProps) {
  // Add authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"student" | "staff" | "admin" | "driver" | undefined>("student")
  const [userName, setUserName] = useState("")
  const [userInitials, setUserInitials] = useState("")

  // Check authentication status on mount
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUserType = localStorage.getItem("userType") as "student" | "staff" | "admin" | "driver" | undefined
    const storedUserName = localStorage.getItem("userName") || ""
    const storedUserInitials = localStorage.getItem("userInitials") || ""

    setIsLoggedIn(storedIsLoggedIn)
    if (storedUserType) setUserType(storedUserType)
    setUserName(storedUserName)
    setUserInitials(storedUserInitials)
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader 
        isLoggedIn={isLoggedIn}
        userType={userType}
        userName={userName}
        userInitials={userInitials}
      />

      <main className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#006400]">{title}</h1>
            {description && <p className="mt-2 text-gray-600">{description}</p>}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">{children}</div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
