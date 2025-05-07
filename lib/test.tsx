// //search
// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import {
//   CalendarIcon,
//   FilterIcon,
//   InfoIcon,
//   MapPinIcon,
//   RefreshCwIcon,
//   SearchIcon,
//   StarIcon,
//   UsersIcon,
//   WifiIcon,
// } from "lucide-react"

// import { SiteHeader } from "@/components/site-header"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { getShuttles, getRoutes } from "@/lib/actions"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// export default function SearchResultsPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()

//   // Extract search parameters
//   const origin = searchParams.get("origin") || ""
//   const destination = searchParams.get("destination") || ""
//   const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
//   const passengers = Number.parseInt(searchParams.get("passengers") || "1", 10)

//   // State for shuttles and routes
//   const [shuttles, setShuttles] = useState<any[]>([])
//   const [routes, setRoutes] = useState<any[]>([])
//   const [filteredShuttles, setFilteredShuttles] = useState<any[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [usingSampleData, setUsingSampleData] = useState(false)

//   // Filter states
//   const [timeFilter, setTimeFilter] = useState("all")
//   const [typeFilter, setTypeFilter] = useState("all")
//   const [sortBy, setSortBy] = useState("departure")

//   // User authentication state
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [userType, setUserType] = useState<"student" | "staff" | "admin" | "driver" | undefined>("student")
//   const [userName, setUserName] = useState("")
//   const [userInitials, setUserInitials] = useState("")

//   useEffect(() => {
//     // Check if user is logged in from localStorage
//     const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
//     const storedUserType = localStorage.getItem("userType") as "student" | "staff" | "admin" | "driver" | undefined
//     const storedUserName = localStorage.getItem("userName")
//     const storedUserInitials = localStorage.getItem("userInitials")

//     if (storedIsLoggedIn) {
//       setIsLoggedIn(true)
//       if (storedUserType) setUserType(storedUserType)
//       if (storedUserName) setUserName(storedUserName)
//       if (storedUserInitials) setUserInitials(storedUserInitials)
//     }

//     // Fetch shuttles and routes
//     fetchShuttlesAndRoutes()
//   }, [])

//   const fetchShuttlesAndRoutes = async () => {
//     setIsLoading(true)
//     setError(null)
//     try {
//       const [shuttlesData, routesData] = await Promise.all([getShuttles(), getRoutes()])

//       setShuttles(shuttlesData)
//       setRoutes(routesData)
//       setUsingSampleData(false)

//       // Apply initial filtering
//       filterShuttles(shuttlesData, routesData)
//     } catch (error) {
//       console.error("Error fetching data:", error)
//       setError("Failed to load shuttle data. You can try using sample data instead.")

//       // Use sample data as fallback
//       setShuttles(sampleShuttles)
//       setRoutes(sampleRoutes)
//       setUsingSampleData(true)
//       filterShuttles(sampleShuttles, sampleRoutes)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const useSampleData = () => {
//     setShuttles(sampleShuttles)
//     setRoutes(sampleRoutes)
//     setUsingSampleData(true)
//     filterShuttles(sampleShuttles, sampleRoutes)
//     setError(null)
//   }

//   const filterShuttles = (shuttlesData: any[], routesData: any[]) => {
//     let filtered = [...shuttlesData]

//     // Filter by origin and destination if provided
//     if (origin && destination) {
//       const matchingRouteIds = routesData
//         .filter(
//           (route) =>
//             route.origin.toLowerCase().includes(origin.toLowerCase()) &&
//             route.destination.toLowerCase().includes(destination.toLowerCase()),
//         )
//         .map((route) => route.id)

//       filtered = filtered.filter((shuttle) => matchingRouteIds.includes(shuttle.route_id))
//     }

//     // Filter by time
//     if (timeFilter !== "all") {
//       filtered = filtered.filter(
//         (shuttle) =>
//           shuttle.schedule?.includes(timeFilter) ||
//           (timeFilter === "morning" && shuttle.departure_time < "12:00") ||
//           (timeFilter === "afternoon" && shuttle.departure_time >= "12:00" && shuttle.departure_time < "17:00") ||
//           (timeFilter === "evening" && shuttle.departure_time >= "17:00"),
//       )
//     }

//     // Filter by shuttle type
//     if (typeFilter !== "all") {
//       filtered = filtered.filter((shuttle) => shuttle.type.toLowerCase() === typeFilter.toLowerCase())
//     }

//     // Sort shuttles
//     if (sortBy === "departure") {
//       filtered.sort((a, b) => (a.departure_time > b.departure_time ? 1 : -1))
//     } else if (sortBy === "price") {
//       filtered.sort((a, b) => {
//         const routeA = routes.find((r) => r.shuttle_id === a.shuttle_id)
//         const routeB = routes.find((r) => r.shuttle_id === b.shuttle_id)
//         return (routeA?.base_price || 0) - (routeB?.base_price || 0)
//       })
//     } else if (sortBy === "duration") {
//       filtered.sort((a, b) => {
//         const durationA = calculateDuration(a.departure_time, a.arrival_time)
//         const durationB = calculateDuration(b.departure_time, b.arrival_time)
//         return durationA - durationB
//       })
//     }

//     setFilteredShuttles(filtered)
//   }

//   const calculateDuration = (departureTime: string, arrivalTime: string) => {
//     try {
//       const [depHours, depMinutes] = departureTime.split(":").map(Number)
//       const [arrHours, arrMinutes] = arrivalTime.split(":").map(Number)

//       let totalMinutes = arrHours * 60 + arrMinutes - (depHours * 60 + depMinutes)
//       if (totalMinutes < 0) totalMinutes += 24 * 60 // Handle overnight trips

//       return totalMinutes
//     } catch (e) {
//       return 0
//     }
//   }

//   const handleTimeFilterChange = (value: string) => {
//     setTimeFilter(value)
//     filterShuttles(shuttles, routes)
//   }

//   const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setTypeFilter(e.target.value)
//     filterShuttles(shuttles, routes)
//   }

//   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSortBy(e.target.value)
//     filterShuttles(shuttles, routes)
//   }

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "Today"

//     try {
//       const date = new Date(dateString)
//       return date.toLocaleDateString("en-US", {
//         weekday: "short",
//         month: "short",
//         day: "numeric",
//       })
//     } catch (error) {
//       return "Today"
//     }
//   }

//   const formatDuration = (departureTime: string, arrivalTime: string) => {
//     try {
//       const minutes = calculateDuration(departureTime, arrivalTime)
//       const hours = Math.floor(minutes / 60)
//       const mins = minutes % 60

//       return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
//     } catch (e) {
//       return "45m" // Default duration
//     }
//   }

//   // Update the getRouteForShuttle function to handle the new route structure
//   const getRouteForShuttle = (shuttle: any) => {
//     const matchingRoute = routes.find((route) => route.shuttle_id === shuttle.shuttle_id)

//     if (matchingRoute) {
//       return {
//         origin: matchingRoute.departure_location,
//         destination: matchingRoute.arrival_location,
//         price: matchingRoute.base_price,
//         premium_price: matchingRoute.premium_price,
//         premium_available: matchingRoute.premium_price > 0,
//       }
//     }

//     // Fallback if no matching route is found
//     return {
//       origin: "Main Campus",
//       destination: "Kongo Campus",
//       price: 150,
//       premium_price: 250,
//       premium_available: true,
//     }
//   }

//   const handleBookNow = (shuttle: any, isPremium = false) => {
//     if (!isLoggedIn) {
//       router.push(
//         `/login?redirect=/booking/payment?shuttle_id=${shuttle.shuttle_id}&date=${date}&passengers=${passengers}&premium=${isPremium}`,
//       )
//       return
//     }

//     router.push(
//       `/booking/payment?shuttle_id=${shuttle.shuttle_id}&date=${date}&passengers=${passengers}&premium=${isPremium}`,
//     )
//   }

//   // Safe facilities parser
//   const getFacilities = (shuttle: any) => {
//     if (!shuttle) return ["Standard"]

//     try {
//       // If facilities is already an array, return it
//       if (Array.isArray(shuttle.facilities)) {
//         return shuttle.facilities.length > 0 ? shuttle.facilities : ["Standard"]
//       }

//       // If facilities is a string, try to parse it
//       if (typeof shuttle.facilities === "string") {
//         try {
//           const parsed = JSON.parse(shuttle.facilities)
//           return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["Standard"]
//         } catch (e) {
//           return ["Standard"]
//         }
//       }

//       // Default case
//       return ["Standard"]
//     } catch (error) {
//       console.error("Error parsing facilities:", error)
//       return ["Standard"]
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#f5f5f5]">
//       <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />

//       <main className="container px-4 py-8 mx-auto">
//         <div className="max-w-5xl mx-auto">
//           <div className="mb-8">
//             <h1 className="text-2xl font-bold text-[#006400] mb-2">Available Shuttles</h1>
//             <p className="text-gray-500">
//               {origin && destination
//                 ? `Showing shuttles from ${origin} to ${destination}`
//                 : "Showing all available shuttles"}
//               {date && ` on ${formatDate(date)}`}
//               {passengers > 1 ? ` for ${passengers} passengers` : ""}
//             </p>
//             {usingSampleData && (
//               <Alert className="mt-4 bg-amber-50 border-amber-200">
//                 <InfoIcon className="h-4 w-4 text-amber-600" />
//                 <AlertTitle>Using Sample Data</AlertTitle>
//                 <AlertDescription>
//                   You're currently viewing sample data.
//                   <Button
//                     variant="link"
//                     className="p-0 h-auto text-amber-600 font-medium"
//                     onClick={fetchShuttlesAndRoutes}
//                   >
//                     Click here
//                   </Button>{" "}
//                   to try loading real data.
//                 </AlertDescription>
//               </Alert>
//             )}
//             {error && (
//               <Alert className="mt-4 bg-red-50 border-red-200">
//                 <InfoIcon className="h-4 w-4 text-red-600" />
//                 <AlertTitle>Error</AlertTitle>
//                 <AlertDescription className="flex items-center gap-4">
//                   {error}
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="border-red-200 text-red-600"
//                       onClick={fetchShuttlesAndRoutes}
//                     >
//                       <RefreshCwIcon className="mr-1 h-4 w-4" /> Retry
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="border-amber-200 text-amber-600"
//                       onClick={useSampleData}
//                     >
//                       Use Sample Data
//                     </Button>
//                   </div>
//                 </AlertDescription>
//               </Alert>
//             )}
//           </div>

//           <div className="grid gap-6 md:grid-cols-4">
//             {/* Filters sidebar */}
//             <div className="md:col-span-1">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center text-lg">
//                     <FilterIcon className="w-5 h-5 mr-2" />
//                     Filters
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div className="space-y-2">
//                     <Label>Departure Time</Label>
//                     <Tabs defaultValue="all" onValueChange={handleTimeFilterChange}>
//                       <TabsList className="grid w-full grid-cols-4">
//                         <TabsTrigger value="all">All</TabsTrigger>
//                         <TabsTrigger value="morning">Morning</TabsTrigger>
//                         <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
//                         <TabsTrigger value="evening">Evening</TabsTrigger>
//                       </TabsList>
//                     </Tabs>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="shuttle-type">Shuttle Type</Label>
//                     <select
//                       id="shuttle-type"
//                       className="w-full p-2 border rounded-md"
//                       value={typeFilter}
//                       onChange={handleTypeFilterChange}
//                     >
//                       <option value="all">All Types</option>
//                       <option value="campus bus">Campus Bus</option>
//                       <option value="express">Express</option>
//                       <option value="standard">Standard</option>
//                     </select>
//                   </div>

//                   <Separator />

//                   <div className="space-y-2">
//                     <Label htmlFor="sort-by">Sort By</Label>
//                     <select
//                       id="sort-by"
//                       className="w-full p-2 border rounded-md"
//                       value={sortBy}
//                       onChange={handleSortChange}
//                     >
//                       <option value="departure">Departure Time</option>
//                       <option value="price">Price (Low to High)</option>
//                       <option value="duration">Duration (Shortest)</option>
//                     </select>
//                   </div>

//                   <div className="pt-4">
//                     <Button
//                       variant="outline"
//                       className="w-full text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
//                       onClick={() => {
//                         setTimeFilter("all")
//                         setTypeFilter("all")
//                         setSortBy("departure")
//                         filterShuttles(shuttles, routes)
//                       }}
//                     >
//                       Reset Filters
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Shuttle listings */}
//             <div className="md:col-span-3 space-y-6">
//               {isLoading ? (
//                 // Loading skeleton
//                 Array(3)
//                   .fill(0)
//                   .map((_, i) => (
//                     <Card key={i} className="animate-pulse">
//                       <CardContent className="p-6">
//                         <div className="flex justify-between mb-4">
//                           <div className="h-6 bg-gray-200 rounded w-1/3"></div>
//                           <div className="h-6 bg-gray-200 rounded w-1/4"></div>
//                         </div>
//                         <div className="grid grid-cols-3 gap-4 mb-4">
//                           <div className="h-12 bg-gray-200 rounded"></div>
//                           <div className="h-12 bg-gray-200 rounded"></div>
//                           <div className="h-12 bg-gray-200 rounded"></div>
//                         </div>
//                         <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
//                       </CardContent>
//                     </Card>
//                   ))
//               ) : filteredShuttles.length === 0 ? (
//                 <Card>
//                   <CardContent className="flex flex-col items-center justify-center p-8">
//                     <div className="rounded-full bg-gray-100 p-3 mb-4">
//                       <SearchIcon className="h-6 w-6 text-gray-400" />
//                     </div>
//                     <h3 className="text-lg font-medium">No shuttles found</h3>
//                     <p className="text-gray-500 text-center mt-2">
//                       No shuttles match your search criteria. Try adjusting your filters or search for a different
//                       route.
//                     </p>
//                     <Button
//                       className="mt-4 bg-[#006400] hover:bg-[#005000]"
//                       onClick={() => {
//                         setTimeFilter("all")
//                         setTypeFilter("all")
//                         setSortBy("departure")
//                         filterShuttles(shuttles, routes)
//                       }}
//                     >
//                       Reset Filters
//                     </Button>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 filteredShuttles.map((shuttle) => {
//                   const route = getRouteForShuttle(shuttle)
//                   return (
//                     <Card key={shuttle.shuttle_id} className="overflow-hidden">
//                       <CardContent className="p-0">
//                         <div className="p-6">
//                           <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//                             <div>
//                               <h3 className="text-lg font-semibold text-[#006400]">{shuttle.type}</h3>
//                               <p className="text-sm text-gray-500">
//                                 {route.origin} to {route.destination}
//                               </p>
//                             </div>
//                             <div className="flex flex-wrap gap-2">
//                               {getFacilities(shuttle).map((facility, i) => (
//                                 <Badge key={i} variant="outline" className="text-xs">
//                                   {facility === "WiFi" && <WifiIcon className="w-3 h-3 mr-1" />}
//                                   {facility}
//                                 </Badge>
//                               ))}
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                             <div>
//                               <p className="text-xl font-semibold">{shuttle.departure_time}</p>
//                               <p className="text-sm text-gray-500">{formatDate(date)}</p>
//                               <p className="text-sm text-gray-500">{route.origin}</p>
//                             </div>
//                             <div className="flex flex-col items-center justify-center">
//                               <div className="relative w-full">
//                                 <Separator className="absolute top-1/2 w-full" />
//                                 <div className="relative flex justify-center">
//                                   <Badge variant="outline" className="px-2 py-0 text-xs bg-white">
//                                     {formatDuration(shuttle.departure_time, shuttle.arrival_time)}
//                                   </Badge>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-xl font-semibold">{shuttle.arrival_time}</p>
//                               <p className="text-sm text-gray-500">{formatDate(date)}</p>
//                               <p className="text-sm text-gray-500">{route.destination}</p>
//                             </div>
//                           </div>

//                           <Separator className="my-4" />

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                               <div className="flex items-center gap-2">
//                                 <UsersIcon className="w-4 h-4 text-gray-500" />
//                                 <span className="text-sm text-gray-500">{shuttle.capacity} seats available</span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <CalendarIcon className="w-4 h-4 text-gray-500" />
//                                 <span className="text-sm text-gray-500">{formatDate(date)}</span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <MapPinIcon className="w-4 h-4 text-gray-500" />
//                                 <span className="text-sm text-gray-500">Boarding: {route.origin} Terminal</span>
//                               </div>
//                             </div>

//                             <div className="flex flex-col justify-between space-y-4">
//                               <div className="flex justify-between items-center">
//                                 <div>
//                                   <p className="text-sm text-gray-500">Standard Price</p>
//                                   <p className="text-xl font-semibold text-[#006400]">
//                                     ₦{route.price} <span className="text-sm font-normal">/ person</span>
//                                   </p>
//                                 </div>
//                                 <Button
//                                   className="bg-[#006400] hover:bg-[#005000]"
//                                   onClick={() => handleBookNow(shuttle)}
//                                 >
//                                   Book Now
//                                 </Button>
//                               </div>

//                               {route.premium_available && (
//                                 <div className="flex justify-between items-center p-3 bg-amber-50 rounded-md border border-amber-200">
//                                   <div>
//                                     <p className="text-sm font-medium flex items-center">
//                                       <StarIcon className="w-4 h-4 text-amber-500 mr-1" /> Premium
//                                     </p>
//                                     <p className="text-lg font-semibold text-amber-700">
//                                       ₦{route.premium_price || Math.round(route.price * 1.5)}
//                                       <span className="text-sm font-normal"> / person</span>
//                                     </p>
//                                   </div>
//                                   <Button
//                                     variant="outline"
//                                     className="border-amber-500 text-amber-700 hover:bg-amber-100"
//                                     onClick={() => handleBookNow(shuttle, true)}
//                                   >
//                                     Book Premium
//                                   </Button>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )
//                 })
//               )}

//               {!isLoading && filteredShuttles.length > 0 && (
//                 <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-100">
//                   <InfoIcon className="w-5 h-5 text-blue-500 mr-2" />
//                   <p className="text-sm text-blue-700">
//                     Showing {filteredShuttles.length} shuttles. Prices may vary based on demand and availability.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// // Sample data for fallback
// const sampleShuttles = [
//   {
//     shuttle_id: "SH-1001",
//     type: "Campus Bus",
//     capacity: 15,
//     departure_time: "07:30",
//     arrival_time: "08:15",
//     route_id: 1,
//     schedule: ["morning"],
//     facilities: ["WiFi", "Air Conditioning"],
//   },
//   {
//     shuttle_id: "SH-1002",
//     type: "Express",
//     capacity: 12,
//     departure_time: "08:00",
//     arrival_time: "08:30",
//     route_id: 1,
//     schedule: ["morning"],
//     facilities: ["WiFi", "Air Conditioning", "USB Charging"],
//   },
//   {
//     shuttle_id: "SH-1003",
//     type: "Standard",
//     capacity: 18,
//     departure_time: "12:30",
//     arrival_time: "13:15",
//     route_id: 2,
//     schedule: ["afternoon"],
//     facilities: ["WiFi", "Air Conditioning"],
//   },
//   {
//     shuttle_id: "SH-1004",
//     type: "Campus Bus",
//     capacity: 15,
//     departure_time: "16:30",
//     arrival_time: "17:15",
//     route_id: 2,
//     schedule: ["evening"],
//     facilities: ["WiFi", "Air Conditioning"],
//   },
//   {
//     shuttle_id: "SH-1005",
//     type: "Express",
//     capacity: 12,
//     departure_time: "17:00",
//     arrival_time: "17:30",
//     route_id: 1,
//     schedule: ["evening"],
//     facilities: ["WiFi", "Air Conditioning", "USB Charging"],
//   },
// ]

// const sampleRoutes = [
//   {
//     id: 1,
//     origin: "Main Campus",
//     destination: "Kongo Campus",
//     price: 150,
//     premium_price: 250,
//     premium_available: true,
//   },
//   {
//     id: 2,
//     origin: "Kongo Campus",
//     destination: "Main Campus",
//     price: 150,
//     premium_price: 250,
//     premium_available: true,
//   },
//   {
//     id: 3,
//     origin: "Main Campus",
//     destination: "Faculty of Engineering",
//     price: 120,
//     premium_price: 200,
//     premium_available: true,
//   },
//   {
//     id: 4,
//     origin: "Faculty of Science",
//     destination: "Main Campus",
//     price: 130,
//     premium_price: 220,
//     premium_available: true,
//   },
// ]
