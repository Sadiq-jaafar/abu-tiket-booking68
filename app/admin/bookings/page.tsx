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
import { getBookings } from "@/lib/actions"
import type { Booking } from "@/lib/definitions"
import { Badge } from "@/components/ui/badge"

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

    fetchBookings()
  }, [router])

  // Apply filters
  useEffect(() => {
    let result = [...bookings]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (booking) =>
          booking.bookingId.toLowerCase().includes(term) ||
          booking.passengers.some((p) => p.name.toLowerCase().includes(term)) ||
          booking.departureLocation.toLowerCase().includes(term) ||
          booking.arrivalLocation.toLowerCase().includes(term),
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
        const bookingDate = new Date(booking.departureDate)
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
  const handleCancelBooking = () => {
    if (!selectedBooking) return

    // In a real app, this would make an API call to cancel the booking
    const updatedBookings = bookings.map((booking) =>
      booking.bookingId === selectedBooking.bookingId ? { ...booking, status: "cancelled" } : booking,
    )

    setBookings(updatedBookings)
    setShowCancelDialog(false)
    setSelectedBooking(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="Bookings Management" />

        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>View and manage all bookings in the system</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
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
                          <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBookings.map((booking) => (
                          <tr key={booking.bookingId} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{booking.bookingId}</td>
                            <td className="py-3 px-4">
                              <div>
                                <div>{booking.passengers[0].name}</div>
                                <div className="text-xs text-gray-500">
                                  {booking.passengers.length > 1 ? `+${booking.passengers.length - 1} more` : ""}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="max-w-[200px] truncate">
                                {booking.departureLocation} → {booking.arrivalLocation}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div>{new Date(booking.departureDate).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">{booking.departureTime}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div>₦{booking.totalAmount}</div>
                                {booking.isPremium && <Badge className="mt-1 bg-amber-500">Premium</Badge>}
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
            </CardContent>
          </Card>
        </main>

        {/* Cancel Booking Dialog */}
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
                    <span>{selectedBooking.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Passenger:</span>
                    <span>{selectedBooking.passengers[0].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(selectedBooking.departureDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span>₦{selectedBooking.totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Keep Booking
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking}>
                Cancel Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
