"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarIcon, ClockIcon, CreditCard, StarIcon, UsersIcon } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { getShuttles, getRoutes, } from "@/lib/actions"
import { createBooking } from "@/lib/createBooking"
import type { Passenger, ContactInfo } from "@/lib/definitions"
import { createPassengers, createContactInfo } from "@/lib/passenerAction";

export default function BookingPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract search parameters
  const shuttleId = searchParams.get("shuttle_id") || ""
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const time = searchParams.get("time") || "morning"
  const passengerCount = Number.parseInt(searchParams.get("passengers") || "1", 10)
  const isPremium = searchParams.get("premium") === "true"

  // State for shuttle and route data
  const [shuttle, setShuttle] = useState<any>(null)
  const [route, setRoute] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // State for passenger forms
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array(passengerCount)
      .fill(null)
      .map(() => ({
        name: "",
        first_name: "",
        last_name: "",
        id_type: "student_id",
        id_number: "",
        booking_id: "",
        shuttle_id: shuttleId, // Add shuttle_id to match the Passenger type
      })),
  )

  // State for contact information
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "",
    phone: "",
    special_requests: "",
    booking_id: "",
  })

  // User authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<"student" | "staff" | "admin" | "driver" | undefined>("student")
  const [userName, setUserName] = useState("")
  const [userInitials, setUserInitials] = useState("")

  // State for form validation
  const [isPassengerFormValid, setIsPassengerFormValid] = useState(false)
  const [isContactFormValid, setIsContactFormValid] = useState(false)
  const [activeTab, setActiveTab] = useState("passengers")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check authentication on page load
  useEffect(() => {
    checkAuthentication()
  }, [])

  // Check if user is logged in
  const checkAuthentication = () => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUserId = localStorage.getItem("userId")
    const storedUserType = localStorage.getItem("userType") as "student" | "staff" | "admin" | "driver" | undefined
    const storedUserName = localStorage.getItem("userName")
    const storedUserInitials = localStorage.getItem("userInitials")

    if (storedIsLoggedIn && storedUserId) {
      setIsLoggedIn(true)
      setUserId(storedUserId)
      if (storedUserType) setUserType(storedUserType)
      if (storedUserName) setUserName(storedUserName)
      if (storedUserInitials) setUserInitials(storedUserInitials)

      // Pre-fill contact info with user's email if available
      const userEmail = localStorage.getItem("userEmail")
      if (userEmail) {
        setContactInfo((prev) => ({ ...prev, email: userEmail }))
      }

      // Fetch shuttle and route data
      fetchShuttleAndRouteData()
    } else {
      // Redirect to login if not logged in
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
    }
  }

  const fetchShuttleAndRouteData = async () => {
    setIsLoading(true)
    try {
      const [shuttlesData, routesData] = await Promise.all([
        getShuttles(),
        getRoutes()
      ])
  
      const selectedShuttle = shuttlesData.find((s: any) => s.shuttle_id === shuttleId)
      
      if (!selectedShuttle) {
        throw new Error("Shuttle not found")
      }
  
      // Find route using shuttle_id instead of id
      const selectedRoute = routesData.find((r: any) => r.shuttle_id === selectedShuttle.shuttle_id)
  
      if (!selectedRoute) {
        throw new Error(`Route for shuttle ${selectedShuttle.shuttle_id} not found`)
      }
  
      setShuttle(selectedShuttle)
      setRoute(selectedRoute)
  
    } catch (error) {
      console.error("Error fetching shuttle data:", error)
      setShuttle(sampleShuttle)
      setRoute(sampleRoute)
    } finally {
      setIsLoading(false)
    }
  }
  
  

  
  
  // Handle passenger form changes
  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value }
    setPassengers(updatedPassengers)

    // Validate passenger forms
    validatePassengerForms(updatedPassengers)
  }

  // Handle contact info changes
  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo({ ...contactInfo, [field]: value })

    // Validate contact form
    validateContactForm({ ...contactInfo, [field]: value })
  }

  // Validate passenger forms
  const validatePassengerForms = (passengerData: Passenger[]) => {
    const isValid = passengerData.every(
      (p) => p.first_name.trim() !== "" && p.last_name.trim() !== "" && p.id_number.trim() !== "",
    )
    setIsPassengerFormValid(isValid)
  }

  // Validate contact form
  const validateContactForm = (contactData: ContactInfo) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\d{10,15}$/

    const isValid = emailRegex.test(contactData.email) && phoneRegex.test(contactData.phone.replace(/[^0-9]/g, ""))

    setIsContactFormValid(isValid)
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!route) return 0

    const basePrice = isPremium ? route.premium_price || route.price * 1.5 : route.price
    const subtotal = basePrice * passengerCount
    const serviceFee = 50
    const tax = Math.round(subtotal * 0.05)

    return subtotal + serviceFee + tax
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!isPassengerFormValid || !isContactFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to complete this booking.",
        variant: "destructive",
      })
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    setIsSubmitting(true)

    try {
      // Create booking data
      const bookingData = {
        user_id: userId,
        shuttle_id: shuttle.shuttle_id,
        route_id: route.id,
        departure_date: date,
        departure_time: shuttle.departure_time || "08:00:00",
        arrival_time: shuttle.arrival_time || "10:00:00",
        booking_date: new Date().toISOString(),
        status: "upcoming" as "upcoming", // Explicitly type as a valid literal
        is_premium: isPremium,
        price: route.price,
        total_amount: calculateTotalPrice(),
        pickup_address: route.origin || "Main Campus",
        dropoff_address: route.destination || "Kongo Campus",
        check_in_status: "pending" as "pending",
        
      }

      // Create booking
      const { booking, error } = await createBooking(bookingData, passengers, contactInfo)

      if (error) {
        throw new Error(error)
      }
      // Create passengers and contact info in parallel
    
      // Step 2: Prepare and create passengers
    const passengersWithIds = passengers.map(p => ({
      ...p,
      booking_id: booking.booking_id,
      shuttle_id: shuttle.shuttle_id
    }));
    
    const passengersResult = await createPassengers(passengersWithIds);
    if (passengersResult.error) throw new Error(passengersResult.error);

    // Step 3: Prepare and create contact info
    const contactInfoWithId = {
      ...contactInfo,
      booking_id: booking.booking_id
    };
    const contactResult = await createContactInfo(contactInfoWithId);
    



      // Store booking details in localStorage for confirmation page
      const bookingDetails = {
        bookingId: booking.booking_id,
        type: shuttle.type,
        category: userType === "staff" ? "Staff" : "Student",
        departureTime: shuttle.departure_time,
        arrivalTime: shuttle.arrival_time,
        duration: "45m", // Calculate actual duration
        departureDate: new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        departureLocation: route.origin || "Main Campus Terminal",
        arrivalLocation: route.destination || "Kongo Campus Terminal",
        price: route.price,
        facilities: shuttle.facilities ? JSON.parse(shuttle.facilities) : ["WiFi", "Air Conditioning"],
        passengers: passengers.map((p) => ({
          name: `${p.first_name} ${p.last_name}`,
          idType: p.id_type === "student_id" ? "Student ID" : p.id_type === "staff_id" ? "Staff ID" : "National ID",
          idNumber: p.id_number,
        })),
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        paymentMethod: "Pay on Boarding",
        totalAmount: calculateTotalPrice(),
        isPremium: isPremium,
      }

      localStorage.setItem("currentBookingDetails", JSON.stringify(bookingDetails))

      // Redirect to booking confirmation page
      router.push(`/booking/confirmation?booking_id=${booking.booking_id}`)

      toast({
        title: "Booking Successful",
        description: "Your booking has been confirmed. Redirecting to your ticket...",
      })
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking Error",
        description: "Failed to complete your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Today"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Today"
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />

      <main className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-[#006400] mb-6">Complete Your Booking</h1>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Booking summary */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-medium">Route</h3>
                        <p>
                          {route?.origin || "Loading..."} to {route?.destination || "..."}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Date & Time</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className="bg-gray-100">
                            <CalendarIcon className="w-3 h-3 mr-1" /> {formatDate(date)}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {shuttle?.departure_time || "Scheduled time"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">Shuttle</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline" className="bg-gray-100">
                            {shuttle?.type || "Standard"} Shuttle
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100">
                            <UsersIcon className="w-3 h-3 mr-1" /> {passengerCount}{" "}
                            {passengerCount === 1 ? "Passenger" : "Passengers"}
                          </Badge>
                          {isPremium && (
                            <Badge className="bg-amber-500">
                              <StarIcon className="w-3 h-3 mr-1" /> Premium Service
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-medium">Price Details</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span>Base fare</span>
                            <span>
                              ₦{route?.price || 0} × {passengerCount}
                            </span>
                          </div>
                          {isPremium && (
                            <div className="flex justify-between">
                              <span>Premium service</span>
                              <span>+₦{(route?.premium_price || route?.price * 0.5) - route?.price}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Service fee</span>
                            <span>₦50</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (5%)</span>
                            <span>₦{Math.round((route?.price || 0) * passengerCount * 0.05)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>₦{calculateTotalPrice()}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Passenger and payment forms */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Passenger & Payment Information</CardTitle>
                  <CardDescription>Please fill in the details to complete your booking</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="passengers">Passenger Details</TabsTrigger>
                      <TabsTrigger value="contact" disabled={!isPassengerFormValid}>
                        Contact & Payment
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="passengers" className="space-y-4 mt-4">
                      {passengers.map((passenger, index) => (
                        <div key={index} className="space-y-4 p-4 border rounded-md">
                          <h3 className="font-medium">Passenger {index + 1}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`firstName-${index}`}>First Name</Label>
                              <Input
                                id={`firstName-${index}`}
                                value={passenger.first_name}
                                onChange={(e) => handlePassengerChange(index, "first_name", e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                              <Input
                                id={`lastName-${index}`}
                                value={passenger.last_name}
                                onChange={(e) => handlePassengerChange(index, "last_name", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`idType-${index}`}>ID Type</Label>
                              <select
                                id={`idType-${index}`}
                                value={passenger.id_type}
                                onChange={(e) => handlePassengerChange(index, "id_type", e.target.value)}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="student_id">Student ID</option>
                                <option value="staff_id">Staff ID</option>
                                <option value="national_id">National ID</option>
                                <option value="drivers_license">Driver's License</option>
                                <option value="passport">Passport</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`idNumber-${index}`}>ID Number</Label>
                              <Input
                                id={`idNumber-${index}`}
                                value={passenger.id_number}
                                onChange={(e) => handlePassengerChange(index, "id_number", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end">
                        <Button
                          onClick={() => setActiveTab("contact")}
                          disabled={!isPassengerFormValid}
                          className="bg-[#006400] hover:bg-[#005000]"
                        >
                          Continue to Contact & Payment
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="contact" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={contactInfo.email}
                              onChange={(e) => handleContactInfoChange("email", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={contactInfo.phone}
                              onChange={(e) => handleContactInfoChange("phone", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialRequest">Special Requests (Optional)</Label>
                          <Textarea
                            id="specialRequest"
                            value={contactInfo.special_requests || ""}
                            onChange={(e) => handleContactInfoChange("special_requests", e.target.value)}
                            placeholder="Any special requirements or requests"
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-medium">Payment Method</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
                            <input type="radio" id="payment-cash" name="payment-method" checked readOnly />
                            <Label htmlFor="payment-cash">Pay on Boarding (Cash)</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-md opacity-50">
                            <input type="radio" id="payment-card" name="payment-method" disabled />
                            <Label htmlFor="payment-card" className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2" /> Card Payment (Coming Soon)
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={() => setActiveTab("passengers")}>
                          Back to Passenger Details
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={!isContactFormValid || isSubmitting}
                          className="bg-[#006400] hover:bg-[#005000]"
                        >
                          {isSubmitting ? "Processing..." : "Complete Booking"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4 text-sm text-gray-500">
                  <p>Your booking will be confirmed instantly</p>
                  <p>Secure booking process</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Sample data for fallback
const sampleShuttle = {
  shuttle_id: "SH-1001",
  type: "Standard",
  capacity: 15,
  departure_time: "8:00 AM",
  arrival_time: "10:00 AM",
  facilities: '["WiFi", "Air Conditioning"]',
}

const sampleRoute = {
  shuttle_id: "SH-1001",  // Match shuttle_id
  base_price: 150,
  premium_price: 250,
  arrival_location: "Kongo Campus",
  departure_location: "Main Campus",
}
