"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { getBookings, updateBookingStatus, updateRefundStatus } from "@/lib/actions"
import type { Booking, SpecialTrips } from "@/lib/definitions"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteFooter } from "@/components/site-footer"

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  const [specialTrips, setSpecialTrips] = useState<SpecialTrips[]>([])
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }

    // Fetch bookings
    const fetchBookings = async () => {
      try {
        const data = await getBookings()
        setBookings(data)
        setFilteredBookings(data)
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch special trips
    const fetchSpecialTrips = async () => {
      try {
        const { data, error } = await supabase
          .from('special_trips')
          .select('*')
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
      }
    }

    fetchBookings()
    fetchSpecialTrips()
  }, [router])

  // Apply filters
  useEffect(() => {
    let result = [...bookings]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (booking) =>
          booking.booking_id.toLowerCase().includes(term) ||
          booking.passengers?.some((p) => (p.first_name+" "+p.last_name).toLowerCase().includes(term)) ||
          booking.pickup_address.toLowerCase().includes(term) ||
          booking.dropoff_address.toLowerCase().includes(term),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextMonth = new Date(today)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      result = result.filter((booking) => {
        const bookingDate = new Date(booking.departure_date)
        switch (dateFilter) {
          case "today":
            return (
              bookingDate.getDate() === today.getDate() &&
              bookingDate.getMonth() === today.getMonth() &&
              bookingDate.getFullYear() === today.getFullYear()
            )
          case "tomorrow":
            return (
              bookingDate.getDate() === tomorrow.getDate() &&
              bookingDate.getMonth() === tomorrow.getMonth() &&
              bookingDate.getFullYear() === tomorrow.getFullYear()
            )
          case "week":
            return bookingDate <= nextWeek && bookingDate >= today
          case "month":
            return bookingDate <= nextMonth && bookingDate >= today
          default:
            return true
        }
      })
    }

    setFilteredBookings(result)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter, bookings])

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    try {
      setIsLoading(true)
      
      const { data, error, refund_id } = await updateBookingStatus(selectedBooking.booking_id, 'cancelled')
      
      if (error) {
        throw new Error(error)
      }

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.booking_id === selectedBooking.booking_id
            ? { ...booking, status: 'cancelled', refund_id }
            : booking
        )
      )

      toast({
        title: "Booking Cancelled",
        description: `Booking cancelled successfully. Refund ID: ${refund_id}`,
      })

      setShowCancelDialog(false)
      setSelectedBooking(null)

    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle refund
  const handleRefund = async (bookingId: string) => {
    try {
      setIsRefunding(true)
      
      const { error } = await updateRefundStatus(bookingId, 'REFUNDED')
      
      if (error) {
        throw new Error(error)
      }

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.booking_id === bookingId
            ? { ...booking, refund_status: 'REFUNDED' }
            : booking
        )
      )

      toast({
        title: "Refund Processed",
        description: "The booking has been marked as refunded.",
      })

    } catch (error) {
      console.error("Error processing refund:", error)
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefunding(false)
    }
  }

  // Refresh bookings when cancel dialog is closed
  useEffect(() => {
    const refreshBookings = async () => {
      try {
        const data = await getBookings()
        setBookings(data)
        setFilteredBookings(data)
      } catch (error) {
        console.error("Error refreshing bookings:", error)
      }
    }

    if (showCancelDialog === false) {
      refreshBookings()
    }
  }, [showCancelDialog])

  // Handle status update for special trips
  const handleStatusUpdate = async (tripId: string, newStatus: "approved" | "rejected") => {
    try {
      setIsUpdatingStatus(true)
      const { error } = await supabase
        .from('special_trips')
        .update({ status: newStatus })
        .eq('trip_id', tripId)

      if (error) throw error

      // Update local state
      setSpecialTrips(prev =>
        prev.map(trip =>
          trip.trip_id === tripId
            ? { ...trip, status: newStatus }
            : trip
        )
      )

      toast({
        title: "Success",
        description: `Trip request ${newStatus}`,
      })

    } catch (error) {
      console.error('Error updating trip status:', error)
      toast({
        title: "Error",
        description: `Failed to ${newStatus} trip`,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Update the main layout structure
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col m-0 p-0 gap-0">
      <div className="flex flex-1">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Bookings Management" />
          
          <main className="flex-1 p-6 overflow-auto">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Bookings Management</CardTitle>
                    <CardDescription>View and manage all bookings and special trips</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="bookings" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="bookings">Regular Bookings</TabsTrigger>
                    <TabsTrigger value="special-trips">Special Trips</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bookings" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 justify-between">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search bookings..."
                          className="pl-8 w-full sm:w-[250px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[130px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <span>Status</span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger className="w-[130px]">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Date</span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Dates</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="week">Next 7 Days</SelectItem>
                            <SelectItem value="month">Next 30 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="text-center py-8">Loading bookings...</div>
                    ) : filteredBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <h3 className="text-lg font-medium">No bookings found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search term</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium text-sm">
                                  <div className="flex items-center">
                                    Booking ID
                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                  </div>
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-sm">Passenger</th>
                                <th className="text-left py-3 px-4 font-medium text-sm">Route</th>
                                <th className="text-left py-3 px-4 font-medium text-sm">
                                  <div className="flex items-center">
                                    Date
                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                  </div>
                                </th>
                                <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                                <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-sm">Refund Status</th>
                                <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedBookings.map((booking) => (
                                <tr key={booking.booking_id} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-4 font-medium">{booking.booking_id}</td>
                                  <td className="py-3 px-4">
                                    <div>
                                      <div>{booking.passengers?.[0]?.first_name + ' ' + booking.passengers?.[0]?.last_name || 'N/A'} </div>
                                      <div className="text-xs text-gray-500">
                                        {booking.passengers && booking.passengers.length > 1 ? `+${booking.passengers.length - 1} more` : ""}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="max-w-[200px] truncate">
                                      {booking.pickup_address} → {booking.dropoff_address}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div>
                                      <div>{new Date(booking.departure_date).toLocaleDateString()}</div>
                                      <div className="text-xs text-gray-500">{booking.departure_time}</div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div>
                                      <div>₦{booking.total_amount}</div>
                                      {booking.is_premium && <Badge className="mt-1 bg-amber-500">Premium</Badge>}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge
                                      className={
                                        booking.status === "upcoming"
                                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                          : booking.status === "completed"
                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                            : "bg-red-100 text-red-800 hover:bg-red-100"
                                      }
                                    >
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4">
                                    {booking.status === 'cancelled' && (
                                      <div className="flex flex-col gap-2">
                                        <Badge
                                          variant={booking.refund_status === 'REFUNDED' ? 'default' : 'secondary'}
                                          className={
                                            booking.refund_status === 'REFUNDED' 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-yellow-100 text-yellow-800'
                                          }
                                        >
                                          {booking.refund_status || 'NOT REFUNDED'}
                                        </Badge>
                                        {booking.refund_status !== 'REFUNDED' && (
                                          <Button
                                            size="sm"
                                            onClick={() => handleRefund(booking.booking_id)}
                                            disabled={isRefunding}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            {isRefunding ? "Processing..." : "Process Refund"}
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => {
                                          setSelectedBooking(booking)
                                          // In a real app, this would navigate to a booking details page
                                          // For now, we'll just log the booking
                                          console.log("View booking:", booking)
                                        }}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      {booking.status === "upcoming" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                          onClick={() => {
                                            setSelectedBooking(booking)
                                            setShowCancelDialog(true)
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-500">
                              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                              {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}{" "}
                              bookings
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(
                                  (page) =>
                                    page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1),
                                )
                                .map((page, i, array) => (
                                  <React.Fragment key={page}>
                                    {i > 0 && array[i - 1] !== page - 1 && <span className="text-gray-400">...</span>}
                                    <Button
                                      variant={currentPage === page ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setCurrentPage(page)}
                                    >
                                      {page}
                                    </Button>
                                  </React.Fragment>
                                ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="special-trips" className="space-y-4">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                        <div className="col-span-2">Trip ID</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Destination</div>
                        <div className="col-span-2">Date & Time</div>
                        <div className="col-span-1">Passengers</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2">Actions</div>
                      </div>
                      <div className="divide-y">
                        {specialTrips.map((trip) => (
                          <div key={trip.trip_id} className="grid grid-cols-12 p-4 items-center">
                            <div className="col-span-2 font-mono text-sm">{trip.trip_id}</div>
                            <div className="col-span-2 capitalize">{trip.trip}</div>
                            <div className="col-span-2">{trip.destination}</div>
                            <div className="col-span-2">
                              {new Date(trip.departure_date).toLocaleDateString()}{' '}
                              {trip.time}
                            </div>
                            <div className="col-span-1">{trip.passengers}</div>
                            <div className="col-span-1">
                              <Badge
                                variant={
                                  trip.status === "approved" ? "default" :
                                  trip.status === "rejected" ? "destructive" :
                                  "secondary"
                                }
                              >
                                {trip.status}
                              </Badge>
                            </div>
                            <div className="col-span-2 flex gap-2">
                              {trip.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleStatusUpdate(trip.trip_id, "approved")}
                                    disabled={isUpdatingStatus}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate(trip.trip_id, "rejected")}
                                    disabled={isUpdatingStatus}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        {specialTrips.length === 0 && (
                          <div className="p-4 text-center text-muted-foreground">
                            No special trip requests found
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Footer positioned after sidebar and main content */}
      <div className="mt-auto">
        <SiteFooter />
      </div>

      {/* Keep dialogs at root level */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Booking ID:</span>
                  <span>{selectedBooking.booking_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Passenger:</span>
                  <span>{selectedBooking.passengers?.[0]?.first_name + " " + selectedBooking.passengers?.[0]?.last_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{new Date(selectedBooking.departure_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>₦{selectedBooking.total_amount}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
