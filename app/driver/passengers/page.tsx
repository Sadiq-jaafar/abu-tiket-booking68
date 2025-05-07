"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Search, UserCheck, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { DriverHeader } from "@/components/driver-header"
import { DriverFooter } from "@/components/driver-footer"
import { getDriverShuttlePassengers } from "@/lib/driver-actions"

interface Passenger {
  id: string
  name: string
  idNumber: string
  bookingId: string
  status: "checked-in" | "pending" | "no-show"
  seatNumber: string
  pickupLocation?: string
  dropoffLocation?: string
  contactNumber?: string
  specialRequests?: string
}

interface DriverInfo {
  id: string
  name: string
  email: string
  shuttleId: string
  shuttleType: string
  route: string
}

// Mock passenger data for fallback
const mockPassengers: Passenger[] = [
  {
    id: "P-1001",
    name: "Ibrahim Mohammed",
    idNumber: "ABU/STD/2025/001",
    bookingId: "BK-5001",
    status: "checked-in",
    seatNumber: "A1",
    pickupLocation: "Main Campus",
    dropoffLocation: "Kongo Campus",
    contactNumber: "080-1234-5678",
  },
  {
    id: "P-1002",
    name: "Fatima Ahmed",
    idNumber: "ABU/STD/2025/002",
    bookingId: "BK-5002",
    status: "pending",
    seatNumber: "A2",
    pickupLocation: "Main Campus",
    dropoffLocation: "Kongo Campus",
    contactNumber: "080-2345-6789",
  },
  {
    id: "P-1003",
    name: "John Okafor",
    idNumber: "ABU/STF/2025/001",
    bookingId: "BK-5003",
    status: "pending",
    seatNumber: "B1",
    pickupLocation: "Main Campus",
    dropoffLocation: "Kongo Campus",
    contactNumber: "080-3456-7890",
    specialRequests: "Luggage assistance",
  },
]

export default function DriverPassengersPage() {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [filteredPassengers, setFilteredPassengers] = useState<Passenger[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if driver is logged in
    const authData = localStorage.getItem("driverAuth")
    if (!authData) {
      router.push("/driver/login")
      return
    }

    try {
      const driver = JSON.parse(authData) as DriverInfo
      setDriverInfo(driver)
      fetchPassengers(driver.shuttleId)
    } catch (err) {
      console.error("Error parsing driver auth data:", err)
      localStorage.removeItem("driverAuth")
      router.push("/driver/login")
    }
  }, [router])

  // Fetch passengers for this driver's shuttle
  const fetchPassengers = async (shuttleId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      if (useMockData) {
        // Use mock data if we've already had an error
        setPassengers(mockPassengers)
        setFilteredPassengers(mockPassengers)
        return
      }

      const passengersData = await getDriverShuttlePassengers(shuttleId)

      if (!passengersData || passengersData.length === 0) {
        setError("No passengers found for your shuttle. Check back later or refresh.")
        setPassengers([])
        setFilteredPassengers([])
      } else {
        setPassengers(passengersData)
        setFilteredPassengers(passengersData)
      }
    } catch (err: any) {
      console.error("Error fetching passengers:", err)
      setError(`Failed to load passengers: ${err.message || "Unknown error"}. You can use mock data for testing.`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    if (driverInfo) {
      setIsRefreshing(true)
      fetchPassengers(driverInfo.shuttleId)
    }
  }

  // Handle using mock data
  const handleUseMockData = () => {
    setUseMockData(true)
    setPassengers(mockPassengers)
    setFilteredPassengers(mockPassengers)
    setError(null)
  }

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPassengers(passengers)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = passengers.filter(
        (passenger) =>
          passenger.name.toLowerCase().includes(term) ||
          passenger.idNumber.toLowerCase().includes(term) ||
          passenger.bookingId.toLowerCase().includes(term) ||
          passenger.seatNumber.toLowerCase().includes(term),
      )
      setFilteredPassengers(filtered)
    }
  }, [searchTerm, passengers])

  const handleCheckIn = (passenger: Passenger) => {
    // In a real app, this would make an API call to check in the passenger
    const updatedPassengers = passengers.map((p) =>
      p.id === passenger.id ? { ...p, status: "checked-in" as const } : p,
    )
    setPassengers(updatedPassengers)
    setFilteredPassengers(
      filteredPassengers.map((p) => (p.id === passenger.id ? { ...p, status: "checked-in" as const } : p)),
    )
  }

  const handleMarkNoShow = (passenger: Passenger) => {
    // In a real app, this would make an API call to mark the passenger as no-show
    const updatedPassengers = passengers.map((p) => (p.id === passenger.id ? { ...p, status: "no-show" as const } : p))
    setPassengers(updatedPassengers)
    setFilteredPassengers(
      filteredPassengers.map((p) => (p.id === passenger.id ? { ...p, status: "no-show" as const } : p)),
    )
  }

  const handleLogout = () => {
    localStorage.removeItem("driverAuth")
    router.push("/driver/login")
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
      <DriverHeader driverName={driverInfo.name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Passenger Management</CardTitle>
                <CardDescription>View and manage passengers for your shuttle</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search passengers..."
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Refresh passenger list"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading passengers</AlertTitle>
                <AlertDescription className="flex flex-col gap-4">
                  <p>{error}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="w-fit" onClick={handleRefresh} disabled={isRefreshing}>
                      {isRefreshing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh
                        </>
                      )}
                    </Button>
                    <Button variant="default" className="w-fit" onClick={handleUseMockData}>
                      Use Sample Data
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : filteredPassengers.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No matching passengers</AlertTitle>
                <AlertDescription>Try adjusting your search criteria.</AlertDescription>
              </Alert>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Passengers</TabsTrigger>
                  <TabsTrigger value="checked-in">Checked In</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="no-show">No Show</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {renderPassengerList(filteredPassengers, handleCheckIn, handleMarkNoShow, setSelectedPassenger)}
                </TabsContent>

                <TabsContent value="checked-in" className="space-y-4">
                  {renderPassengerList(
                    filteredPassengers.filter((p) => p.status === "checked-in"),
                    handleCheckIn,
                    handleMarkNoShow,
                    setSelectedPassenger,
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                  {renderPassengerList(
                    filteredPassengers.filter((p) => p.status === "pending"),
                    handleCheckIn,
                    handleMarkNoShow,
                    setSelectedPassenger,
                  )}
                </TabsContent>

                <TabsContent value="no-show" className="space-y-4">
                  {renderPassengerList(
                    filteredPassengers.filter((p) => p.status === "no-show"),
                    handleCheckIn,
                    handleMarkNoShow,
                    setSelectedPassenger,
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {selectedPassenger && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Passenger Details</CardTitle>
              <CardDescription>Detailed information about the selected passenger</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Passenger Name</h3>
                    <p className="text-lg">{selectedPassenger.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                    <p className="text-lg">{selectedPassenger.idNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
                    <p className="text-lg">{selectedPassenger.bookingId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Seat Number</h3>
                    <p className="text-lg">{selectedPassenger.seatNumber}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge
                      className={
                        selectedPassenger.status === "checked-in"
                          ? "bg-green-100 text-green-800"
                          : selectedPassenger.status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {selectedPassenger.status === "checked-in"
                        ? "Checked In"
                        : selectedPassenger.status === "pending"
                          ? "Pending"
                          : "No Show"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pickup Location</h3>
                    <p className="text-lg">{selectedPassenger.pickupLocation || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Dropoff Location</h3>
                    <p className="text-lg">{selectedPassenger.dropoffLocation || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                    <p className="text-lg">{selectedPassenger.contactNumber || "N/A"}</p>
                  </div>
                </div>
              </div>

              {selectedPassenger.specialRequests && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Special Requests</h3>
                  <p>{selectedPassenger.specialRequests}</p>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                {selectedPassenger.status === "pending" && (
                  <Button onClick={() => handleCheckIn(selectedPassenger)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Check In Passenger
                  </Button>
                )}
                {selectedPassenger.status === "pending" && (
                  <Button variant="outline" onClick={() => handleMarkNoShow(selectedPassenger)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Mark as No-Show
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedPassenger(null)}>
                  Close Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <DriverFooter />
    </div>
  )
}

function renderPassengerList(
  passengers: Passenger[],
  handleCheckIn: (passenger: Passenger) => void,
  handleMarkNoShow: (passenger: Passenger) => void,
  setSelectedPassenger: (passenger: Passenger) => void,
) {
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
        <div className="col-span-3">Name</div>
        <div className="col-span-2">ID Number</div>
        <div className="col-span-1">Seat</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Actions</div>
      </div>
      <div className="divide-y">
        {passengers.map((passenger, index) => (
          <div key={passenger.id} className="grid grid-cols-12 p-3 items-center">
            <div className="col-span-1 font-medium">{index + 1}</div>
            <div className="col-span-3">{passenger.name}</div>
            <div className="col-span-2 text-sm">{passenger.idNumber}</div>
            <div className="col-span-1">{passenger.seatNumber}</div>
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
            <div className="col-span-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPassenger(passenger)}>
                View Details
              </Button>
              {passenger.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => handleCheckIn(passenger)}>
                    <UserCheck className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMarkNoShow(passenger)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
