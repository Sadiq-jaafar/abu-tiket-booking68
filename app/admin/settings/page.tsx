"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    siteName: "ABU Tiket",
    siteDescription: "Ahmadu Bello University's official transportation booking platform",
    contactEmail: "support@abutiket.edu.ng",
    supportPhone: "+234 800 123 4567",
    maintenanceMode: false,
    allowRegistration: true,
    defaultCurrency: "NGN",
    timeZone: "Africa/Lagos",
  })

  // Booking settings
  const [bookingSettings, setBookingSettings] = useState({
    advanceBookingDays: "14",
    minBookingHours: "2",
    allowCancellation: true,
    cancellationPeriodHours: "24",
    refundPercentage: "75",
    showAvailableSeats: true,
    allowMultipleBookings: true,
    maxPassengersPerBooking: "4",
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    bookingConfirmation: true,
    bookingReminder: true,
    reminderHours: "24",
    cancellationNotice: true,
    scheduleChanges: true,
    marketingEmails: false,
  })

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }

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

  const handleSystemSettingsChange = (field: string, value: any) => {
    setSystemSettings({
      ...systemSettings,
      [field]: value,
    })
  }

  const handleBookingSettingsChange = (field: string, value: any) => {
    setBookingSettings({
      ...bookingSettings,
      [field]: value,
    })
  }

  const handleNotificationSettingsChange = (field: string, value: any) => {
    setNotificationSettings({
      ...notificationSettings,
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="System Settings" />

        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">Loading settings...</div>
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

              <Tabs defaultValue="system" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="system">System</TabsTrigger>
                  <TabsTrigger value="booking">Booking</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                {/* System Settings */}
                <TabsContent value="system">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Settings</CardTitle>
                      <CardDescription>Manage general system settings and configurations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="siteName">Site Name</Label>
                          <Input
                            id="siteName"
                            value={systemSettings.siteName}
                            onChange={(e) => handleSystemSettingsChange("siteName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Contact Email</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={systemSettings.contactEmail}
                            onChange={(e) => handleSystemSettingsChange("contactEmail", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="siteDescription">Site Description</Label>
                          <Textarea
                            id="siteDescription"
                            value={systemSettings.siteDescription}
                            onChange={(e) => handleSystemSettingsChange("siteDescription", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supportPhone">Support Phone</Label>
                          <Input
                            id="supportPhone"
                            value={systemSettings.supportPhone}
                            onChange={(e) => handleSystemSettingsChange("supportPhone", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="defaultCurrency">Default Currency</Label>
                          <Select
                            value={systemSettings.defaultCurrency}
                            onValueChange={(value) => handleSystemSettingsChange("defaultCurrency", value)}
                          >
                            <SelectTrigger id="defaultCurrency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                              <SelectItem value="USD">US Dollar (USD)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timeZone">Time Zone</Label>
                          <Select
                            value={systemSettings.timeZone}
                            onValueChange={(value) => handleSystemSettingsChange("timeZone", value)}
                          >
                            <SelectTrigger id="timeZone">
                              <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                              <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Maintenance Mode</h4>
                            <p className="text-sm text-gray-500">
                              Enable maintenance mode to temporarily disable the site for users
                            </p>
                          </div>
                          <Switch
                            checked={systemSettings.maintenanceMode}
                            onCheckedChange={(checked) => handleSystemSettingsChange("maintenanceMode", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Allow Registration</h4>
                            <p className="text-sm text-gray-500">Allow new users to register on the platform</p>
                          </div>
                          <Switch
                            checked={systemSettings.allowRegistration}
                            onCheckedChange={(checked) => handleSystemSettingsChange("allowRegistration", checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSaveSettings} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save System Settings"}
                        {!isSaving && <Save className="ml-2 h-4 w-4" />}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Booking Settings */}
                <TabsContent value="booking">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Settings</CardTitle>
                      <CardDescription>Configure how bookings work on the platform</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="advanceBookingDays">Advance Booking Days</Label>
                          <Input
                            id="advanceBookingDays"
                            type="number"
                            value={bookingSettings.advanceBookingDays}
                            onChange={(e) => handleBookingSettingsChange("advanceBookingDays", e.target.value)}
                          />
                          <p className="text-sm text-gray-500">How many days in advance users can book</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minBookingHours">Minimum Booking Hours</Label>
                          <Input
                            id="minBookingHours"
                            type="number"
                            value={bookingSettings.minBookingHours}
                            onChange={(e) => handleBookingSettingsChange("minBookingHours", e.target.value)}
                          />
                          <p className="text-sm text-gray-500">Minimum hours before departure a booking can be made</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cancellationPeriodHours">Cancellation Period (Hours)</Label>
                          <Input
                            id="cancellationPeriodHours"
                            type="number"
                            value={bookingSettings.cancellationPeriodHours}
                            onChange={(e) => handleBookingSettingsChange("cancellationPeriodHours", e.target.value)}
                          />
                          <p className="text-sm text-gray-500">Hours before departure when cancellation is allowed</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="refundPercentage">Refund Percentage</Label>
                          <Input
                            id="refundPercentage"
                            type="number"
                            value={bookingSettings.refundPercentage}
                            onChange={(e) => handleBookingSettingsChange("refundPercentage", e.target.value)}
                          />
                          <p className="text-sm text-gray-500">Percentage of fare refunded on cancellation</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxPassengersPerBooking">Max Passengers Per Booking</Label>
                          <Input
                            id="maxPassengersPerBooking"
                            type="number"
                            value={bookingSettings.maxPassengersPerBooking}
                            onChange={(e) => handleBookingSettingsChange("maxPassengersPerBooking", e.target.value)}
                          />
                          <p className="text-sm text-gray-500">Maximum number of passengers in a single booking</p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Allow Cancellation</h4>
                            <p className="text-sm text-gray-500">Allow users to cancel their bookings</p>
                          </div>
                          <Switch
                            checked={bookingSettings.allowCancellation}
                            onCheckedChange={(checked) => handleBookingSettingsChange("allowCancellation", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Show Available Seats</h4>
                            <p className="text-sm text-gray-500">Display the number of available seats to users</p>
                          </div>
                          <Switch
                            checked={bookingSettings.showAvailableSeats}
                            onCheckedChange={(checked) => handleBookingSettingsChange("showAvailableSeats", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Allow Multiple Bookings</h4>
                            <p className="text-sm text-gray-500">Allow users to have multiple active bookings</p>
                          </div>
                          <Switch
                            checked={bookingSettings.allowMultipleBookings}
                            onCheckedChange={(checked) => handleBookingSettingsChange("allowMultipleBookings", checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSaveSettings} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Booking Settings"}
                        {!isSaving && <Save className="ml-2 h-4 w-4" />}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Configure how notifications are sent to users</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Enable email notifications for users</p>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) =>
                              handleNotificationSettingsChange("emailNotifications", checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">SMS Notifications</h4>
                            <p className="text-sm text-gray-500">Enable SMS notifications for users</p>
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
                            <Label htmlFor="bookingConfirmation" className="cursor-pointer">
                              Booking Confirmation
                            </Label>
                            <Switch
                              id="bookingConfirmation"
                              checked={notificationSettings.bookingConfirmation}
                              onCheckedChange={(checked) =>
                                handleNotificationSettingsChange("bookingConfirmation", checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="bookingReminder" className="cursor-pointer">
                              Booking Reminder
                            </Label>
                            <Switch
                              id="bookingReminder"
                              checked={notificationSettings.bookingReminder}
                              onCheckedChange={(checked) =>
                                handleNotificationSettingsChange("bookingReminder", checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cancellationNotice" className="cursor-pointer">
                              Cancellation Notice
                            </Label>
                            <Switch
                              id="cancellationNotice"
                              checked={notificationSettings.cancellationNotice}
                              onCheckedChange={(checked) =>
                                handleNotificationSettingsChange("cancellationNotice", checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="scheduleChanges" className="cursor-pointer">
                              Schedule Changes
                            </Label>
                            <Switch
                              id="scheduleChanges"
                              checked={notificationSettings.scheduleChanges}
                              onCheckedChange={(checked) =>
                                handleNotificationSettingsChange("scheduleChanges", checked)
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="marketingEmails" className="cursor-pointer">
                              Marketing Emails
                            </Label>
                            <Switch
                              id="marketingEmails"
                              checked={notificationSettings.marketingEmails}
                              onCheckedChange={(checked) =>
                                handleNotificationSettingsChange("marketingEmails", checked)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4">
                        <Label htmlFor="reminderHours">Reminder Hours Before Departure</Label>
                        <Input
                          id="reminderHours"
                          type="number"
                          value={notificationSettings.reminderHours}
                          onChange={(e) => handleNotificationSettingsChange("reminderHours", e.target.value)}
                        />
                        <p className="text-sm text-gray-500">Hours before departure to send reminder notifications</p>
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
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
