"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarIcon, MapPinIcon, SearchIcon, UsersIcon, ClockIcon, StarIcon } from "lucide-react"
import { CheckCircle, InfoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { getRoutes } from "@/lib/actions"
import { supabase } from "@/lib/supabase"
import type { TripType } from "@/lib/definitions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  const router = useRouter()

  // State for user authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"student" | "staff" | "admin" | "driver" | undefined>("student")
  const [userName, setUserName] = useState("Ibrahim Mohammed")
  const [userInitials, setUserInitials] = useState("IM")

  // State for premium mode toggle
  const [isPremium, setIsPremium] = useState(false)

  // State for form data
  const [activeTab, setActiveTab] = useState("shuttle")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    time: "",
    passengers: "1",
    shuttleType: "",
    specialRequests: "",
    fromCampus: "",
    toCampus: "",
  })

  // State for available routes
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([])
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false)

  // State for special trip data
  const [specialTripData, setSpecialTripData] = useState({
    trip: "" as TripType,
    destination: "",
    departure_date: "",
    passengers: 1,
    special_request: "",
    time: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // State to store the submitted data
  const [submittedData, setSubmittedData] = useState<{
    trip_id: string;
    trip: TripType;
    destination: string;
    departure_date: string;
    time: string;
    passengers: number;
    special_request: string;
  } | null>(null)

  // Update the useEffect hook to check for logged-in status and fetch routes
  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUserType = localStorage.getItem("userType") as "student" | "staff" | "admin" | "driver" | undefined
    const storedUserName = localStorage.getItem("userName")
    const storedUserInitials = localStorage.getItem("userInitials")

    if (storedIsLoggedIn) {
      // Update state with localStorage values
      setIsLoggedIn(true)
      if (storedUserType) setUserType(storedUserType)
      if (storedUserName) setUserName(storedUserName)
      if (storedUserInitials) setUserInitials(storedUserInitials)
    }

    // Fetch available routes
    fetchRoutes()
  }, [])

  // Fetch routes from the database
  const fetchRoutes = async () => {
    setIsLoadingRoutes(true)
    try {
      const routes = await getRoutes()
      setAvailableRoutes(routes)
    } catch (error) {
      console.error("Error fetching routes:", error)
      toast({
        title: "Error",
        description: "Failed to load available routes. Using default routes instead.",
        variant: "destructive",
      })
      // Fallback to default routes
      setAvailableRoutes(popularRoutes)
    } finally {
      setIsLoadingRoutes(false)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = (e: FormEvent, tabType: string) => {
    e.preventDefault()

    // Build query parameters based on the active tab
    const queryParams = new URLSearchParams()

    if (tabType === "shuttle") {
      queryParams.append("from", formData.from)
      queryParams.append("to", formData.to)
    } else if (tabType === "intercampus") {
      queryParams.append("from", formData.fromCampus)
      queryParams.append("to", formData.toCampus)
    }

    // Common parameters
    if (date) {
      queryParams.append("date", date.toISOString().split("T")[0])
    }
    queryParams.append("time", formData.time)
    queryParams.append("passengers", formData.passengers)
    queryParams.append("premium", isPremium.toString())

    // Add premium-specific parameters if applicable
    if (isPremium) {
      if (formData.shuttleType) {
        queryParams.append("shuttleType", formData.shuttleType)
      }
      if (formData.specialRequests) {
        queryParams.append("specialRequests", formData.specialRequests)
      }
    }

    // Navigate to search results with query parameters
    router.push(`/search-results?${queryParams.toString()}`)
  }
  const handlePopularRouteClick = (from: string, to: string) => {
    const queryParams = new URLSearchParams()
    
    // Set basic parameters
    queryParams.append("from", from)
    queryParams.append("to", to)
    queryParams.append("premium", isPremium.toString())
    
    // Set date
    if (date) {
      queryParams.append("date", date.toISOString().split('T')[0])
    }
    
    // Set default time based on premium status
    queryParams.append("time", isPremium ? "anytime" : "morning")
    
    // Set default passengers
    queryParams.append("passengers", "1")
  
    // Add premium-specific parameters if applicable
    if (isPremium) {
      queryParams.append("shuttleType", "executive") // Default premium shuttle type
    }
  
    router.push(`/search-results?${queryParams.toString()}`)
  }

  // Handle special trip form submission
  const handleSpecialTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!isLoggedIn) {
        throw new Error("Please log in to request a special trip")
      }

      const trip_id = `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Remove date field and only use departure_date
      const tripData = {
        trip_id,
        trip: specialTripData.trip,
        destination: specialTripData.destination,
        departure_date: specialTripData.departure_date, // This is the only date field we need
        time: specialTripData.time,
        passengers: specialTripData.passengers,
        special_request: specialTripData.special_request,
        status: "pending" as const,
        user_id: localStorage.getItem("userId")
      }

      if (!tripData.trip || !tripData.destination || !tripData.departure_date || !tripData.time) {
        throw new Error("Please fill in all required fields")
      }

      const { error } = await supabase
        .from('special_trips')
        .insert([tripData])

      if (error) {
        throw new Error(error.message)
      }

      // Store the submitted data
      setSubmittedData(tripData)
      setShowSuccessDialog(true)

      // Reset form
      setSpecialTripData({
        trip: "" as TripType,
        destination: "",
        departure_date: "",
        passengers: 1,
        special_request: "",
        time: ""
      })

    } catch (error) {
      console.error("Error submitting special trip:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />

      <main className="container px-4 py-8 mx-auto flex-1">
        <section className="max-w-4xl mx-auto mb-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#006400]">ABU Zaria Transport Booking</h2>
            <p className="mt-2 text-gray-600">Book campus shuttles and inter-campus transportation services</p>
          </div>

          <Card className={`${isPremium ? "border-amber-500" : "border-[#006400]"} border-t-4`}>
            <CardContent className="p-6">
              <div className="flex justify-end mb-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="premium-mode" className={`text-sm font-medium ${isPremium ? "text-amber-700" : ""}`}>
                    Premium Service
                  </Label>
                  <Switch
                    id="premium-mode"
                    checked={isPremium}
                    onCheckedChange={setIsPremium}
                    className={isPremium ? "data-[state=checked]:bg-amber-500" : ""}
                  />
                </div>
              </div>

              {isPremium && (
                <div className="p-4 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <StarIcon className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800">Premium Door-to-Door Service</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Available 24/7 with exclusive benefits and personalized service
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          <ClockIcon className="w-3 h-3 mr-1" /> 24/7 Service
                        </Badge>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          <MapPinIcon className="w-3 h-3 mr-1" /> Door-to-Door
                        </Badge>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          Dedicated Driver
                        </Badge>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                          Premium Vehicles
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Tabs defaultValue="shuttle" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="shuttle">Campus Shuttle</TabsTrigger>
                  <TabsTrigger value="intercampus">Inter-Campus</TabsTrigger>
                  <TabsTrigger value="special-trip">Special Trips</TabsTrigger>
                </TabsList>
                <TabsContent value="shuttle" className="mt-0">
                  <form className="space-y-6" onSubmit={(e) => handleSubmit(e, "shuttle")}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="from">From</Label>
                        <div className="relative">
                          <MapPinIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                          <Input
                            id="from"
                            name="from"
                            placeholder={isPremium ? "Enter exact pickup location" : "Pickup location"}
                            className="pl-10"
                            value={formData.from}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="to">To</Label>
                        <div className="relative">
                          <MapPinIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                          <Input
                            id="to"
                            name="to"
                            placeholder={isPremium ? "Enter exact dropoff location" : "Destination"}
                            className="pl-10"
                            value={formData.to}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start w-full text-left">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              <span>{date ? date.toLocaleDateString() : "Pick a date"}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={isPremium ? "Any time (24/7)" : "Select time"} />
                          </SelectTrigger>
                          <SelectContent>
                            {isPremium ? (
                              <>
                                <SelectItem value="anytime">Any time (24/7)</SelectItem>
                                <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                                <SelectItem value="evening">Evening (5PM - 10PM)</SelectItem>
                                <SelectItem value="night">Night (10PM - 6AM)</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                                <SelectItem value="evening">Evening (5PM - 10PM)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Passengers</Label>
                        <Select
                          value={formData.passengers}
                          onValueChange={(value) => handleSelectChange("passengers", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Number of passengers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Passenger</SelectItem>
                            <SelectItem value="2">2 Passengers</SelectItem>
                            <SelectItem value="3">3 Passengers</SelectItem>
                            <SelectItem value="4">4 Passengers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {isPremium && (
                      <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                        <h4 className="text-sm font-medium text-amber-800 mb-2">Premium Shuttle Options</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="shuttleType" className="text-amber-700">
                              Shuttle Type
                            </Label>
                            <Select
                              value={formData.shuttleType}
                              onValueChange={(value) => handleSelectChange("shuttleType", value)}
                            >
                              <SelectTrigger id="shuttleType" className="border-amber-200">
                                <SelectValue placeholder="Select shuttle type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="executive">Executive Shuttle</SelectItem>
                                <SelectItem value="luxury">Luxury Vehicle</SelectItem>
                                <SelectItem value="suv">Premium SUV</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="specialRequests" className="text-amber-700">
                              Special Requests
                            </Label>
                            <Input
                              id="specialRequests"
                              name="specialRequests"
                              placeholder="Any special requirements"
                              className="border-amber-200"
                              value={formData.specialRequests}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className={`w-full ${
                        isPremium ? "bg-amber-600 hover:bg-amber-700" : "bg-[#006400] hover:bg-[#005000]"
                      }`}
                    >
                      <SearchIcon className="w-4 h-4 mr-2" />
                      Search {isPremium ? "Premium" : ""} Shuttles
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="intercampus" className="mt-0">
                  <form className="space-y-6" onSubmit={(e) => handleSubmit(e, "intercampus")}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="campus-from">From Campus</Label>
                        <Select
                          value={formData.fromCampus}
                          onValueChange={(value) => handleSelectChange("fromCampus", value)}
                        >
                          <SelectTrigger id="campus-from">
                            <SelectValue placeholder="Select campus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Main Campus</SelectItem>
                            <SelectItem value="kongo">Kongo Campus</SelectItem>
                            <SelectItem value="samaru">Samaru Campus</SelectItem>
                            <SelectItem value="shika">Shika Campus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="campus-to">To Campus</Label>
                        <Select
                          value={formData.toCampus}
                          onValueChange={(value) => handleSelectChange("toCampus", value)}
                        >
                          <SelectTrigger id="campus-to">
                            <SelectValue placeholder="Select campus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Main Campus</SelectItem>
                            <SelectItem value="kongo">Kongo Campus</SelectItem>
                            <SelectItem value="samaru">Samaru Campus</SelectItem>
                            <SelectItem value="shika">Shika Campus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start w-full text-left">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              <span>{date ? date.toLocaleDateString() : "Pick a date"}</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Select value={formData.time} onValueChange={(value) => handleSelectChange("time", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={isPremium ? "Any time (24/7)" : "Select time"} />
                          </SelectTrigger>
                          <SelectContent>
                            {isPremium ? (
                              <>
                                <SelectItem value="anytime">Any time (24/7)</SelectItem>
                                <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                                <SelectItem value="evening">Evening (5PM - 10PM)</SelectItem>
                                <SelectItem value="night">Night (10PM - 6AM)</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                                <SelectItem value="evening">Evening (5PM - 10PM)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Passengers</Label>
                        <Select
                          value={formData.passengers}
                          onValueChange={(value) => handleSelectChange("passengers", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Number of passengers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Passenger</SelectItem>
                            <SelectItem value="2">2 Passengers</SelectItem>
                            <SelectItem value="3">3 Passengers</SelectItem>
                            <SelectItem value="4">4 Passengers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={`w-full ${
                        isPremium ? "bg-amber-600 hover:bg-amber-700" : "bg-[#006400] hover:bg-[#005000]"
                      }`}
                    >
                      <SearchIcon className="w-4 h-4 mr-2" />
                      Search {isPremium ? "Premium" : ""} Inter-Campus Buses
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="special-trip">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Request Special Trip</h2>
                      <p className="text-muted-foreground">
                        Book a custom trip for field trips, excursions, or competitions
                      </p>
                    </div>
                    
                    <form onSubmit={handleSpecialTripSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Trip Type</label>
                          <Select
                            value={specialTripData.trip}
                            onValueChange={(value) => setSpecialTripData({ 
                              ...specialTripData, 
                              trip: value as TripType 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select trip type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="field trip">Field Trip</SelectItem>
                              <SelectItem value="excursion">Excursion</SelectItem>
                              <SelectItem value="competition">Competition</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Destination</label>
                          <Input
                            value={specialTripData.destination}
                            onChange={(e) => setSpecialTripData({ 
                              ...specialTripData, 
                              destination: e.target.value 
                            })}
                            placeholder="Enter destination"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Departure Date</label>
                          <Input
                            type="date"
                            value={specialTripData.departure_date}
                            onChange={(e) => setSpecialTripData({ 
                              ...specialTripData, 
                              departure_date: e.target.value 
                            })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Time</label>
                          <Input
                            type="time"
                            value={specialTripData.time}
                            onChange={(e) => setSpecialTripData({ 
                              ...specialTripData, 
                              time: e.target.value 
                            })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Number of Passengers</label>
                          <Input
                            type="number"
                            value={specialTripData.passengers}
                            onChange={(e) => setSpecialTripData({ 
                              ...specialTripData, 
                              passengers: parseInt(e.target.value) 
                            })}
                            required
                            min={1}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Special Requests</label>
                        <Textarea
                          value={specialTripData.special_request}
                          onChange={(e) => setSpecialTripData({ 
                            ...specialTripData, 
                            special_request: e.target.value 
                          })}
                          placeholder="Any special requirements or additional information..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Submitting..." : "Submit Special Trip Request"}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Popular Routes section */}
        <section className="max-w-4xl mx-auto mb-12">
  <h3 className="mb-6 text-xl font-semibold text-[#006400]">Popular Routes</h3>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {popularRoutes.map((route, index) => (
      <Card key={index} className="overflow-hidden border-[#006400] border-l-2">
        <CardHeader className="p-0">
          <div className="h-40 bg-gray-200">
            <img
              src={`/placeholder.svg?height=160&width=320&text=${route.from}-${route.to}`}
              alt={`${route.from} to ${route.to}`}
              className="object-cover w-full h-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg">
            {route.from} to {route.to}
          </CardTitle>
          <CardDescription>₦{route.price} per person</CardDescription>
          {route.premiumAvailable && (
            <Badge className="mt-2 bg-amber-500">
              <StarIcon className="w-3 h-3 mr-1" /> Premium Available
            </Badge>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            variant="outline" 
            className="w-full border-[#006400] text-[#006400] hover:bg-[#e6f2e6]"
            onClick={() => handlePopularRouteClick(route.from, route.to)}
          >
            View Schedule
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
</section>

        {/* Why Choose ABU Tiket section */}
        <section className="max-w-4xl mx-auto">
          <h3 className="mb-6 text-xl font-semibold text-[#006400]">Why Choose ABU Tiket</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-t-2 border-[#006400]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#e6f2e6]">
                  <SearchIcon className="w-6 h-6 text-[#006400]" />
                </div>
                <h4 className="mb-2 text-lg font-medium">Easy Booking</h4>
                <p className="text-sm text-gray-500">
                  Book your campus transportation in just a few clicks with our user-friendly platform.
                </p>
              </CardContent>
            </Card>
            <Card className="border-t-2 border-[#006400]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#e6f2e6]">
                  <UsersIcon className="w-6 h-6 text-[#006400]" />
                </div>
                <h4 className="mb-2 text-lg font-medium">Student Support</h4>
                <p className="text-sm text-gray-500">
                  Dedicated support for students with special transportation needs and group bookings.
                </p>
              </CardContent>
            </Card>
            <Card className="border-t-2 border-amber-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-amber-100">
                  <StarIcon className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="mb-2 text-lg font-medium">Premium Service</h4>
                <p className="text-sm text-gray-500">
                  Upgrade to premium for 24/7 door-to-door service with dedicated drivers and luxury vehicles.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <SiteFooter />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Request Sent Successfully
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-4">
                <p>
                  Your special trip request has been submitted successfully. Our team will review your request
                  and get back to you within 24 hours.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Request Details:</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Trip ID:</span>
                      <span className="font-medium">{submittedData?.trip_id}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Trip Type:</span>
                      <span className="font-medium">{submittedData?.trip}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Destination:</span>
                      <span className="font-medium">{submittedData?.destination}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Departure Date:</span>
                      <span className="font-medium">
                        {submittedData?.departure_date ? 
                          new Date(submittedData.departure_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not specified'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="font-medium">
                        {submittedData?.time ? 
                          new Date(`2000/01/01 ${submittedData.time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          }) : 'Not specified'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Number of Passengers:</span>
                      <span className="font-medium">{submittedData?.passengers}</span>
                    </li>
                    {submittedData?.special_request && (
                      <li className="pt-2 mt-2 border-t">
                        <span className="text-gray-500 block mb-1">Special Requests:</span>
                        <span className="font-medium block bg-white p-2 rounded border text-sm">
                          {submittedData.special_request}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                  <InfoIcon className="w-5 h-5 text-blue-500" />
                  <p>You can track your request using Trip ID: {submittedData?.trip_id}</p>
                </div>
                <Button 
                  onClick={() => {
                    setShowSuccessDialog(false)
                    setSubmittedData(null)
                  }} 
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const popularRoutes = [
  { from: "Main Campus", to: "Kongo Campus", price: 200, premiumAvailable: true },
  { from: "Samaru", to: "Main Campus", price: 100, premiumAvailable: true },
  { from: "Main Campus", to: "Shika", price: 250, premiumAvailable: true },
  { from: "Kongo Campus", to: "Samaru", price: 200, premiumAvailable: false },
  { from: "Main Campus", to: "Teaching Hospital", price: 200, premiumAvailable: true },
  { from: "Samaru", to: "Shika", price: 250, premiumAvailable: false },
]
