"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  CreditCard,
  Settings,
  Users,
  LogOut,
  Bus,
  Ticket,
  ScanLine,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminHeader } from "@/components/admin-header"
import { getBookings } from "@/lib/actions"
import type { Booking } from "@/lib/definitions"
import { SiteFooter } from "@/components/site-footer"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [router])

  // Calculate statistics
  const totalBookings = bookings.length
  const upcomingBookings = bookings.filter((booking) => booking.status === "upcoming").length
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length
  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled").length
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_amount, 0)
  const premiumBookings = bookings.filter((booking) => booking.is_premium).length

  return (
    <div className="m-0 p-0">
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-[#006400] text-white">
        <div className="p-4 border-b border-green-700">
          <h2 className="text-xl font-bold">ABU Tiket Admin</h2>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="space-y-1 px-2">
            <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-white bg-green-700 rounded-md">
              <BarChart3 className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/bookings"
              className="flex items-center px-4 py-3 text-white hover:bg-green-700 rounded-md"
            >
              <Ticket className="mr-3 h-5 w-5" />
              Bookings
            </Link>
            <Link
              href="/admin/shuttles"
              className="flex items-center px-4 py-3 text-white hover:bg-green-700 rounded-md"
            >
              <Bus className="mr-3 h-5 w-5" />
              Shuttles
            </Link>
            <Link
              href="/admin/scanner"
              className="flex items-center px-4 py-3 text-white hover:bg-green-700 rounded-md"
            >
              <ScanLine className="mr-3 h-5 w-5" />
              Ticket Scanner
            </Link>
            <Link href="/admin/users" className="flex items-center px-4 py-3 text-white hover:bg-green-700 rounded-md">
              <Users className="mr-3 h-5 w-5" />
              Users
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center px-4 py-3 text-white hover:bg-green-700 rounded-md"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-green-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-green-700"
            onClick={() => {
              localStorage.removeItem("adminAuthenticated")
              router.push("/admin/login")
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Dashboard" />

        <main className="flex-1 overflow-auto p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Ticket className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : totalBookings}</div>
                <p className="text-xs text-gray-500">
                  {isLoading ? "" : `${upcomingBookings} upcoming, ${completedBookings} completed`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : `₦${totalRevenue.toLocaleString()}`}</div>
                <p className="text-xs text-gray-500">{isLoading ? "" : `${premiumBookings} premium bookings`}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : upcomingBookings}</div>
                <p className="text-xs text-gray-500">{isLoading ? "" : `Next 7 days: ${upcomingBookings}`}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Cancellations</CardTitle>
                <AlertCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "..." : cancelledBookings}</div>
                <p className="text-xs text-gray-500">
                  {isLoading ? "" : `${((cancelledBookings / totalBookings) * 100).toFixed(1)}% cancellation rate`}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="recent">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="recent">Recent Bookings</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                </TabsList>
                <Button asChild>
                  <Link href="/admin/bookings">View All Bookings</Link>
                </Button>
              </div>
              <TabsContent value="recent" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest bookings across the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-4">No bookings found</div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-6 text-xs font-medium text-gray-500">
                          <div>Booking ID</div>
                          <div>Passenger</div>
                          <div>Route</div>
                          <div>Date</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                        <div className="space-y-2">
                          {bookings.slice(0, 5).map((booking) => (
                            <div key={booking.booking_id} className="grid grid-cols-6 text-sm py-2 border-b">
                              <div className="font-medium">{booking.booking_id}</div>
                              <div>{booking.passengers?.[0]?.first_name + ' ' + booking.passengers?.[0]?.last_name || 'N/A'}</div>
                              <div className="truncate">
                                {booking.pickup_address} → {booking.dropoff_address}
                              </div>
                              <div>{new Date(booking.departure_date).toLocaleDateString()}</div>
                              <div>₦{booking.total_amount}</div>
                              <div>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    booking.status === "upcoming"
                                      ? "bg-blue-100 text-blue-800"
                                      : booking.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <CardDescription>Bookings scheduled for future dates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Loading bookings...</div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-6 text-xs font-medium text-gray-500">
                          <div>Booking ID</div>
                          <div>Passenger</div>
                          <div>Route</div>
                          <div>Date</div>
                          <div>Amount</div>
                          <div>Actions</div>
                        </div>
                        <div className="space-y-2">
                          {bookings
                            .filter((booking) => booking.status === "upcoming")
                            .slice(0, 5)
                            .map((booking) => (
                              <div key={booking.booking_id} className="grid grid-cols-6 text-sm py-2 border-b">
                                <div className="font-medium">{booking.booking_id}</div>
                                <div>{booking.passengers?.[0]?.first_name + ' ' + booking.passengers?.[0]?.last_name || 'N/A'}</div>
                                <div className="truncate">
                                  {booking.pickup_address} → {booking.dropoff_address}
                                </div>
                                <div>{new Date(booking.departure_date).toLocaleDateString()}</div>
                                <div>₦{booking.total_amount}</div>
                                <div>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="premium" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Premium Bookings</CardTitle>
                    <CardDescription>Premium service bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Loading bookings...</div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-6 text-xs font-medium text-gray-500">
                          <div>Booking ID</div>
                          <div>Passenger</div>
                          <div>Pickup</div>
                          <div>Date</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                        <div className="space-y-2">
                          {bookings
                            .filter((booking) => booking.is_premium)
                            .slice(0, 5)
                            .map((booking) => (
                              <div key={booking.booking_id} className="grid grid-cols-6 text-sm py-2 border-b">
                                <div className="font-medium">{booking.booking_id}</div>
                                <div>{booking.passengers?.[0]?.first_name + ' ' + booking.passengers?.[0]?.last_name || 'N/A'}</div>
                                <div className="truncate">{booking.pickup_address || "N/A"}</div>
                                <div>{new Date(booking.departure_date).toLocaleDateString()}</div>
                                <div>₦{booking.total_amount}</div>
                                <div>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      booking.status === "upcoming"
                                        ? "bg-blue-100 text-blue-800"
                                        : booking.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 grid-cols-2">
                <Button asChild variant="outline" className="h-20 flex flex-col justify-center">
                  <Link href="/admin/scanner">
                    <ScanLine className="h-5 w-5 mb-1" />
                    <span>Scan Ticket</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex flex-col justify-center">
                  <Link href="/admin/shuttles/new">
                    <Bus className="h-5 w-5 mb-1" />
                    <span>Add Shuttle</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex flex-col justify-center">
                  <Link href="/admin/bookings">
                    <Ticket className="h-5 w-5 mb-1" />
                    <span>Manage Bookings</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex flex-col justify-center">
                  <Link href="/admin/settings">
                    <Settings className="h-5 w-5 mb-1" />
                    <span>Settings</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Booking System</span>
                    </div>
                    <span className="text-sm text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Payment Processing</span>
                    </div>
                    <span className="text-sm text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Shuttle Tracking</span>
                    </div>
                    <span className="text-sm text-green-500">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">QR Code Verification</span>
                    </div>
                    <span className="text-sm text-green-500">Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
    </div>
    <div className="m-0 p-0">
    <SiteFooter/>
    </div>
    
    </div>
    
  )
}
