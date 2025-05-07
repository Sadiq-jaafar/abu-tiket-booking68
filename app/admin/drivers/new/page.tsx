"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import type { Shuttle } from "@/lib/definitions"

export default function NewDriverPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [shuttles, setShuttles] = useState<Shuttle[]>([])
  const [isLoadingShuttles, setIsLoadingShuttles] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    driverId: "",
    driverName: "",
    shuttleId: "",
    phoneNumber: "",
    email: "",
    licenseNumber: "",
    status: "active",
  })

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/admin/login")
    }

    // Fetch available shuttles
    const fetchShuttles = async () => {
      try {
        const { data, error } = await supabase.from("shuttles").select("*")
        if (error) throw error
        setShuttles(data || [])
      } catch (err) {
        console.error("Error fetching shuttles:", err)
      } finally {
        setIsLoadingShuttles(false)
      }
    }

    fetchShuttles()
  }, [router])

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
    setError(null)
    setSuccess(null)

    try {
      // Basic validation
      if (!formData.driverId || !formData.driverName || !formData.shuttleId) {
        throw new Error("Please fill in all required fields")
      }

      // Try to insert into the "drivers" table first
      let driverError = null
      try {
        const { error } = await supabase.from("drivers").insert({
          driver_id: formData.driverId,
          driver_name: formData.driverName,
          shuttle_id: formData.shuttleId,
          phone_number: formData.phoneNumber,
          email: formData.email,
          license_number: formData.licenseNumber,
          status: formData.status,
        })
        driverError = error
      } catch (err) {
        driverError = err
      }

      // If there's an error with the "drivers" table, try the "driver" table
      if (driverError) {
        console.log("Trying to insert into driver table instead of drivers")
        const { error } = await supabase.from("driver").insert({
          driver_id: formData.driverId,
          driver_name: formData.driverName,
          shuttle_id: formData.shuttleId,
        })

        if (error) {
          throw new Error("Could not add driver to either 'drivers' or 'driver' tables")
        }
      }

      // Update the shuttle with the driver name
      const { error: updateError } = await supabase
        .from("shuttles")
        .update({ driver_name: formData.driverName })
        .eq("shuttle_id", formData.shuttleId)

      if (updateError) {
        console.warn("Could not update shuttle with driver name:", updateError)
        // Continue anyway since the driver was added successfully
      }

      setSuccess("Driver added successfully!")

      // Redirect to drivers page after a short delay
      setTimeout(() => {
        router.push("/admin/drivers")
      }, 2000)
    } catch (err: any) {
      console.error("Error adding driver:", err)
      setError(err.message || "An error occurred while adding the driver. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="Add New Driver" />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Drivers
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Driver</CardTitle>
              <CardDescription>Enter the details for the new driver</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="driverId">Driver ID *</Label>
                    <Input
                      id="driverId"
                      name="driverId"
                      placeholder="e.g., DRV-1001"
                      value={formData.driverId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name *</Label>
                    <Input
                      id="driverName"
                      name="driverName"
                      placeholder="e.g., John Doe"
                      value={formData.driverName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shuttleId">Assign Shuttle *</Label>
                    <Select
                      value={formData.shuttleId}
                      onValueChange={(value) => handleSelectChange("shuttleId", value)}
                      disabled={isLoadingShuttles}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingShuttles ? "Loading shuttles..." : "Select a shuttle"} />
                      </SelectTrigger>
                      <SelectContent>
                        {shuttles.map((shuttle) => (
                          <SelectItem key={shuttle.shuttle_id} value={shuttle.shuttle_id}>
                            {shuttle.shuttle_id} - {shuttle.type} ({shuttle.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="e.g., +234 812 3456 7890"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="e.g., john.doe@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      placeholder="e.g., DL-12345678"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Driver"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
