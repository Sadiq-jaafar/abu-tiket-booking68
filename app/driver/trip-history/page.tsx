"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Clock, MapPin, Users, ArrowUpDown, ChevronDown } from "lucide-react"
import { DriverHeader } from "@/components/driver-header"
import { DriverFooter } from "@/components/driver-footer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Trip {
  id: string
  date: string
  startTime: string
  endTime: string
  route: string
  status: "completed" | "cancelled" | "in-progress"
  passengerCount: number
  checkedInCount: number
  noShowCount: number
  notes?: string
}

interface DriverInfo {
  id: string
  name: string
  email: string
  shuttleId: string
  shuttleType: string
  route: string
}

// Mock trip data
const mockTrips: Trip[] = [
  {
    id: "TR-1001",
    date: "2025-04-10",
    startTime: "08:00 AM",
    endTime: "09:30 AM",
    route: "Main Campus to Kongo Campus",
    status: "completed",
    passengerCount: 35,
    checkedInCount: 32,
    noShowCount: 3,
  },
  {
    id: "TR-1002",
    date: "2025-04-09",
    startTime: "12:00 PM",
    endTime: "01:30 PM",
    route: "Kongo Campus to Main Campus",
    status: "completed",
    passengerCount: 28,
    checkedInCount: 28,
    noShowCount: 0,
  },
  {
    id: "TR-1003",
    date: "2025-04-08",
    startTime: "04:00 PM",
    endTime: "05:30 PM",
    route: "Main Campus to Kongo Campus",
    status: "completed",
    passengerCount: 40,
    checkedInCount: 37,
    noShowCount: 3,
    notes: "Heavy traffic due to construction work",
  },
  {
    id: "TR-1004",
    date: "2025-04-07",
    startTime: "08:00 AM",
    endTime: "09:45 AM",
    route: "Main Campus to Kongo Campus",
    status: "completed",
    passengerCount: 38,
    checkedInCount: 35,
    noShowCount: 3,
    notes: "Delay due to vehicle inspection",
  },
  {
    id: "TR-1005",
    date: "2025-04-07",
    startTime: "12:00 PM",
    endTime: "01:15 PM",
    route: "Kongo Campus to Main Campus",
    status: "completed",
    passengerCount: 30,
    checkedInCount: 29,
    noShowCount: 1,
  },
  {
    id: "TR-1006",
    date: "2025-04-11",
    startTime: "08:00 AM",
    endTime: "",
    route: "Main Campus to Kongo Campus",
    status: "in-progress",
    passengerCount: 42,
    checkedInCount: 38,
    noShowCount: 4,
  },
]

export default function DriverTripHistoryPage() {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null)
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

    // Fetch trip history
    const fetchTripHistory = async () => {
      try {
        setIsLoading(true)
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
        setTrips(mockTrips)
      } catch (err) {
        console.error("Error fetching trip history:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTripHistory()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("driverAuth")
    router.push("/driver/login")
  }

  const toggleTripDetails = (tripId: string) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null)
    } else {
      setExpandedTrip(tripId)
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DriverHeader title="Trip History"driverName={driverInfo.name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip History</CardTitle>
            <CardDescription>View your past and current trips</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No trip history found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-12 bg-muted p-3 font-medium rounded-t-md">
                  <div className="col-span-1">
                    <div className="flex items-center">
                      #
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                  <div className="col-span-2">Time</div>
                  <div className="col-span-3">Route</div>
                  <div className="col-span-2">Passengers</div>
                  <div className="col-span-2">Status</div>
                </div>

                <div className="divide-y border rounded-b-md">
                  {trips.map((trip, index) => (
                    <Collapsible
                      key={trip.id}
                      open={expandedTrip === trip.id}
                      onOpenChange={() => toggleTripDetails(trip.id)}
                      className="w-full"
                    >
                      <CollapsibleTrigger className="w-full text-left hover:bg-gray-50">
                        <div className="grid grid-cols-12 p-3 items-center">
                          <div className="col-span-1 font-medium">{index + 1}</div>
                          <div className="col-span-2">{new Date(trip.date).toLocaleDateString()}</div>
                          <div className="col-span-2">
                            {trip.startTime} - {trip.endTime || "In Progress"}
                          </div>
                          <div className="col-span-3 truncate">{trip.route}</div>
                          <div className="col-span-2">
                            {trip.checkedInCount}/{trip.passengerCount}
                          </div>
                          <div className="col-span-2 flex items-center justify-between">
                            <Badge
                              variant={
                                trip.status === "completed"
                                  ? "default"
                                  : trip.status === "in-progress"
                                    ? "outline"
                                    : "destructive"
                              }
                            >
                              {trip.status === "completed"
                                ? "Completed"
                                : trip.status === "in-progress"
                                  ? "In Progress"
                                  : "Cancelled"}
                            </Badge>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${expandedTrip === trip.id ? "rotate-180" : ""}`}
                            />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 bg-gray-50 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-2">
                              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Date</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(trip.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Time</p>
                                <p className="text-sm text-gray-600">
                                  {trip.startTime} - {trip.endTime || "In Progress"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Route</p>
                                <p className="text-sm text-gray-600">{trip.route}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-2">
                              <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium">Passenger Statistics</p>
                                <div className="text-sm text-gray-600">
                                  <p>Total: {trip.passengerCount}</p>
                                  <p>Checked In: {trip.checkedInCount}</p>
                                  <p>No Show: {trip.noShowCount}</p>
                                </div>
                              </div>
                            </div>
                            {trip.notes && (
                              <div className="flex items-start gap-2 md:col-span-2">
                                <div>
                                  <p className="text-sm font-medium">Notes</p>
                                  <p className="text-sm text-gray-600">{trip.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <Button variant="outline" size="sm">
                              View Full Report
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <DriverFooter />
    </div>
  )
}
