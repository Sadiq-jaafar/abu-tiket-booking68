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

interface Passenger {
  id: string
  name: string
  idNumber: string
  bookingId: string
  status: "checked-in" | "pending" | "no-show"
  seatNumber: string
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
        const data = await getDriverShuttlePassengers(driver.shuttleId)
        setPassengers(data)
      } catch (err) {
        console.error("Error fetching passengers:", err)
        setError("Failed to load passenger data. Please try again.")
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

  if (!driverInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverHeader driverName={driverInfo.name} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          {/* Driver Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Shuttle Information</CardTitle>
              <CardDescription>Your assigned shuttle and route details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Today's Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString("en-NG", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Route</p>
                    <p className="text-sm text-muted-foreground">{driverInfo.route}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Shuttle ID</p>
                    <p className="text-sm text-muted-foreground">
                      {driverInfo.shuttleId} ({driverInfo.shuttleType})
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-4 md:grid-cols-2">
            <Button onClick={handleScanTickets} className="h-20 text-lg" variant="default">
              <QrCode className="mr-2 h-5 w-5" /> Scan Passenger Tickets
            </Button>
            <Button onClick={() => router.push("/driver/trip-history")} className="h-20 text-lg" variant="outline">
              <Calendar className="mr-2 h-5 w-5" /> View Trip History
            </Button>
          </div>

          {/* Passenger List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Passenger List</span>
                <Badge variant="outline" className="ml-2">
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
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Passengers</TabsTrigger>
                    <TabsTrigger value="checked-in">Checked In</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {renderPassengerList(passengers)}
                  </TabsContent>

                  <TabsContent value="checked-in" className="space-y-4">
                    {renderPassengerList(passengers.filter((p) => p.status === "checked-in"))}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {renderPassengerList(passengers.filter((p) => p.status === "pending"))}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function renderPassengerList(passengers: Passenger[]) {
  if (passengers.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No passengers in this category.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-12 bg-muted p-3 font-medium">
        <div className="col-span-1">#</div>
        <div className="col-span-4">Name</div>
        <div className="col-span-3">ID Number</div>
        <div className="col-span-2">Seat</div>
        <div className="col-span-2">Status</div>
      </div>
      <div className="divide-y">
        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="grid grid-cols-12 p-3 items-center">
            <div className="col-span-1 font-medium">{index + 1}</div>
            <div className="col-span-4">{passenger.name}</div>
            <div className="col-span-3 text-sm">{passenger.idNumber}</div>
            <div className="col-span-2">{passenger.seatNumber}</div>
            <div className="col-span-2">
              <Badge
                variant={
                  passenger.status === "checked-in"
                    ? "default"
                    : passenger.status === "pending"
                      ? "outline"
                      : "destructive"
                }
              >
                {passenger.status === "checked-in"
                  ? "Checked In"
                  : passenger.status === "pending"
                    ? "Pending"
                    : "No Show"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
