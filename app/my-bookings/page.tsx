"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarIcon, ClockIcon, MapPinIcon, SearchIcon, FilterIcon, ChevronRightIcon } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { getBookings, updateBookingStatus } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
import { SpecialTrips } from "@/lib/definitions"
import { SiteFooter } from "@/components/site-footer"

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")

  // User authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userType, setUserType] = useState<"student" | "staff" | "admin" | "driver" | undefined>("student")
  const [userName, setUserName] = useState("")
  const [userInitials, setUserInitials] = useState("")

  // New states for cancellation
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  // Add states for special trips
  const [specialTrips, setSpecialTrips] = useState<SpecialTrips[]>([])
  const [isLoadingSpecialTrips, setIsLoadingSpecialTrips] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
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

      // Fetch both regular bookings and special trips
      fetchBookings(storedUserId)
      fetchSpecialTrips(storedUserId)
    } else {
      // Redirect to login if not logged in
      router.push("/login?redirect=/my-bookings")
    }
  }, [router])

  const fetchBookings = async (userId: string) => {
    setIsLoading(true)
    try {
      const bookingsData = await getBookings(userId)
      setBookings(bookingsData)
      filterBookings(bookingsData, activeTab)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      // Use sample data as fallback
      setBookings(sampleBookings)
      filterBookings(sampleBookings, activeTab)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSpecialTrips = async (userId: string) => {
    setIsLoadingSpecialTrips(true)
    try {
      const { data, error } = await supabase
        .from('special_trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSpecialTrips(data || [])
    } catch (error) {
      console.error('Error fetching special trips:', error)
      toast({
        title: "Error",
        description: "Failed to load special trips",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSpecialTrips(false)
    }
  }

  const filterBookings = (bookingsData: any[], tab: string) => {
    let filtered = [...bookingsData]

    // Filter by tab
    if (tab === "upcoming") {
      filtered = filtered.filter((booking) => 
        booking.status === "upcoming" && booking.check_in_status !== "checked-in"
      )
    } else if (tab === "completed") {
      filtered = filtered.filter((booking) => 
        booking.status === "completed" || booking.check_in_status === "checked-in"
      )
    } else if (tab === "cancelled") {
      filtered = filtered.filter((booking) => booking.status === "cancelled")
    }

    // Apply search term if any
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.booking_id?.toLowerCase().includes(term) ||
          booking.shuttle?.type?.toLowerCase().includes(term) ||
          booking.route?.origin?.toLowerCase().includes(term) ||
          booking.route?.destination?.toLowerCase().includes(term),
      )
    }

    setFilteredBookings(filtered)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    filterBookings(bookings, tab)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    filterBookings(bookings, activeTab)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  const getStatusColor = (status: string, checkInStatus?: string) => {
    if (status === "cancelled") return "bg-red-500"
    if (checkInStatus === "checked-in" || status === "completed") return "bg-green-500"
    if (status === "upcoming") return "bg-blue-500"
    return "bg-gray-500"
  }

  const handleCancelBooking = async (booking: any) => {
    try {
      setIsSubmitting(true)

      const { data, error, refund_id } = await updateBookingStatus(booking.booking_id, "cancelled")

      if (error) {
        throw new Error(error)
      }

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.booking_id === booking.booking_id
            ? { ...b, status: "cancelled", refund_id, refund_status: "NOT REFUNDED" }
            : b,
        ),
      )

      // Update filtered bookings
      filterBookings(bookings, activeTab)

      toast({
        title: "Booking Cancelled",
        description: `Your booking has been cancelled. Refund ID: ${refund_id}`,
      })
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setSelectedBooking(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />

      <main className="container px-4 py-8 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#006400]">My Bookings</h1>
              <p className="text-gray-500">View and manage your bookings</p>
            </div>
            <Button asChild className="mt-4 md:mt-0 bg-[#006400] hover:bg-[#005000]">
              <Link href="/search-results">Book New Shuttle</Link>
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input placeholder="Search bookings..." className="pl-10" value={searchTerm} onChange={handleSearch} />
              </div>
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Filter:</span>
                <select className="p-2 border rounded-md text-sm">
                  <option value="all">All Time</option>
                  <option value="month">This Month</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>
          </div>

          <Tabs defaultValue="upcoming" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="special">Special Trips</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No upcoming bookings</h3>
                    <p className="text-gray-500 text-center mt-2">
                      You don't have any upcoming bookings. Book a shuttle to get started.
                    </p>
                    <Button asChild className="mt-4 bg-[#006400] hover:bg-[#005000]">
                      <Link href="/search-results">Book Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
                  <Card key={booking.booking_id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#006400]">
                              {booking.route?.origin || "Main Campus"} to {booking.route?.destination || "Kongo Campus"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {booking.shuttle?.type || "Campus Bus"} • Booking ID: {booking.booking_id}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status, booking.check_in_status)}>
                            {booking.check_in_status === "checked-in" ? "COMPLETED" : 
                              booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-start gap-2">
                            <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Date</p>
                              <p className="text-sm text-gray-500">{formatDate(booking.departure_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Time</p>
                              <p className="text-sm text-gray-500">
                                {booking.departure_time} - {booking.arrival_time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Boarding Point</p>
                              <p className="text-sm text-gray-500">{booking.route?.origin || "Main Campus Terminal"}</p>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">Total Amount</p>
                            <p className="text-lg font-semibold text-[#006400]">₦{booking.total_amount || 380}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              asChild
                              className="gap-2 bg-[#006400] hover:bg-[#005000]"
                            >
                              <Link href={`/booking/${booking.booking_id}`}>
                                View Ticket <ChevronRightIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="gap-2 text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Cancel Booking
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this booking? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleCancelBooking(booking)}
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? "Cancelling..." : "Yes, Cancel Booking"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <ClockIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No completed bookings</h3>
                    <p className="text-gray-500 text-center mt-2">You don't have any completed bookings yet.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
                  <Card key={booking.booking_id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#006400]">
                              {booking.route?.origin || "Main Campus"} to {booking.route?.destination || "Kongo Campus"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {booking.shuttle?.type || "Campus Bus"} • Booking ID: {booking.booking_id}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status, booking.check_in_status)}>
                            {booking.check_in_status === "checked-in" ? "COMPLETED" : 
                              booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-start gap-2">
                            <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Date</p>
                              <p className="text-sm text-gray-500">{formatDate(booking.departure_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Time</p>
                              <p className="text-sm text-gray-500">
                                {booking.departure_time} - {booking.arrival_time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Boarding Point</p>
                              <p className="text-sm text-gray-500">{booking.route?.origin || "Main Campus Terminal"}</p>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">Total Amount</p>
                            <p className="text-lg font-semibold text-[#006400]">₦{booking.total_amount || 380}</p>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            className="gap-2 text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
                          >
                            <Link href={`/booking/${booking.booking_id}`}>
                              View Details <ChevronRightIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Card className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <ClockIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No cancelled bookings</h3>
                    <p className="text-gray-500 text-center mt-2">You don't have any cancelled bookings.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
                  <Card key={booking.booking_id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#006400]">
                            {booking.route?.origin || "Main Campus"} to {booking.route?.destination || "Kongo Campus"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {booking.shuttle?.type || "Campus Bus"} • Booking ID: {booking.booking_id}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status, booking.check_in_status)}>
                          {booking.check_in_status === "checked-in" ? "COMPLETED" : 
                            booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Date</p>
                            <p className="text-sm text-gray-500">{formatDate(booking.departure_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Time</p>
                            <p className="text-sm text-gray-500">
                              {booking.departure_time} - {booking.arrival_time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Boarding Point</p>
                            <p className="text-sm text-gray-500">{booking.route?.origin || "Main Campus Terminal"}</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Cancellation Date</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(booking.updated_at || booking.booking_date)}
                            </p>
                          </div>
                          {booking.refund_id && (
                            <div>
                              <p className="text-sm font-medium">Refund ID</p>
                              <p className="text-sm font-mono text-gray-500">{booking.refund_id}</p>
                            </div>
                          )}
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          className="gap-2 text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
                        >
                          <Link href="/search-results">
                            Book Again <ChevronRightIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      {/* New refund details section */}
                      {booking.status === 'cancelled' && (
                        <div className="md:col-span-3 border-t pt-4 mt-2">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Refund Status</p>
                                <Badge 
                                  variant={booking.refund_status === 'REFUNDED' ? 'default' : 'secondary'}
                                  className={
                                    booking.refund_status === 'REFUNDED' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }
                                >
                                  {booking.refund_status}
                                </Badge>
                              </div>
                              {booking.refund_id && (
                                <div className="text-right">
                                  <p className="text-sm font-medium">Refund ID</p>
                                  <p className="text-sm font-mono text-gray-500">{booking.refund_id}</p>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.refund_status === 'REFUNDED' 
                                ? 'Your refund has been processed.'
                                : 'Your refund is being processed. Please allow 3-5 business days.'}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="special" className="space-y-4">
              {isLoadingSpecialTrips ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : specialTrips.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <MapPinIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No special trips</h3>
                    <p className="text-gray-500 text-center mt-2">
                      You haven't requested any special trips yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                specialTrips.map((trip) => (
                  <Card key={trip.trip_id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#006400]">
                            {trip.trip.charAt(0).toUpperCase() + trip.trip.slice(1)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Trip ID: {trip.trip_id}
                          </p>
                        </div>
                        <Badge
                          variant={
                            trip.status === "approved" ? "default" :
                            trip.status === "rejected" ? "destructive" :
                            "secondary"
                          }
                          className={
                            trip.status === "approved" ? "bg-green-100 text-green-800" :
                            trip.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {trip.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Destination</p>
                            <p className="text-sm text-gray-500">{trip.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Departure Date</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(trip.departure_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Time</p>
                            <p className="text-sm text-gray-500">{trip.time}</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">Number of Passengers</p>
                          <p className="text-lg font-semibold">{trip.passengers}</p>
                        </div>
                        {trip.special_request && (
                          <div className="w-full mt-2">
                            <p className="text-sm font-medium">Special Request</p>
                            <p className="text-sm text-gray-500 mt-1">{trip.special_request}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter/>
    </div>
  )
}

// Sample bookings data for fallback
const sampleBookings = [
  {
    booking_id: "ABU-12345678",
    user_id: "user-123",
    shuttle_id: "SH-1001",
    route_id: 1,
    departure_date: "2025-04-20",
    departure_time: "07:30",
    arrival_time: "08:15",
    booking_date: "2025-04-15T10:30:00Z",
    status: "upcoming",
    total_amount: 380,
    shuttle: {
      shuttle_id: "SH-1001",
      type: "Campus Bus",
      capacity: 15,
      facilities: JSON.stringify(["WiFi", "Air Conditioning"]),
    },
    route: {
      id: 1,
      origin: "Main Campus Terminal",
      destination: "Kongo Campus Terminal",
      price: 150,
    },
    passengers: [
      { first_name: "John", last_name: "Doe", id_type: "student_id", id_number: "ABU/2023/12345" },
      { first_name: "Jane", last_name: "Doe", id_type: "student_id", id_number: "ABU/2023/67890" },
    ],
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+234 812 3456 7890",
    },
  },
  {
    booking_id: "ABU-87654321",
    user_id: "user-123",
    shuttle_id: "SH-1002",
    route_id: 2,
    departure_date: "2025-04-22",
    departure_time: "14:00",
    arrival_time: "15:00",
    booking_date: "2025-04-16T09:15:00Z",
    status: "upcoming",
    total_amount: 420,
    shuttle: {
      shuttle_id: "SH-1002",
      type: "Express Shuttle",
      capacity: 12,
      facilities: JSON.stringify(["WiFi", "Air Conditioning", "USB Charging"]),
    },
    route: {
      id: 2,
      origin: "Kongo Campus Terminal",
      destination: "Main Campus Terminal",
      price: 180,
    },
    passengers: [
      { first_name: "John", last_name: "Doe", id_type: "student_id", id_number: "ABU/2023/12345" },
      { first_name: "Jane", last_name: "Doe", id_type: "student_id", id_number: "ABU/2023/67890" },
    ],
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+234 812 3456 7890",
    },
  },
  {
    booking_id: "ABU-24681357",
    user_id: "user-123",
    shuttle_id: "SH-1003",
    route_id: 3,
    departure_date: "2025-03-15",
    departure_time: "09:00",
    arrival_time: "10:30",
    booking_date: "2025-03-10T11:20:00Z",
    status: "completed",
    total_amount: 350,
    shuttle: {
      shuttle_id: "SH-1003",
      type: "Standard Shuttle",
      capacity: 18,
      facilities: JSON.stringify(["WiFi", "Air Conditioning"]),
    },
    route: {
      id: 3,
      origin: "Main Campus Terminal",
      destination: "Faculty of Engineering",
      price: 120,
    },
    passengers: [
      { first_name: "John", last_name: "Doe", id_type: "student_id", id_number: "ABU/2023/12345" },
      { first_name: "Jane", last_name: "Doe", id_type: "student_id", id_number: "ABU/2023/67890" },
      { first_name: "Bob", last_name: "Smith", id_type: "student_id", id_number: "ABU/2023/54321" },
    ],
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+234 812 3456 7890",
    },
  },
  {
    booking_id: "ABU-13579246",
    user_id: "user-123",
    shuttle_id: "SH-1004",
    route_id: 4,
    departure_date: "2025-03-05",
    departure_time: "16:30",
    arrival_time: "17:15",
    booking_date: "2025-03-01T14:45:00Z",
    status: "cancelled",
    refund_id: "RF-123456-7890",
    total_amount: 280,
    shuttle: {
      shuttle_id: "SH-1004",
      type: "Campus Bus",
      capacity: 15,
      facilities: JSON.stringify(["WiFi", "Air Conditioning"]),
    },
    route: {
      id: 4,
      origin: "Faculty of Science",
      destination: "Main Campus Terminal",
      price: 130,
    },
    passengers: [
      { first_name: "John", last_name: "Doe", id_type: "student_id", id_number: "ABU/2023/12345" },
      { first_name: "Jane", last_name: "Doe", id_type: "student_id", id_number: "ABU/2023/67890" },
    ],
    contactInfo: {
      email: "john.doe@example.com",
      phone: "+234 812 3456 7890",
    },
  },
]
