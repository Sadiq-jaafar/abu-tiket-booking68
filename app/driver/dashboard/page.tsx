"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Users, QrCode, Calendar, MapPin, Clock, AlertTriangle } from "lucide-react"
import { getDriverShuttlePassengers } from "@/lib/driver-actions"
import { DriverHeader } from "@/components/driver-header"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { SiteFooter } from "@/components/site-footer"

interface Passenger {
  id: string           // From passengers table
  first_name: string
  last_name: string
  id_number: string
  booking_id: string   // Changed from bookingId to match DB
  status: "checked-in" | "pending" | "no-show"
  seat_number?: string // Changed from seatNumber to match DB
}

interface DriverInfo {
  id: string
  name: string
  email: string
  shuttleId: string
  shuttleType: string
  route: string
}

export default function DriverDashboardPage() {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if driver is logged in
    const authData = localStorage.getItem("driverAuth")
    if (!authData) {
      router.push("/driver/login")
      return
    }

    const driver = JSON.parse(authData) as DriverInfo
    setDriverInfo(driver)

    // Fetch passengers for this driver's shuttle
    const fetchPassengers = async () => {
      try {
        setIsLoading(true)
        setError("")

        // First check if we have valid driver info
        if (!driver?.shuttleId) {
          throw new Error("No shuttle ID found for driver")
        }

        const { data: passengers, error } = await supabase
          .from('passengers')
          .select(`
            id,
            first_name,
            last_name,
            id_number,
            booking_id,
            shuttle_id,
            bookings!inner (
              check_in_status
            )
          `)
          .eq('shuttle_id', driver.shuttleId)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        if (!passengers) {
          throw new Error("No passengers found")
        }

        const formattedPassengers: Passenger[] = passengers.map(p => ({
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          id_number: p.id_number,
          booking_id: p.booking_id,
          status: p.bookings?.[0]?.check_in_status || 'pending',
          seat_number: 'Not assigned' // Removed seat_number from query since it doesn't exist
        }))

        setPassengers(formattedPassengers)

      } catch (err) {
        console.error("Error fetching passengers:", err)
        setError(err instanceof Error ? err.message : "Failed to load passenger data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPassengers()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("driverAuth")
    router.push("/driver/login")
  }

  const handleScanTickets = () => {
    router.push("/driver/scanner")
  }

  const handleCheckIn = async (bookingId: string) => {
    try {
      setIsCheckingIn(true)
      
      // First check if booking exists
      const { data: booking, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_id', bookingId)
        .single()

      if (checkError || !booking) {
        throw new Error('Booking not found')
      }

      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ check_in_status: 'checked-in' })
        .eq('booking_id', bookingId)

      if (bookingError) {
        throw new Error(`Failed to update booking: ${bookingError.message}`)
      }

      // Update passenger status - using 'status' instead of 'check_in_status'
      const { error: passengerError } = await supabase
        .from('passengers')
        .update({ check_in_status: 'checked-in' })  // Changed column name to 'status'
        .eq('booking_id', bookingId)

      if (passengerError) {
        throw new Error(`Failed to update passenger: ${passengerError.message}`)
      }

      // Update local state
      setPassengers(prevPassengers =>
        prevPassengers.map(p =>
          p.booking_id === bookingId
            ? { ...p, status: 'checked-in' }
            : p
        )
      )

      toast({
        title: "Success",
        description: "Passenger checked in successfully",
        variant: "default",
      })

    } catch (error) {
      console.error('Error checking in passenger:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check in passenger",
        variant: "destructive",
      })
    } finally {
      setIsCheckingIn(false)
    }
  }

  if (!driverInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <DriverHeader driverName={driverInfo.name} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="grid gap-6">
          {/* Action Buttons */}
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              onClick={handleScanTickets} 
              className="h-20 text-lg bg-[#006400] hover:bg-[#005400]" 
              variant="default"
            >
              <QrCode className="mr-2 h-5 w-5" /> Scan Passenger Tickets
            </Button>
            <Button 
              onClick={() => router.push("/driver/trip-history")} 
              className="h-20 text-lg border-[#006400] text-[#006400] hover:bg-[#e6f2e6]" 
              variant="outline"
            >
              <Calendar className="mr-2 h-5 w-5" /> View Trip History
            </Button>
          </div>

          {/* Passenger List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Passenger List</span>
                <Badge 
                  variant="outline" 
                  className="ml-2 border-[#006400] text-[#006400]"
                >
                  {passengers.length} Passengers
                </Badge>
              </CardTitle>
              <CardDescription>Passengers assigned to your shuttle today</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : passengers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-3 opacity-20" />
                  <p>No passengers assigned to your shuttle yet.</p>
                </div>
              ) : (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4 bg-[#e6f2e6]">
                    <TabsTrigger 
                      value="all"
                      className="data-[state=active]:bg-[#006400] data-[state=active]:text-white"
                    >
                      All Passengers
                    </TabsTrigger>
                    <TabsTrigger 
                      value="checked-in"
                      className="data-[state=active]:bg-[#006400] data-[state=active]:text-white"
                    >
                      Checked In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="pending"
                      className="data-[state=active]:bg-[#006400] data-[state=active]:text-white"
                    >
                      Pending
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {renderPassengerList(passengers, isCheckingIn, handleCheckIn)}
                  </TabsContent>

                  <TabsContent value="checked-in" className="space-y-4">
                    {renderPassengerList(
                      passengers.filter((p) => p.status === "checked-in"), 
                      isCheckingIn, 
                      handleCheckIn
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {renderPassengerList(
                      passengers.filter((p) => p.status === "pending"), 
                      isCheckingIn, 
                      handleCheckIn
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function renderPassengerList(
  passengers: Passenger[], 
  isCheckingIn: boolean, 
  handleCheckIn: (bookingId: string) => Promise<void>
) {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-12 bg-[#e6f2e6] p-3 font-medium">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Name</div>
        <div className="col-span-2">ID Number</div>
        <div className="col-span-2">Booking ID</div>
        <div className="col-span-2">Seat</div>
        <div className="col-span-2">Actions</div>
      </div>
      <div className="divide-y">
        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="grid grid-cols-12 p-3 items-center">
            <div className="col-span-1 font-medium">{index + 1}</div>
            <div className="col-span-3">{`${passenger.first_name} ${passenger.last_name}`}</div>
            <div className="col-span-2 text-sm">{passenger.id_number}</div>
            <div className="col-span-2 text-sm font-mono">{passenger.booking_id}</div>
            <div className="col-span-2">{passenger.seat_number}</div>
            <div className="col-span-2">
              {passenger.status === "checked-in" ? (
                <Badge variant="default" className="bg-[#006400]">
                  Checked In
                </Badge>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => handleCheckIn(passenger.booking_id)}
                  disabled={isCheckingIn}
                  className="bg-[#006400] hover:bg-[#005400] text-white"
                >
                  Check In
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}
