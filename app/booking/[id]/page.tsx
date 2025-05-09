// "use client"

// import { useEffect, useState , use, useRef} from "react"
// import jsPDF from "jspdf"
// import html2canvas from "html2canvas"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import {
//   ArrowLeftIcon,
//   MapPinIcon,
//   UserIcon,
//   CheckCircleIcon,
//   DownloadIcon,
//   PrinterIcon,
//   ShareIcon,
//   CreditCardIcon as IdCardIcon,
//   MailIcon,
//   PhoneIcon,
//   CalendarIcon,
//   ClockIcon,
//   Users2Icon,
//   AlertCircleIcon,
// } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"
// import { Badge } from "@/components/ui/badge"
// import { SiteHeader } from "@/components/site-header"
// import { TicketQRCode } from "@/components/ticket-qr-code"
// import { getBookingById, getUserProfile } from "@/lib/actions"
// import { formatDate, formatCurrency } from "@/lib/utils"
// import type { Booking, Passenger, User } from "@/lib/definitions"


// // Create an async Server Component wrapper
// async function BookingPageWrapper({ params }: { params: { id: string } }) {
//   const { id } = await params;
//   return <BookingTicketPage params={{ id }} />;
// }

// export default function BookingTicketPage({ params }: { params: { id: string } }) {
//   const router = useRouter()
//   const { id } = params
//   const [booking, setBooking] = useState<Booking | null>(null)
//   const [currentUser, setCurrentUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const ticketRef = useRef<HTMLDivElement>(null)
  

//   const handleDownloadPDF = async () => {
//     if (!ticketRef.current) return
    
//     const canvas = await html2canvas(ticketRef.current, { scale: 2 })
//     const imgData = canvas.toDataURL('image/png')
//     const pdf = new jsPDF('p', 'mm', 'a4')
//     const imgWidth = 210
//     const imgHeight = (canvas.height * imgWidth) / canvas.width
    
//     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
//     pdf.save(`ticket-${booking?.booking_id || 'ticket'}.pdf`)
//   }

//   const handlePrintPDF = async () => {
//     if (!ticketRef.current) return
    
//     const canvas = await html2canvas(ticketRef.current, { scale: 2 })
//     const imgData = canvas.toDataURL('image/png')
//     const pdf = new jsPDF('p', 'mm', 'a4')
//     const imgWidth = 210
//     const imgHeight = (canvas.height * imgWidth) / canvas.width
    
//     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
//     pdf.autoPrint()
//     window.open(pdf.output('bloburl'), '_blank')
//   }

//   const handleShare = async () => {
//     if (!ticketRef.current) return
    
//     try {
//       const canvas = await html2canvas(ticketRef.current, { scale: 2 })
//       canvas.toBlob(async (blob) => {
//         if (!blob) return
        
//         const file = new File([blob], 'ticket.png', { type: 'image/png' })
        
//         if (navigator.share) {
//           await navigator.share({
//             title: 'My Shuttle Ticket',
//             files: [file],
//           })
//         } else {
//           const link = document.createElement('a')
//           link.href = URL.createObjectURL(blob)
//           link.download = 'ticket.png'
//           link.click()
//         }
//       })
//     } catch (error) {
//       console.error('Error sharing:', error)
//     }
//   }
 
//   // Fetch data when bookingId is available
//   useEffect(() => {
//     async function fetchData() {
//       if (!id) return

//       try {
//         setLoading(true)
//         const bookingData = await getBookingById(id)

//         if (!bookingData) {
//           setError("Booking not found")
//           return
//         }

//         setBooking(bookingData)

//         if (bookingData.user_id) {
//           const userData = await getUserProfile(bookingData.user_id)
//           setCurrentUser(userData)
//         }
//       } catch (err) {
//         console.error("Error fetching booking:", err)
//         setError("Failed to load booking details. Please try again.")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [id])
  

//   // Prepare QR code data
//   const qrCodeData = booking
//     ? {
//         bookingId: booking.booking_id,
//         departureDate: booking.departure_date,
//         departureTime: booking.departure_time,
//         passengers: (booking.passengers || []).map(p => ({
//           name: `${p.first_name} ${p.last_name}`,
//           idNumber: p.id_number
//         })),
//         route: `${booking.route?.departure_location || ""} to ${booking.route?.arrival_location || ""}`,
//         timestamp: Date.now(),
//         shuttleType: booking.shuttle?.type || "Standard",
//         shuttleCategory: booking.shuttle?.category || "Regular",
//         isPremium: booking.is_premium,
//         pickupAddress: booking.pickup_address,
//         dropoffAddress: booking.dropoff_address,
//       }
//     : null

//   // Format facilities
//   const getFacilities = () => {
//     if (!booking?.shuttle?.facilities) return []

//     try {
//       if (typeof booking.shuttle.facilities === "string") {
//         return JSON.parse(booking.shuttle.facilities)
//       }
//       return booking.shuttle.facilities
//     } catch (e) {
//       console.error("Error parsing facilities:", e)
//       return []
//     }
//   }

//   // Get passenger names as a comma-separated string
//   const getPassengerNames = () => {
//     // If we have passengers in the booking, use those
//     if (booking?.passengers && booking.passengers.length > 0) {
//       return booking.passengers.map((passenger) => `${passenger.first_name} ${passenger.last_name}`).join(", ")
//     }

//     // If no passengers but we have the current user, use their name
//     if (currentUser) {
//       return `${currentUser.first_name} ${currentUser.last_name}`
//     }

//     // Fallback
//     return "No passenger details available"
//   }

//   // Create a fallback passenger from the current user
//   const createFallbackPassenger = (): Passenger => {
//     if (!currentUser) {
//       return {
//         first_name: "Unknown",
//         last_name: "Passenger",
//         id_type: "Unknown",
//         id_number: "Unknown",
//         booking_id: "Unknown",
//         shuttle_id: "Unknown",
//       }
//     }

//     return {
//       first_name: currentUser.first_name,
//       last_name: currentUser.last_name,
//       id_type: currentUser.id_type || "ID",
//       id_number: currentUser.id_number || "Not provided",
//       booking_id: booking?.booking_id || "Unknown",
//       shuttle_id: booking?.shuttle_id || "Unknown"
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#006400] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
//           <p className="mt-4 text-lg font-medium">Loading ticket...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#f5f5f5]">
//         <SiteHeader isLoggedIn={true} userType="student" userName="Ibrahim Mohammed" userInitials="IM" />
//         <div className="container px-4 py-12 mx-auto text-center">
//           <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//             <p className="text-gray-700 mb-6">{error}</p>
//             <Button asChild>
//               <Link href="/my-bookings">View My Bookings</Link>
//             </Button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (!booking) {
//     return (
//       <div className="min-h-screen bg-[#f5f5f5]">
//         <SiteHeader isLoggedIn={true} userType="student" userName="Ibrahim Mohammed" userInitials="IM" />
//         <div className="container px-4 py-12 mx-auto text-center">
//           <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
//             <p className="text-gray-700 mb-6">We couldn't find the booking you're looking for.</p>
//             <Button asChild>
//               <Link href="/">Return to Home</Link>
//             </Button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   const facilities = getFacilities()
//   const isPremium = booking.is_premium
//   const passengerNames = getPassengerNames()

//   // Use booking passengers or fallback to current user
//   const displayPassengers =
//     booking.passengers && booking.passengers.length > 0 ? booking.passengers : [createFallbackPassenger()]

//   return (
//     <div className="min-h-screen bg-[#f5f5f5]">
//       <SiteHeader isLoggedIn={true} userType="student" userName="Ibrahim Mohammed" userInitials="IM" />

//       <div className="container px-4 py-6 mx-auto">
//         <div className="flex items-center mb-6 space-x-2">
//           <Link href="/" className="text-sm text-gray-500 hover:text-[#006400]">
//             Home
//           </Link>
//           <span className="text-sm text-gray-500">/</span>
//           <Link href="/my-bookings" className="text-sm text-gray-500 hover:text-[#006400]">
//             My Bookings
//           </Link>
//           <span className="text-sm text-gray-500">/</span>
//           <span className="text-sm font-medium">Ticket</span>
//         </div>

//         <div className="flex items-center mb-6">
//           <Link href="/my-bookings" className="flex items-center text-sm text-[#006400] hover:underline">
//             <ArrowLeftIcon className="w-4 h-4 mr-1" />
//             Back to my bookings
//           </Link>
//         </div>

//         <div className="max-w-3xl mx-auto">
//         <div ref={ticketRef}>
//           <Card className={`border-t-4 ${isPremium ? "border-amber-500" : "border-[#006400]"} mb-6`}>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="text-2xl">E-Ticket</CardTitle>
//                 <p className="text-sm text-gray-500">Booking ID: {booking.booking_id}</p>
//               </div>
//               <div>
//                 <Badge className={isPremium ? "bg-amber-500" : "bg-[#006400]"}>
//                   {isPremium ? "Premium" : "Standard"}
//                 </Badge>
//               </div>
//             </CardHeader>
            
//             <CardContent className="space-y-6">
//               {/* Passenger Names - Prominently displayed at the top */}
//               <div
//                 className={`p-4 rounded-lg ${isPremium ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-200"}`}
//               >
//                 <div className="flex items-center mb-2">
//                   <Users2Icon className={`w-5 h-5 mr-2 ${isPremium ? "text-amber-600" : "text-[#006400]"}`} />
//                   <h3 className={`font-semibold ${isPremium ? "text-amber-700" : "text-[#006400]"}`}>Passenger(s)</h3>
//                 </div>
//                 <p className="text-lg font-medium">{passengerNames}</p>

//                 {/* Show notice if using fallback user data */}
//                 {(!booking.passengers || booking.passengers.length === 0) && currentUser && (
//                   <div className="flex items-center mt-2 text-sm text-amber-600">
//                     <AlertCircleIcon className="w-4 h-4 mr-1" />
//                     <p>Using account holder details as passenger information</p>
//                   </div>
//                 )}
//               </div>

//               {/* Shuttle Info */}
//               <div className={`p-4 rounded-lg ${isPremium ? "bg-amber-50" : "bg-gray-50"}`}>
//                 <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//                   <div>
//                     <h3 className={`text-lg font-semibold ${isPremium ? "text-amber-700" : "text-[#006400]"}`}>
//                       {booking.shuttle?.type || "Campus Shuttle"}
//                     </h3>
//                     <p className="text-sm text-gray-500">{booking.shuttle?.category || "Regular"} Shuttle</p>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {facilities.map((facility: string, i: number) => (
//                       <Badge
//                         key={i}
//                         variant="outline"
//                         className={`text-xs ${
//                           isPremium ? "border-amber-300 text-amber-700" : "border-[#006400] text-[#006400]"
//                         }`}
//                       >
//                         {facility}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Route Info */}
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//                   <div>
//                     <p className="text-xl font-semibold">{booking.departure_time}</p>
//                     <p className="text-sm text-gray-500">{formatDate(booking.departure_date)}</p>
//                     <p className="text-sm text-gray-500">{booking.route?.departure_location}</p>
//                   </div>
//                   <div className="flex flex-col items-center justify-center">
//                     <div className="relative w-full">
//                       <Separator className="absolute top-1/2 w-full" />
//                       <div className="relative flex justify-center">
//                         <Badge
//                           variant="outline"
//                           className={`px-2 py-0 text-xs bg-white ${
//                             isPremium ? "border-amber-300 text-amber-700" : "border-[#006400] text-[#006400]"
//                           }`}
//                         >
//                           {booking.arrival_time
//                             ? calculateDuration(booking.departure_time, booking.arrival_time)
//                             : "45m"}
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xl font-semibold">{booking.arrival_time}</p>
//                     <p className="text-sm text-gray-500">{formatDate(booking.departure_date)}</p>
//                     <p className="text-sm text-gray-500">{booking.route?.arrival_location}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Travel Details */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="p-4 border rounded-md bg-white">
//                   <div className="flex items-center mb-3">
//                     <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
//                     <h3 className="font-medium">Travel Date</h3>
//                   </div>
//                   <p className="text-lg">{formatDate(booking.departure_date)}</p>
//                 </div>

//                 <div className="p-4 border rounded-md bg-white">
//                   <div className="flex items-center mb-3">
//                     <ClockIcon className="w-5 h-5 mr-2 text-gray-400" />
//                     <h3 className="font-medium">Departure Time</h3>
//                   </div>
//                   <p className="text-lg">{booking.departure_time}</p>
//                 </div>
//               </div>

//               {/* Passenger Details (Detailed section) */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Passenger Details</h3>
//                 <div className="space-y-3">
//                   {displayPassengers.map((passenger: Passenger, index: number) => (
//                     <div key={index} className="p-4 border rounded-md bg-white">
//                       <div className="flex items-start">
//                         <UserIcon className="w-5 h-5 mr-3 mt-1 text-gray-400" />
//                         <div className="space-y-2 flex-1">
//                           <div>
//                             <p className="font-medium text-lg">{`${passenger.first_name} ${passenger.last_name}`}</p>
//                             <div className="flex items-center mt-1">
//                               <IdCardIcon className="w-4 h-4 mr-1 text-gray-400" />
//                               <p className="text-sm text-gray-600">
//                                 {passenger.id_type}: {passenger.id_number}
//                               </p>
//                             </div>
//                           </div>

//                           {passenger.first_name && passenger.last_name && (
//                             <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
//                               <div>
//                                 <span className="font-medium">First Name:</span> {passenger.first_name}
//                               </div>
//                               <div>
//                                 <span className="font-medium">Last Name:</span> {passenger.last_name}
//                               </div>
//                             </div>
//                           )}

//                           {(!booking.passengers || booking.passengers.length === 0) && index === 0 && (
//                             <div className="mt-2 p-2 bg-amber-50 text-amber-700 text-sm rounded-md">
//                               <AlertCircleIcon className="w-4 h-4 inline-block mr-1" />
//                               Using account holder details as passenger information
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Contact Information */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
//                 <div className="p-4 border rounded-md bg-white">
//                   <div className="space-y-3">
//                     {booking.contactInfo?.email && (
//                       <div className="flex items-center">
//                         <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
//                         <div>
//                           <p className="text-sm text-gray-500">Email</p>
//                           <p>{booking.contactInfo.email}</p>
//                         </div>
//                       </div>
//                     )}

//                     {booking.contactInfo?.phone && (
//                       <div className="flex items-center">
//                         <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
//                         <div>
//                           <p className="text-sm text-gray-500">Phone</p>
//                           <p>{booking.contactInfo.phone}</p>
//                         </div>
//                       </div>
//                     )}

//                     {booking.contactInfo?.special_requests && (
//                       <div>
//                         <p className="text-sm text-gray-500 mb-1">Special Request</p>
//                         <p className="p-2 bg-gray-50 rounded text-gray-700">{booking.contactInfo.special_requests}</p>
//                       </div>
//                     )}

//                     {/* Fallback to user data if no contact info */}
//                     {(!booking.contactInfo || (!booking.contactInfo.email && !booking.contactInfo.phone)) &&
//                       currentUser && (
//                         <>
//                           <div className="flex items-center">
//                             <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
//                             <div>
//                               <p className="text-sm text-gray-500">Email</p>
//                               <p>{currentUser.email}</p>
//                             </div>
//                           </div>

//                           {currentUser.phone_number && (
//                             <div className="flex items-center">
//                               <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
//                               <div>
//                                 <p className="text-sm text-gray-500">Phone</p>
//                                 <p>{currentUser.phone_number}</p>
//                               </div>
//                             </div>
//                           )}

//                           <div className="mt-2 p-2 bg-amber-50 text-amber-700 text-sm rounded-md">
//                             <AlertCircleIcon className="w-4 h-4 inline-block mr-1" />
//                             Using account holder contact information
//                           </div>
//                         </>
//                       )}

//                     {!booking.contactInfo && !currentUser && (
//                       <p className="text-gray-500 text-center">No contact information available</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Premium Info */}
//               {isPremium && (
//                 <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                   <h3 className="font-medium text-amber-800 mb-2">Premium Service Details</h3>

//                   <div className="space-y-2">
//                     <div className="flex items-start">
//                       <MapPinIcon className="w-4 h-4 mt-1 mr-2 text-amber-500" />
//                       <div>
//                         <p className="text-sm font-medium text-amber-700">Pickup Address</p>
//                         <p className="text-sm text-amber-600">{booking.pickup_address || "Not specified"}</p>
//                       </div>
//                     </div>

//                     <div className="flex items-start">
//                       <MapPinIcon className="w-4 h-4 mt-1 mr-2 text-amber-500" />
//                       <div>
//                         <p className="text-sm font-medium text-amber-700">Dropoff Address</p>
//                         <p className="text-sm text-amber-600">{booking.dropoff_address || "Not specified"}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Payment Info */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
//                 <div className="p-4 border rounded-md bg-white">
//                   <div className="flex justify-between mb-2">
//                     <span className="text-gray-500">Price</span>
//                     <span>{formatCurrency(booking.price)}</span>
//                   </div>
//                   <div className="flex justify-between mb-2">
//                     <span className="text-gray-500">Service Fee</span>
//                     <span>{formatCurrency(booking.total_amount - booking.price)}</span>
//                   </div>
//                   <Separator className="my-2" />
//                   <div className="flex justify-between font-semibold">
//                     <span>Total</span>
//                     <span className={isPremium ? "text-amber-700" : "text-[#006400]"}>
//                       {formatCurrency(booking.total_amount)}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* QR Code */}
//               <div className="mt-6">
//                 <div className="p-6 border-2 border-dashed rounded-lg bg-white">
//                   <div className="text-center mb-4">
//                     <h3 className="text-lg font-semibold mb-1">Scan this QR code at the terminal</h3>
//                     <p className="text-sm text-gray-500">
//                       Present this to the driver or terminal staff for verification
//                     </p>
//                   </div>

//                   <div className="flex justify-center">
//                     {qrCodeData && <TicketQRCode data={qrCodeData} size={200} isPremium={isPremium} />}
//                   </div>

//                   <div className="mt-4 text-center">
//                     <p className="text-sm text-gray-500">
//                       <CheckCircleIcon className="inline-block w-4 h-4 mr-1 text-green-500" />
//                       Valid for travel on {formatDate(booking.departure_date)}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
            

//             <CardFooter className="flex flex-wrap justify-center gap-3">
//               <Button variant="outline" className="flex items-center gap-2" onClick={handlePrintPDF}>
//                 <PrinterIcon className="w-4 h-4" />
//                 Print Ticket
//               </Button>
//               <Button variant="outline" className="flex items-center gap-2"onClick={handleDownloadPDF}>
//                 <DownloadIcon className="w-4 h-4" />
//                 Download
//               </Button>
//               <Button variant="outline" className="flex items-center gap-2" onClick={handleShare}>
//                 <ShareIcon className="w-4 h-4" />
//                 Share
//               </Button>
//             </CardFooter>
//           </Card>
//         </div>
//           <div className="text-center mb-8">
//             <Link href="/my-bookings" className="text-[#006400] hover:underline">
//               View all my bookings
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Helper function to calculate duration between two time strings (HH:MM)
// function calculateDuration(startTime: string, endTime: string): string {
//   try {
//     const [startHours, startMinutes] = startTime.split(":").map(Number)
//     const [endHours, endMinutes] = endTime.split(":").map(Number)

//     let durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)

//     // Handle cases where end time is on the next day
//     if (durationMinutes < 0) {
//       durationMinutes += 24 * 60
//     }

//     const hours = Math.floor(durationMinutes / 60)
//     const minutes = durationMinutes % 60

//     if (hours > 0) {
//       return `${hours}h ${minutes}m`
//     } else {
//       return `${minutes}m`
//     }
//   } catch (e) {
//     console.error("Error calculating duration:", e)
//     return "45m" // Default fallback
//   }
// }
"use client"

import { useEffect, useState, useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  DownloadIcon,
  PrinterIcon,
  ShareIcon,
  CreditCardIcon as IdCardIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  Users2Icon,
  AlertCircleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { TicketQRCode } from "@/components/ticket-qr-code"
import { getBookingById, getUserProfile } from "@/lib/actions"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { Booking, Passenger, User } from "@/lib/definitions"

export default function BookingTicketPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [booking, setBooking] = useState<Booking | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ticketRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return
    
    const canvas = await html2canvas(ticketRef.current, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`ticket-${booking?.booking_id || 'unknown'}.pdf`)
  }

  const handlePrintPDF = async () => {
    if (!ticketRef.current) return
    
    const canvas = await html2canvas(ticketRef.current, { 
      scale: 2,
      useCORS: true,
      allowTaint: true
    })
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket Print</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
              @media print {
                body { margin: 0; padding: 0; }
                img { width: 100%; height: auto; }
              }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL('image/png')}" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 200);
              }
            </script>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const handleShare = async () => {
    if (!ticketRef.current) return
    
    try {
      const canvas = await html2canvas(ticketRef.current, { 
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        const file = new File([blob], 'ticket.png', { type: 'image/png' })
        
        if (navigator.share) {
          await navigator.share({
            title: 'My Shuttle Ticket',
            files: [file],
          })
        } else {
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = 'ticket.png'
          link.click()
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!id) return

      try {
        setLoading(true)
        const bookingData = await getBookingById(id)

        if (!bookingData) {
          setError("Booking not found")
          return
        }

        setBooking(bookingData)

        if (bookingData.user_id) {
          const userData = await getUserProfile(bookingData.user_id)
          setCurrentUser(userData)
        }
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError("Failed to load booking details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const qrCodeData = booking
    ? {
        bookingId: booking.booking_id,
        departureDate: booking.departure_date,
        departureTime: booking.departure_time,
        passengers: (booking.passengers || []).map(p => ({
          name: `${p.first_name} ${p.last_name}`,
          idNumber: p.id_number
        })),
        route: `${booking.route?.departure_location || ""} to ${booking.route?.arrival_location || ""}`,
        timestamp: Date.now(),
        shuttleType: booking.shuttle?.type || "Standard",
        shuttleCategory: booking.shuttle?.category || "Regular",
        isPremium: booking.is_premium,
        pickupAddress: booking.pickup_address,
        dropoffAddress: booking.dropoff_address,
      }
    : null

  const getFacilities = () => {
    if (!booking?.shuttle?.facilities) return []

    try {
      if (typeof booking.shuttle.facilities === "string") {
        return JSON.parse(booking.shuttle.facilities)
      }
      return booking.shuttle.facilities
    } catch (e) {
      console.error("Error parsing facilities:", e)
      return []
    }
  }

  const getPassengerNames = () => {
    if (booking?.passengers && booking.passengers.length > 0) {
      return booking.passengers.map((passenger) => `${passenger.first_name} ${passenger.last_name}`).join(", ")
    }

    if (currentUser) {
      return `${currentUser.first_name} ${currentUser.last_name}`
    }

    return "No passenger details available"
  }

  const createFallbackPassenger = (): Passenger => {
    if (!currentUser) {
      return {
        first_name: "Unknown",
        last_name: "Passenger",
        id_type: "Unknown",
        id_number: "Unknown",
        booking_id: "Unknown",
        shuttle_id: "Unknown",
      }
    }

    return {
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      id_type: currentUser.id_type || "ID",
      id_number: currentUser.id_number || "Not provided",
      booking_id: booking?.booking_id || "Unknown",
      shuttle_id: booking?.shuttle_id || "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#006400] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-lg font-medium">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <SiteHeader isLoggedIn={true} userType="student" userName="Ibrahim Mohammed" userInitials="IM" />
        <div className="container px-4 py-12 mx-auto text-center">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Button asChild>
              <Link href="/my-bookings">View My Bookings</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <SiteHeader isLoggedIn={true} userType="student" userName="Ibrahim Mohammed" userInitials="IM" />
        <div className="container px-4 py-12 mx-auto text-center">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
            <p className="text-gray-700 mb-6">We couldn't find the booking you're looking for.</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const facilities = getFacilities()
  const isPremium = booking.is_premium
  const passengerNames = getPassengerNames()
  const displayPassengers = booking.passengers && booking.passengers.length > 0 ? booking.passengers : [createFallbackPassenger()]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader isLoggedIn={true} userType="student" userName="Ibrahim Mohammed" userInitials="IM" />

      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center mb-6 space-x-2">
          <Link href="/" className="text-sm text-gray-500 hover:text-[#006400]">
            Home
          </Link>
          <span className="text-sm text-gray-500">/</span>
          <Link href="/my-bookings" className="text-sm text-gray-500 hover:text-[#006400]">
            My Bookings
          </Link>
          <span className="text-sm text-gray-500">/</span>
          <span className="text-sm font-medium">Ticket</span>
        </div>

        <div className="flex items-center mb-6">
          <Link href="/my-bookings" className="flex items-center text-sm text-[#006400] hover:underline">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to my bookings
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <div ref={ticketRef} className="printable-ticket">
            <Card className={`border-t-4 ${isPremium ? "border-amber-500" : "border-[#006400]"} mb-6`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">E-Ticket</CardTitle>
                  <p className="text-sm text-gray-500">Booking ID: {booking.booking_id}</p>
                </div>
                <div>
                  <Badge className={isPremium ? "bg-amber-500" : "bg-[#006400]"}>
                    {isPremium ? "Premium" : "Standard"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className={`p-4 rounded-lg ${isPremium ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-200"}`}>
                  <div className="flex items-center mb-2">
                    <Users2Icon className={`w-5 h-5 mr-2 ${isPremium ? "text-amber-600" : "text-[#006400]"}`} />
                    <h3 className={`font-semibold ${isPremium ? "text-amber-700" : "text-[#006400]"}`}>Passenger(s)</h3>
                  </div>
                  <p className="text-lg font-medium">{passengerNames}</p>

                  {(!booking.passengers || booking.passengers.length === 0) && currentUser && (
                    <div className="flex items-center mt-2 text-sm text-amber-600">
                      <AlertCircleIcon className="w-4 h-4 mr-1" />
                      <p>Using account holder details as passenger information</p>
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-lg ${isPremium ? "bg-amber-50" : "bg-gray-50"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${isPremium ? "text-amber-700" : "text-[#006400]"}`}>
                        {booking.shuttle?.type || "Campus Shuttle"}
                      </h3>
                      <p className="text-sm text-gray-500">{booking.shuttle?.category || "Regular"} Shuttle</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {facilities.map((facility: string, i: number) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className={`text-xs ${isPremium ? "border-amber-300 text-amber-700" : "border-[#006400] text-[#006400]"}`}
                        >
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xl font-semibold">{booking.departure_time}</p>
                      <p className="text-sm text-gray-500">{formatDate(booking.departure_date)}</p>
                      <p className="text-sm text-gray-500">{booking.route?.departure_location}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-full">
                        <Separator className="absolute top-1/2 w-full" />
                        <div className="relative flex justify-center">
                          <Badge
                            variant="outline"
                            className={`px-2 py-0 text-xs bg-white ${isPremium ? "border-amber-300 text-amber-700" : "border-[#006400] text-[#006400]"}`}
                          >
                            {booking.arrival_time
                              ? calculateDuration(booking.departure_time, booking.arrival_time)
                              : "45m"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">{booking.arrival_time}</p>
                      <p className="text-sm text-gray-500">{formatDate(booking.departure_date)}</p>
                      <p className="text-sm text-gray-500">{booking.route?.arrival_location}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md bg-white">
                    <div className="flex items-center mb-3">
                      <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <h3 className="font-medium">Travel Date</h3>
                    </div>
                    <p className="text-lg">{formatDate(booking.departure_date)}</p>
                  </div>

                  <div className="p-4 border rounded-md bg-white">
                    <div className="flex items-center mb-3">
                      <ClockIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <h3 className="font-medium">Departure Time</h3>
                    </div>
                    <p className="text-lg">{booking.departure_time}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Passenger Details</h3>
                  <div className="space-y-3">
                    {displayPassengers.map((passenger: Passenger, index: number) => (
                      <div key={index} className="p-4 border rounded-md bg-white">
                        <div className="flex items-start">
                          <UserIcon className="w-5 h-5 mr-3 mt-1 text-gray-400" />
                          <div className="space-y-2 flex-1">
                            <div>
                              <p className="font-medium text-lg">{`${passenger.first_name} ${passenger.last_name}`}</p>
                              <div className="flex items-center mt-1">
                                <IdCardIcon className="w-4 h-4 mr-1 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  {passenger.id_type}: {passenger.id_number}
                                </p>
                              </div>
                            </div>

                            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">First Name:</span> {passenger.first_name}
                              </div>
                              <div>
                                <span className="font-medium">Last Name:</span> {passenger.last_name}
                              </div>
                            </div>

                            {(!booking.passengers || booking.passengers.length === 0) && index === 0 && (
                              <div className="mt-2 p-2 bg-amber-50 text-amber-700 text-sm rounded-md">
                                <AlertCircleIcon className="w-4 h-4 inline-block mr-1" />
                                Using account holder details as passenger information
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="p-4 border rounded-md bg-white">
                    <div className="space-y-3">
                      {booking.contactInfo?.email && (
                        <div className="flex items-center">
                          <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p>{booking.contactInfo.email}</p>
                          </div>
                        </div>
                      )}

                      {booking.contactInfo?.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p>{booking.contactInfo.phone}</p>
                          </div>
                        </div>
                      )}

                      {booking.contactInfo?.special_requests && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Special Request</p>
                          <p className="p-2 bg-gray-50 rounded text-gray-700">{booking.contactInfo.special_requests}</p>
                        </div>
                      )}

                      {(!booking.contactInfo || (!booking.contactInfo.email && !booking.contactInfo.phone)) &&
                        currentUser && (
                          <>
                            <div className="flex items-center">
                              <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p>{currentUser.email}</p>
                              </div>
                            </div>

                            {currentUser.phone_number && (
                              <div className="flex items-center">
                                <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-500">Phone</p>
                                  <p>{currentUser.phone_number}</p>
                                </div>
                              </div>
                            )}

                            <div className="mt-2 p-2 bg-amber-50 text-amber-700 text-sm rounded-md">
                              <AlertCircleIcon className="w-4 h-4 inline-block mr-1" />
                              Using account holder contact information
                            </div>
                          </>
                        )}

                      {!booking.contactInfo && !currentUser && (
                        <p className="text-gray-500 text-center">No contact information available</p>
                      )}
                    </div>
                  </div>
                </div>

                {isPremium && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-2">Premium Service Details</h3>

                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPinIcon className="w-4 h-4 mt-1 mr-2 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">Pickup Address</p>
                          <p className="text-sm text-amber-600">{booking.pickup_address || "Not specified"}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPinIcon className="w-4 h-4 mt-1 mr-2 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">Dropoff Address</p>
                          <p className="text-sm text-amber-600">{booking.dropoff_address || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                  <div className="p-4 border rounded-md bg-white">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Price</span>
                      <span>{formatCurrency(booking.price)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-500">Service Fee</span>
                      <span>{formatCurrency(booking.total_amount - booking.price)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className={isPremium ? "text-amber-700" : "text-[#006400]"}>
                        {formatCurrency(booking.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="p-6 border-2 border-dashed rounded-lg bg-white">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold mb-1">Scan this QR code at the terminal</h3>
                      <p className="text-sm text-gray-500">
                        Present this to the driver or terminal staff for verification
                      </p>
                    </div>

                    <div className="flex justify-center">
                      {qrCodeData && <TicketQRCode data={qrCodeData} size={200} isPremium={isPremium} />}
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        <CheckCircleIcon className="inline-block w-4 h-4 mr-1 text-green-500" />
                        Valid for travel on {formatDate(booking.departure_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" className="flex items-center gap-2" onClick={handlePrintPDF}>
                  <PrinterIcon className="w-4 h-4" />
                  Print Ticket
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadPDF}>
                  <DownloadIcon className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={handleShare}>
                  <ShareIcon className="w-4 h-4" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="text-center mb-8">
            <Link href="/my-bookings" className="text-[#006400] hover:underline">
              View all my bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function calculateDuration(startTime: string, endTime: string): string {
  try {
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    let durationMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)
    if (durationMinutes < 0) durationMinutes += 24 * 60

    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  } catch (e) {
    console.error("Error calculating duration:", e)
    return "45m"
  }
}