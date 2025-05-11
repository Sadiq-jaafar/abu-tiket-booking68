"use client"

// import { signOut } from "next-auth/react"
import { Checkbox } from "@/components/ui/checkbox"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Bell, Globe, LogOut, Lock, Moon, Shield, Smartphone, Sun, User, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()

  // Add state for header props
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"student" | "staff" | "admin" | "driver">("student")
  const [userName, setUserName] = useState("")
  const [userInitials, setUserInitials] = useState("")

  // Add auth check effect
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUserType = localStorage.getItem("userType") as "student" | "staff" | "admin" | "driver"
    const storedUserName = localStorage.getItem("userName")
    const storedUserInitials = localStorage.getItem("userInitials")

    if (!storedIsLoggedIn) {
      router.push("/login?redirect=/settings")
      return
    }

    setIsLoggedIn(storedIsLoggedIn)
    setUserType(storedUserType || "student")
    setUserName(storedUserName || "")
    setUserInitials(storedUserInitials || "")
  }, [router])

  const [isLoading, setIsLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  })
  const [language, setLanguage] = useState("en")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // In a real app, fetch user settings from the backend
    setIsLoading(false)
  }, [user, authLoading, router])

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    // In a real app, save this preference to the user's profile
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    // In a real app, save this preference to the user's profile
  }

  // const handleDeleteAccount = () => {
  //   // In a real app, this would call an API to delete the user's account
  //   alert("Account deletion would be processed here")
  //   setShowDeleteDialog(false)
  //   // signOut()
  // }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <SiteHeader
          isLoggedIn={isLoggedIn}
          userType={userType}
          userName={userName}
          userInitials={userInitials}
        />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading settings...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <SiteHeader
        isLoggedIn={isLoggedIn}
        userType={userType}
        userName={userName}
        userInitials={userInitials}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to profile link */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#006400]">Settings</h1>
            <Button
              variant="outline"
              className="text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
              asChild
            >
              <Link href="/profile">Back to Profile</Link>
            </Button>
          </div>

          <Tabs defaultValue="general">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-64">
                <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                  <TabsTrigger
                    value="general"
                    className="justify-start px-4 py-2 data-[state=active]:bg-[#006400] data-[state=active]:text-white"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger
                    value="notifications"
                    className="justify-start px-4 py-2 data-[state=active]:bg-[#006400] data-[state=active]:text-white"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="appearance"
                    className="justify-start px-4 py-2 data-[state=active]:bg-[#006400] data-[state=active]:text-white"
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="justify-start px-4 py-2 data-[state=active]:bg-[#006400] data-[state=active]:text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Security & Privacy
                  </TabsTrigger>
                  <TabsTrigger
                    value="account"
                    className="justify-start px-4 py-2 data-[state=active]:bg-[#006400] data-[state=active]:text-white"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <TabsContent value="general" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>Manage your general account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Language</h3>
                        <Select value={language} onValueChange={handleLanguageChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ha">Hausa</SelectItem>
                            <SelectItem value="yo">Yoruba</SelectItem>
                            <SelectItem value="ig">Igbo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Time & Date</h3>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select defaultValue="WAT">
                            <SelectTrigger id="timezone">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WAT">West Africa Time (WAT)</SelectItem>
                              <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                              <SelectItem value="UTC+1">UTC+1</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-format">Date Format</Label>
                          <Select defaultValue="DD/MM/YYYY">
                            <SelectTrigger id="date-format">
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Accessibility</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="screen-reader" className="text-base">
                              Screen Reader Support
                            </Label>
                            <p className="text-sm text-gray-500">Optimize for screen readers</p>
                          </div>
                          <Switch id="screen-reader" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="reduced-motion" className="text-base">
                              Reduced Motion
                            </Label>
                            <p className="text-sm text-gray-500">Minimize animations</p>
                          </div>
                          <Switch id="reduced-motion" />
                        </div>
                      </div>

                      <Button className="bg-[#006400] hover:bg-[#005000]">Save Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications" className="text-base">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-gray-500">Receive booking updates via email</p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={notifications.email}
                            onCheckedChange={() => handleNotificationChange("email")}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="push-notifications" className="text-base">
                              Push Notifications
                            </Label>
                            <p className="text-sm text-gray-500">Receive notifications on your device</p>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={notifications.push}
                            onCheckedChange={() => handleNotificationChange("push")}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="sms-notifications" className="text-base">
                              SMS Notifications
                            </Label>
                            <p className="text-sm text-gray-500">Receive booking updates via SMS</p>
                          </div>
                          <Switch
                            id="sms-notifications"
                            checked={notifications.sms}
                            onCheckedChange={() => handleNotificationChange("sms")}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notification Types</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="booking-confirmations" defaultChecked />
                            <Label htmlFor="booking-confirmations">Booking confirmations</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="booking-reminders" defaultChecked />
                            <Label htmlFor="booking-reminders">Booking reminders</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="booking-changes" defaultChecked />
                            <Label htmlFor="booking-changes">Booking changes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="promotions" />
                            <Label htmlFor="promotions">Promotions and offers</Label>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="marketing-emails" className="text-base">
                              Marketing Emails
                            </Label>
                            <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
                          </div>
                          <Switch
                            id="marketing-emails"
                            checked={notifications.marketing}
                            onCheckedChange={() => handleNotificationChange("marketing")}
                          />
                        </div>
                      </div>

                      <Button className="bg-[#006400] hover:bg-[#005000]">Save Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance Settings</CardTitle>
                      <CardDescription>Customize how the app looks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Theme</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div
                            className={`border rounded-lg p-4 cursor-pointer ${
                              theme === "light" ? "border-[#006400] bg-[#f0f7f0]" : ""
                            }`}
                            onClick={() => handleThemeChange("light")}
                          >
                            <div className="flex justify-center mb-2">
                              <Sun className="h-6 w-6" />
                            </div>
                            <p className="text-center text-sm font-medium">Light</p>
                          </div>
                          <div
                            className={`border rounded-lg p-4 cursor-pointer ${
                              theme === "dark" ? "border-[#006400] bg-[#f0f7f0]" : ""
                            }`}
                            onClick={() => handleThemeChange("dark")}
                          >
                            <div className="flex justify-center mb-2">
                              <Moon className="h-6 w-6" />
                            </div>
                            <p className="text-center text-sm font-medium">Dark</p>
                          </div>
                          <div
                            className={`border rounded-lg p-4 cursor-pointer ${
                              theme === "system" ? "border-[#006400] bg-[#f0f7f0]" : ""
                            }`}
                            onClick={() => handleThemeChange("system")}
                          >
                            <div className="flex justify-center mb-2">
                              <Smartphone className="h-6 w-6" />
                            </div>
                            <p className="text-center text-sm font-medium">System</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Font Size</h3>
                        <div className="space-y-2">
                          <Label htmlFor="font-size">Adjust font size</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger id="font-size">
                              <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="x-large">Extra Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button className="bg-[#006400] hover:bg-[#005000]">Save Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security & Privacy</CardTitle>
                      <CardDescription>Manage your security and privacy settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Password</h3>
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <Button className="bg-[#006400] hover:bg-[#005000]">Change Password</Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account by enabling two-factor authentication.
                        </p>
                        <Button variant="outline" className="text-[#006400] border-[#006400] hover:bg-[#e6f2e6]">
                          <Lock className="w-4 h-4 mr-2" />
                          Enable Two-Factor Authentication
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Privacy</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="data-collection" className="text-base">
                              Data Collection
                            </Label>
                            <p className="text-sm text-gray-500">
                              Allow us to collect usage data to improve our service
                            </p>
                          </div>
                          <Switch id="data-collection" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="location-tracking" className="text-base">
                              Location Tracking
                            </Label>
                            <p className="text-sm text-gray-500">Allow us to track your location for better service</p>
                          </div>
                          <Switch id="location-tracking" defaultChecked />
                        </div>
                      </div>

                      <Button className="bg-[#006400] hover:bg-[#005000]">Save Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Account Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="account-email">Email</Label>
                            <Input id="account-email" value={user?.email || ""} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="account-id">Account ID</Label>
                            <Input id="account-id" value={user?.id.substring(0, 8) + "..."} disabled />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-type">Account Type</Label>
                          <Input
                            id="account-type"
                            value={
                              profile?.user_type.charAt(0).toUpperCase() + profile?.user_type.slice(1) || "Student"
                            }
                            disabled
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Export Data</h3>
                        <p className="text-sm text-gray-500">
                          Download a copy of your personal data, including your profile information and booking history.
                        </p>
                        <Button variant="outline" className="text-[#006400] border-[#006400] hover:bg-[#e6f2e6]">
                          Export Personal Data
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Deleting your account will permanently remove all your data. This action cannot be undone.
                          </AlertDescription>
                        </Alert>
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All your bookings, payment methods, and personal information will be permanently deleted.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-semibold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm-delete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive"  disabled={deleteConfirmation !== "DELETE"}>
              Delete Account
              {/* onClick={handleDeleteAccount} */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  )
}
