"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Save, AlertCircle, User, Bell, Shield } from "lucide-react"
import { DriverHeader } from "@/components/driver-header"
import { DriverFooter } from "@/components/driver-footer"

interface DriverInfo {
  id: string
  name: string
  email: string
  shuttleId: string
  shuttleType: string
  route: string
  phone?: string
}

export default function DriverSettingsPage() {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const router = useRouter()

  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
    bio: "",
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    newPassengerAlerts: true,
    tripReminders: true,
    scheduleChanges: true,
    systemUpdates: false,
  })

  // App settings
  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    autoCheckIn: false,
    offlineMode: true,
    language: "english",
    showPassengerContacts: true,
  })

  useEffect(() => {
    // Check if driver is logged in
    const authData = localStorage.getItem("driverAuth")
    if (!authData) {
      router.push("/driver/login")
      return
    }

    const driver = JSON.parse(authData) as DriverInfo
    setDriverInfo(driver)

    // Initialize profile settings with driver info
    setProfileSettings({
      name: driver.name,
      email: driver.email,
      phone: driver.phone || "",
      emergencyContact: "",
      bio: "",
    })

    // Simulate API call to fetch settings
    const fetchSettings = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
        // Settings would be fetched from the server
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [router])

  const handleProfileSettingsChange = (field: string, value: string) => {
    setProfileSettings({
      ...profileSettings,
      [field]: value,
    })
  }

  const handleNotificationSettingsChange = (field: string, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [field]: value,
    })
  }

  const handleAppSettingsChange = (field: string, value: any) => {
    setAppSettings({
      ...appSettings,
      [field]: value,
    })
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      // In a real app, this would make an API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
      setSaveSuccess(true)

      // Update driver info in localStorage
      if (driverInfo) {
        const updatedDriverInfo = {
          ...driverInfo,
          name: profileSettings.name,
          email: profileSettings.email,
          phone: profileSettings.phone,
        }
        localStorage.setItem("driverAuth", JSON.stringify(updatedDriverInfo))
        setDriverInfo(updatedDriverInfo)
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("driverAuth")
    router.push("/driver/login")
  }

  if (!driverInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DriverHeader driverName={driverInfo.name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {saveSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your settings have been saved successfully.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end mb-4">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save All Settings"}
                {!isSaving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="app">App Settings</TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription>Manage your personal information and profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileSettings.name}
                          onChange={(e) => handleProfileSettingsChange("name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileSettings.email}
                          onChange={(e) => handleProfileSettingsChange("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileSettings.phone}
                          onChange={(e) => handleProfileSettingsChange("phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          id="emergencyContact"
                          value={profileSettings.emergencyContact}
                          onChange={(e) => handleProfileSettingsChange("emergencyContact", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us a bit about yourself"
                        value={profileSettings.bio}
                        onChange={(e) => handleProfileSettingsChange("bio", e.target.value)}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Driver Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Driver ID</Label>
                          <Input value={driverInfo.id} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Shuttle ID</Label>
                          <Input value={driverInfo.shuttleId} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Shuttle Type</Label>
                          <Input value={driverInfo.shuttleType} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Assigned Route</Label>
                          <Input value={driverInfo.route} disabled />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Profile"}
                      {!isSaving && <Save className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => handleNotificationSettingsChange("emailNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                        </div>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) => handleNotificationSettingsChange("smsNotifications", checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium">Notification Types</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="newPassengerAlerts" className="cursor-pointer">
                            New Passenger Alerts
                          </Label>
                          <Switch
                            id="newPassengerAlerts"
                            checked={notificationSettings.newPassengerAlerts}
                            onCheckedChange={(checked) =>
                              handleNotificationSettingsChange("newPassengerAlerts", checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="tripReminders" className="cursor-pointer">
                            Trip Reminders
                          </Label>
                          <Switch
                            id="tripReminders"
                            checked={notificationSettings.tripReminders}
                            onCheckedChange={(checked) => handleNotificationSettingsChange("tripReminders", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="scheduleChanges" className="cursor-pointer">
                            Schedule Changes
                          </Label>
                          <Switch
                            id="scheduleChanges"
                            checked={notificationSettings.scheduleChanges}
                            onCheckedChange={(checked) => handleNotificationSettingsChange("scheduleChanges", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="systemUpdates" className="cursor-pointer">
                            System Updates
                          </Label>
                          <Switch
                            id="systemUpdates"
                            checked={notificationSettings.systemUpdates}
                            onCheckedChange={(checked) => handleNotificationSettingsChange("systemUpdates", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Notification Settings"}
                      {!isSaving && <Save className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* App Settings */}
              <TabsContent value="app">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      App Settings
                    </CardTitle>
                    <CardDescription>Customize your app experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Dark Mode</h4>
                          <p className="text-sm text-gray-500">Use dark theme for the app</p>
                        </div>
                        <Switch
                          checked={appSettings.darkMode}
                          onCheckedChange={(checked) => handleAppSettingsChange("darkMode", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Auto Check-In</h4>
                          <p className="text-sm text-gray-500">Automatically check in passengers when scanned</p>
                        </div>
                        <Switch
                          checked={appSettings.autoCheckIn}
                          onCheckedChange={(checked) => handleAppSettingsChange("autoCheckIn", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Offline Mode</h4>
                          <p className="text-sm text-gray-500">Enable offline functionality</p>
                        </div>
                        <Switch
                          checked={appSettings.offlineMode}
                          onCheckedChange={(checked) => handleAppSettingsChange("offlineMode", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Show Passenger Contacts</h4>
                          <p className="text-sm text-gray-500">Display passenger contact information</p>
                        </div>
                        <Switch
                          checked={appSettings.showPassengerContacts}
                          onCheckedChange={(checked) => handleAppSettingsChange("showPassengerContacts", checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium">Security</h4>
                      <div className="space-y-2">
                        <Button variant="outline">Change Password</Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save App Settings"}
                      {!isSaving && <Save className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <DriverFooter />
    </div>
  )
}
