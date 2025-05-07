"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarIcon, MapPinIcon, SearchIcon, UsersIcon, ClockIcon, StarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteHeader } from "@/components/site-header"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { getRoutes } from "@/lib/actions"

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

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />

      <main className="container px-4 py-8 mx-auto">
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
                  <TabsTrigger value="special">Special Trips</TabsTrigger>
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
                <TabsContent value="special" className="mt-0">
                  <form className="space-y-6" onSubmit={(e) => handleSubmit(e, "special")}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="special-from">From</Label>
                        <div className="relative">
                          <MapPinIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                          <Input
                            id="special-from"
                            name="from"
                            placeholder="Pickup location"
                            className="pl-10"
                            value={formData.from}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="special-to">To</Label>
                        <div className="relative">
                          <MapPinIcon className="absolute w-4 h-4 text-gray-500 left-3 top-3" />
                          <Input
                            id="special-to"
                            name="to"
                            placeholder="Destination"
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
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="anytime">Any time (24/7)</SelectItem>
                            <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                            <SelectItem value="evening">Evening (5PM - 10PM)</SelectItem>
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
                            <SelectItem value="5+">5+ Passengers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special-requests">Special Requirements</Label>
                      <Input
                        id="special-requests"
                        name="specialRequests"
                        placeholder="Describe your special trip requirements"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Button
                      type="submit"
                      className={`w-full ${
                        isPremium ? "bg-amber-600 hover:bg-amber-700" : "bg-[#006400] hover:bg-[#005000]"
                      }`}
                    >
                      <SearchIcon className="w-4 h-4 mr-2" />
                      Request {isPremium ? "Premium" : ""} Special Trip
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Popular Routes section */}
        <section className="max-w-4xl mx-auto mb-12">
          <h3 className="mb-6 text-xl font-semibold text-[#006400]">Popular Routes</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingRoutes
              ? // Loading state
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="overflow-hidden border-[#006400] border-l-2">
                      <CardHeader className="p-0">
                        <div className="h-40 bg-gray-200 animate-pulse"></div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <div className="h-9 bg-gray-200 rounded animate-pulse w-full"></div>
                      </CardFooter>
                    </Card>
                  ))
              : // Display routes from database or fallback to popular routes
                (availableRoutes.length > 0 ? availableRoutes : popularRoutes).map((route, index) => (
                  <Card key={index} className="overflow-hidden border-[#006400] border-l-2">
                    <CardHeader className="p-0">
                      <div className="h-40 bg-gray-200">
                        <img
                          src={`/placeholder.svg?height=160&width=320&text=${route.from || route.origin}-${route.to || route.destination}`}
                          alt={`${route.from || route.origin} to ${route.to || route.destination}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg">
                        {route.from || route.origin} to {route.to || route.destination}
                      </CardTitle>
                      <CardDescription>₦{route.price} per person</CardDescription>
                      {route.premium_available && (
                        <Badge className="mt-2 bg-amber-500">
                          <StarIcon className="w-3 h-3 mr-1" /> Premium Available
                        </Badge>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        variant="outline"
                        className="w-full border-[#006400] text-[#006400] hover:bg-[#e6f2e6]"
                        onClick={() => {
                          // Pre-fill search form with this route
                          setFormData((prev) => ({
                            ...prev,
                            from: route.from || route.origin || "",
                            to: route.to || route.destination || "",
                            fromCampus: route.from || route.origin || "",
                            toCampus: route.to || route.destination || "",
                          }))

                          // Scroll to search form
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }}
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

      <footer className="py-8 mt-12 bg-[#006400] text-white">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">ABU Tiket</h4>
              <p className="text-sm text-green-200">
                Ahmadu Bello University's official transportation booking platform.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">University</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    About ABU
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Campus Map
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Faculties
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Student Guidelines
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 text-sm text-center text-green-200 border-t border-green-700">
            © {new Date().getFullYear()} Ahmadu Bello University, Zaria. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

const popularRoutes = [
  { from: "Main Campus", to: "Kongo Campus", price: 150, premiumAvailable: true },
  { from: "Samaru", to: "Main Campus", price: 100, premiumAvailable: true },
  { from: "Main Campus", to: "Shika", price: 200, premiumAvailable: true },
  { from: "Kongo Campus", to: "Samaru", price: 150, premiumAvailable: false },
  { from: "Main Campus", to: "Teaching Hospital", price: 250, premiumAvailable: true },
  { from: "Samaru", to: "Shika", price: 200, premiumAvailable: false },
]
