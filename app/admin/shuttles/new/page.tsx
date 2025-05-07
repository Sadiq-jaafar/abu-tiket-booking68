"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Minus, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function NewShuttlePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    shuttleId: "",
    type: "Campus Bus",
    category: "Student",
    capacity: 40,
    status: "active",
    facilities: [] as string[],
    isPremium: false,
    driverName: "",
    departureLocation: "",
    arrivalLocation: "",
    basePrice: 100,
    premiumPrice: 150,
  })

  const [facilityInput, setFacilityInput] = useState("")

  // Shuttle type options
  const shuttleTypes = ["Campus Bus", "Mini Bus", "Coaster", "Van", "SUV", "Sedan", "Express Bus", "Luxury Bus"]

  // Campus locations for pickup and destination
  const campusLocations = [
    "Main Campus Terminal",
    "Kongo Campus Terminal",
    "Faculty of Science",
    "Faculty of Arts",
    "Faculty of Engineering",
    "Faculty of Medicine",
    "Admin Block",
    "Student Union Building",
    "University Library",
    "Sports Complex",
    "Samaru",
    "Shika",
    "PZ",
    "Sabon Gari",
  ]

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/admin/login")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAddFacility = () => {
    if (facilityInput.trim() !== "" && !formData.facilities.includes(facilityInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, facilityInput.trim()],
      }))
      setFacilityInput("")
    }
  }

  const handleRemoveFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((f) => f !== facility),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Basic validation
      if (
        !formData.shuttleId ||
        !formData.type ||
        !formData.category ||
        !formData.departureLocation ||
        !formData.arrivalLocation
      ) {
        throw new Error("Please fill in all required fields")
      }

      // Start a transaction
      // First, insert the shuttle
      const { data: shuttle, error: shuttleError } = await supabase
        .from("shuttles")
        .insert({
          shuttle_id: formData.shuttleId,
          type: formData.type,
          category: formData.category,
          capacity: formData.capacity,
          status: formData.status,
          facilities: formData.facilities,
          is_premium: formData.isPremium,
          driver_name: formData.driverName,
        })
        .select()
        .single()

      if (shuttleError) {
        throw shuttleError
      }

      // Then, insert the route
      const { error: routeError } = await supabase.from("routes").insert({
        departure_location: formData.departureLocation,
        arrival_location: formData.arrivalLocation,
        base_price: formData.basePrice,
        premium_price: formData.premiumPrice,
        shuttle_id: formData.shuttleId,
      })

      if (routeError) {
        throw routeError
      }

      setSuccess("Shuttle and route added successfully!")

      // Redirect to shuttles page after a short delay
      setTimeout(() => {
        router.push("/admin/shuttles")
      }, 2000)
    } catch (err: any) {
      console.error("Error adding shuttle:", err)
      setError(err.message || "An error occurred while adding the shuttle. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="Add New Shuttle" />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Shuttles
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Shuttle</CardTitle>
              <CardDescription>Enter the details for the new shuttle</CardDescription>
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
                    <Label htmlFor="shuttleId">Shuttle ID *</Label>
                    <Input
                      id="shuttleId"
                      name="shuttleId"
                      placeholder="e.g., SH-1001"
                      value={formData.shuttleId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Shuttle Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shuttle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {shuttleTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departureLocation">Departure Location *</Label>
                    <Select
                      value={formData.departureLocation}
                      onValueChange={(value) => handleSelectChange("departureLocation", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select departure location" />
                      </SelectTrigger>
                      <SelectContent>
                        {campusLocations.map((location) => (
                          <SelectItem key={`departure-${location}`} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrivalLocation">Arrival Location *</Label>
                    <Select
                      value={formData.arrivalLocation}
                      onValueChange={(value) => handleSelectChange("arrivalLocation", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select arrival location" />
                      </SelectTrigger>
                      <SelectContent>
                        {campusLocations.map((location) => (
                          <SelectItem key={`arrival-${location}`} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price (₦) *</Label>
                    <Input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      min="0"
                      value={formData.basePrice}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premiumPrice">Premium Price (₦) *</Label>
                    <Input
                      id="premiumPrice"
                      name="premiumPrice"
                      type="number"
                      min="0"
                      value={formData.premiumPrice}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (seats) *</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
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
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input
                      id="driverName"
                      name="driverName"
                      placeholder="e.g., John Doe"
                      value={formData.driverName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isPremium">Premium Shuttle</Label>
                    <Switch
                      id="isPremium"
                      checked={formData.isPremium}
                      onCheckedChange={(checked) => handleSwitchChange("isPremium", checked)}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Premium shuttles have additional amenities and higher pricing</p>
                </div>

                <div className="space-y-2">
                  <Label>Facilities</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add facility (e.g., WiFi, Air Conditioning)"
                      value={facilityInput}
                      onChange={(e) => setFacilityInput(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddFacility} className="shrink-0">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.facilities.map((facility) => (
                      <div
                        key={facility}
                        className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {facility}
                        <button
                          type="button"
                          onClick={() => handleRemoveFacility(facility)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Shuttle"}
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
