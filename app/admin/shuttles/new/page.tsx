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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShuttleFormData {
  shuttle_id: string
  type: string
  category: string
  capacity: string
  facilities: string[]
  status: 'active' | 'maintenance' | 'inactive'
  driver_name: string
  departure_location: string
  arrival_location: string
  base_price: string
  premium_price: string
  isPremium: boolean
  pickup_point?: string
  destination?: string
  route_id?: number
}

export default function NewShuttlePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<ShuttleFormData>({
    shuttle_id: '',
    type: '',
    category: '',
    capacity: '',
    facilities: [],
    status: 'active',
    driver_name: '',
    departure_location: '',
    arrival_location: '',
    base_price: '',
    premium_price: '',
    isPremium: false
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
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : "") : value
    }))
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
    setError("")

    // Validate required fields
    const requiredFields = [
      "shuttle_id",
      "type",
      "category",
      "capacity",
      "departure_location",
      "arrival_location",
      "base_price"
    ]

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}`)
      setIsLoading(false)
      return
    }

    // Validate departure and arrival locations are different
    if (formData.departure_location === formData.arrival_location) {
      setError("Departure and arrival locations must be different")
      setIsLoading(false)
      return
    }

    try {
      const shuttleId = formData.shuttle_id || `SHUT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      const routeId = Math.floor(Math.random() * 2147483647) + 1

      // Create shuttle first
      const { error: shuttleError } = await supabase
        .from("shuttles")
        .insert({
          shuttle_id: shuttleId,
          type: formData.type,
          category: formData.category,
          capacity: parseInt(formData.capacity),
          facilities: formData.facilities || [],
          status: formData.status,
          is_premium: formData.category === "Premium",
          driver_name: formData.driver_name || null,
          pickup_point: formData.departure_location, // Add pickup point
          destination: formData.arrival_location,    // Add destination
          route_id: routeId,                        // Add route_id
          created_at: new Date().toISOString(),
        })

      if (shuttleError) {
        throw new Error(`Shuttle creation failed: ${shuttleError.message}`)
      }

      // Then create the route that references the shuttle
      const { error: routeError } = await supabase
        .from("routes")
        .insert({
          id: routeId,
          departure_location: formData.departure_location,
          arrival_location: formData.arrival_location,
          base_price: parseFloat(formData.base_price),
          premium_price: formData.premium_price ? parseFloat(formData.premium_price) : parseFloat(formData.base_price) * 1.5,
          shuttle_id: shuttleId,
          created_at: new Date().toISOString(),
        })

      if (routeError) {
        // Rollback shuttle creation if route creation fails
        await supabase.from("shuttles").delete().match({ shuttle_id: shuttleId })
        throw new Error(`Route creation failed: ${routeError.message}`)
      }

      setSuccess("Shuttle and route created successfully!")

      // Clear form
      setFormData({
        shuttle_id: '',
        type: '',
        category: '',
        capacity: '',
        facilities: [] as string[],
        status: 'active' as const,
        driver_name: '',
        departure_location: '',
        arrival_location: '',
        base_price: '',
        premium_price: '',
        isPremium: false
      })

      // Redirect after success
      setTimeout(() => {
        router.push("/admin/shuttles")
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to create shuttle and route")
      }
      console.error("Creation error:", error)
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
                    <Label htmlFor="shuttle_id">Shuttle ID *</Label>
                    <Input
                      id="shuttle_id"
                      name="shuttle_id"
                      value={formData.shuttle_id}
                      onChange={handleChange}
                      placeholder="Enter shuttle ID"
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
                    <Label htmlFor="departure_location">Departure Location *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {formData.departure_location || "Select departure location..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search location..." />
                          <CommandEmpty>No location found.</CommandEmpty>
                          <CommandGroup>
                            {campusLocations.map((location) => (
                              <CommandItem
                                key={location}
                                onSelect={() => handleSelectChange("departure_location", location)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.departure_location === location ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {location}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Input
                      className="mt-2"
                      placeholder="Or type custom location"
                      value={formData.departure_location}
                      onChange={(e) => handleSelectChange("departure_location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival_location">Arrival Location *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {formData.arrival_location || "Select arrival location..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search location..." />
                          <CommandEmpty>No location found.</CommandEmpty>
                          <CommandGroup>
                            {campusLocations.map((location) => (
                              <CommandItem
                                key={location}
                                onSelect={() => handleSelectChange("arrival_location", location)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.arrival_location === location ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {location}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Input
                      className="mt-2"
                      placeholder="Or type custom location"
                      value={formData.arrival_location}
                      onChange={(e) => handleSelectChange("arrival_location", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price (₦) *</Label>
                    <Input
                      id="base_price"
                      name="base_price"
                      type="number"
                      min="10"
                      step="10"
                      value={formData.base_price}
                      onChange={handleChange}
                      onWheel={(e) => e.currentTarget.blur()}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premium_price">Premium Price (₦)</Label>
                    <Input
                      id="premium_price"
                      name="premium_price"
                      type="number"
                      min={formData.base_price ? parseFloat(formData.base_price) : 0}
                      step="10"
                      value={formData.premium_price}
                      onChange={handleChange}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder={formData.base_price ? `Min: ${parseFloat(formData.base_price) * 1.5}` : 'Enter base price first'}
                    />
                    <p className="text-sm text-gray-500">
                      Must be at least 50% more than base price
                    </p>
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
                      min="4"
                      max="100"
                      step="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      onWheel={(e) => e.currentTarget.blur()} // Prevent mousewheel changes
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
                        id="driver_name"
                        name="driver_name"
                        placeholder="e.g., John Doe"
                        value={formData.driver_name}
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
