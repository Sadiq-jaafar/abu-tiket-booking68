"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Phone, UserIcon, Loader2, Edit } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserProfile, updateUserProfile } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import type { User } from "@/lib/definitions"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    id_type: "",
    id_number: "",
    user_type: "",
    role: "passenger" as "passenger" | "admin" | "driver",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        // Check if user is logged in
        const userId = localStorage.getItem("userId")
        if (!userId) {
          router.push("/login")
          return
        }

        // Fetch user profile
        const userProfile = await getUserProfile(userId)
        if (userProfile) {
          setUser(userProfile)
          setFormData({
            first_name: userProfile.first_name || "",
            last_name: userProfile.last_name || "",
            email: userProfile.email || "",
            phone_number: userProfile.phone_number || "",
            id_type: userProfile.id_type || "",
            id_number: userProfile.id_number || "",
            user_type: userProfile.user_type || "",
            role: userProfile.role || "",
          })
        } else {
          // If no profile found, redirect to login
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("User ID not found")
      }

      const result = await updateUserProfile(userId, formData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        // Update the user state with new data
        setUser({ ...user, ...formData } as User)
        setIsEditing(false)
      } else {
        throw new Error(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U"
  }

  // Get full name
  const getFullName = () => {
    if (!user) return "User"
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"
  }

  // Get badge color based on user type
  const getUserTypeBadgeColor = (userType: string) => {
    switch (userType?.toLowerCase()) {
      case "student":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "staff":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "guest":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "driver":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "passenger":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <SiteHeader />
        <div className="container flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#006400] animate-spin" />
            <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader
        isLoggedIn={true}
        userType={(user?.user_type === "student" || user?.user_type === "staff" || user?.user_type === "admin" || user?.user_type === "driver" 
          ? user.user_type 
          : "student")}
        userName={getFullName()}
        userInitials={getUserInitials()}
      />

      <main className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-3xl font-bold text-[#006400]">My Profile</h1>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-24 h-24 border-4 border-[#006400]">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" />
                      <AvatarFallback className="text-2xl bg-[#006400] text-white">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold">{getFullName()}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className={getUserTypeBadgeColor(user?.user_type || "")}>
                        {user?.user_type || "Unknown Type"}
                      </Badge>
                      <Badge variant="outline" className={getRoleBadgeColor(user?.role || "")}>
                        {user?.role || "Unknown Role"}
                      </Badge>
                    </div>
                    <div className="w-full mt-6 space-y-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{user?.email}</span>
                      </div>
                      {user?.phone_number && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">{user?.phone_number}</span>
                        </div>
                      )}
                      {user?.id_type && user?.id_number && (
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm">
                            {user.id_type}: {user.id_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile content */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-[#006400] text-[#006400]"
                    >
                      {isEditing ? (
                        <>Cancel</>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    {isEditing ? "Update your profile information below" : "View and manage your personal information"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 mb-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                              id="first_name"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                              id="last_name"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                              id="phone_number"
                              name="phone_number"
                              value={formData.phone_number}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="id_type">ID Type</Label>
                            <Select
                              name="id_type"
                              value={formData.id_type}
                              onValueChange={(value) => handleSelectChange("id_type", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select ID type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Student ID">Student ID</SelectItem>
                                <SelectItem value="Staff ID">Staff ID</SelectItem>
                                <SelectItem value="National ID">National ID</SelectItem>
                                <SelectItem value="Passport">Passport</SelectItem>
                                <SelectItem value="Driver's License">Driver's License</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="id_number">ID Number</Label>
                            <Input
                              id="id_number"
                              name="id_number"
                              value={formData.id_number}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="user_type">User Type</Label>
                            <Select
                              name="user_type"
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
                          <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                              name="role"
                              value={formData.role}
                              onValueChange={(value) => handleSelectChange("role", value)}
                              disabled={true} // Role should not be editable by the user
                            >
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
                      </div>

                      <Button type="submit" className="w-full bg-[#006400] hover:bg-[#005000]" disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-500">Personal Information</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">First Name</p>
                            <p>{user?.first_name || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Last Name</p>
                            <p>{user?.last_name || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p>{user?.email || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone</p>
                            <p>{user?.phone_number || "Not provided"}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 text-sm font-medium text-gray-500">Identification</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">ID Type</p>
                            <p>{user?.id_type || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">ID Number</p>
                            <p>{user?.id_number || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">User Type</p>
                            <p>{user?.user_type || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Role</p>
                            <p>{user?.role || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="security">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                      </TabsList>
                      <TabsContent value="security" className="mt-4">
                        <div className="space-y-4">
                          <div>
                            <Button variant="outline" className="w-full">
                              Change Password
                            </Button>
                          </div>
                          <div>
                            <Button variant="outline" className="w-full">
                              Two-Factor Authentication
                            </Button>
                          </div>
                          <div>
                            <Button variant="outline" className="w-full text-red-500 hover:text-red-600">
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="notifications" className="mt-4">
                        <p className="text-sm text-gray-500">Notification settings will be available soon.</p>
                      </TabsContent>
                      <TabsContent value="preferences" className="mt-4">
                        <p className="text-sm text-gray-500">Preference settings will be available soon.</p>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
