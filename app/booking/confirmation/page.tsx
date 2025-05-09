
// "use client"

// import { useState, useEffect , useRef} from "react"
// import Link from "next/link"
// import { useSearchParams } from "next/navigation"
// import {
//   CalendarIcon,
//   CheckCircleIcon,
//   ClockIcon,
//   DownloadIcon,
//   MapPinIcon,
//   PrinterIcon,
//   ShareIcon,
// } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"
// import { Badge } from "@/components/ui/badge"
// import { SiteHeader } from "@/components/site-header"
// import { TicketQRCode } from "@/components/ticket-qr-code"
// import { getBookingById } from "@/lib/actions"
// import jsPDF from "jspdf"
// import html2canvas from "html2canvas"

// export default function ConfirmationPage() {
//   const searchParams = useSearchParams()
//   const bookingId = searchParams.get("booking_id")

//   const [bookingDetails, setBookingDetails] = useState<any>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   // User authentication state
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [userType, setUserType] = useState<"student" | "staff" | "admin" | "driver" | undefined>("student")
//   const [userName, setUserName] = useState("")
//   const [userInitials, setUserInitials] = useState("")
//   const ticketRef = useRef<HTMLDivElement>(null)

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

//     // Get booking details from localStorage or fetch from API
//     const storedBookingDetails = localStorage.getItem("currentBookingDetails")

//     if (storedBookingDetails) {
//       setBookingDetails(JSON.parse(storedBookingDetails))
//       setIsLoading(false)
//     } else if (bookingId) {
//       fetchBookingDetails(bookingId)
//     } else {
//       // Fallback to sample data if no booking ID or stored details
//       setBookingDetails(sampleBookingDetails)
//       setIsLoading(false)
//     }
//   }, [bookingId])

//   const fetchBookingDetails = async (id: string) => {
//     try {
//       const booking = await getBookingById(id)

//       if (booking) {
//         // Transform booking data to match the expected format
//         const formattedBooking = {
//           bookingId: booking.booking_id,
//           type: booking.shuttle?.type || "Campus Bus",
//           category: booking.user_id ? "Student" : "Guest",
//           departureTime: booking.departure_time,
//           arrivalTime: booking.arrival_time,
//           duration: calculateDuration(booking.departure_time, booking.arrival_time),
//           departureDate: new Date(booking.departure_date).toLocaleDateString("en-US", {
//             month: "long",
//             day: "numeric",
//             year: "numeric",
//           }),
//           departureLocation: booking.route?.departure_location || booking.pickup_address || "Main Campus Terminal",
//           arrivalLocation: booking.route?.arrival_location || booking.dropoff_address || "Kongo Campus Terminal",
//           price: booking.price || booking.route?.base_price || 150,
//           facilities: booking.shuttle?.facilities
//             ? Array.isArray(booking.shuttle.facilities)
//               ? booking.shuttle.facilities
//               : JSON.parse(booking.shuttle.facilities)
//             : ["WiFi", "Air Conditioning"],
//           passengers:
//             booking.passengers?.map((p: any) => ({
//               name: p.name || `${p.first_name} ${p.last_name}`,
//               idType: p.id_type === "student_id" ? "Student ID" : p.id_type === "staff_id" ? "Staff ID" : "National ID",
//               idNumber: p.id_number,
//             })) || [],
//           contactEmail: booking.contactInfo?.email || "",
//           contactPhone: booking.contactInfo?.phone || "",
//           paymentMethod: "Pay on Boarding",
//           totalAmount: booking.total_amount || 380,
//           isPremium: booking.is_premium || false,
//           shuttleType: booking.shuttle?.type || "Standard",
//           shuttleCategory: booking.shuttle?.category || "Campus",
//         }

//         setBookingDetails(formattedBooking)

//         // Store in localStorage for future reference
//         localStorage.setItem("currentBookingDetails", JSON.stringify(formattedBooking))
//       }
//     } catch (error) {
//       console.error("Error fetching booking details:", error)
//       // Fallback to sample data
//       setBookingDetails(sampleBookingDetails)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const calculateDuration = (departureTime: string, arrivalTime: string) => {
//     try {
//       const [depHours, depMinutes] = departureTime.split(":").map(Number)
//       const [arrHours, arrMinutes] = arrivalTime.split(":").map(Number)

//       let totalMinutes = arrHours * 60 + arrMinutes - (depHours * 60 + depMinutes)
//       if (totalMinutes < 0) totalMinutes += 24 * 60 // Handle overnight trips

//       const hours = Math.floor(totalMinutes / 60)
//       const minutes = totalMinutes % 60

//       return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
//     } catch (e) {
//       return "45m" // Default duration
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#f5f5f5]">
//         <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />
//         <div className="container px-4 py-8 mx-auto">
//           <div className="max-w-3xl mx-auto">
//             <div className="flex flex-col items-center justify-center mb-8 text-center">
//               <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 animate-pulse"></div>
//               <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
//               <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
//             </div>
//             <div className="space-y-6">
//               <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
//               <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
//               <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Prepare QR code data
//   const qrCodeData = {
//     bookingId: bookingDetails.bookingId,
//     departureDate: bookingDetails.departureDate,
//     departureTime: bookingDetails.departureTime,
//     passengers: bookingDetails.passengers.map((p: any) => ({
//       name: p.name,
//       idNumber: p.idNumber,
//     })),
//     route: `${bookingDetails.departureLocation} to ${bookingDetails.arrivalLocation}`,
//     timestamp: Date.now(),
//     shuttleType: bookingDetails.shuttleType,
//     shuttleCategory: bookingDetails.shuttleCategory,
//     isPremium: bookingDetails.isPremium,
//     pickupAddress: bookingDetails.departureLocation,
//     dropoffAddress: bookingDetails.arrivalLocation,
//   }
//   const handleDownloadPDF = async () => {
//     if (!ticketRef.current) return

//     try {
//       const canvas = await html2canvas(ticketRef.current)
//       const imgData = canvas.toDataURL("image/png")
//       const pdf = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//       })

//       const imgWidth = 210 // A4 width in mm
//       const imgHeight = (canvas.height * imgWidth) / canvas.width

//       pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
//       pdf.save(`ABU-Ticket-${bookingDetails.bookingId}.pdf`)
//     } catch (error) {
//       console.error("Error generating PDF:", error)
//     }
//   }
//   const handlePrintPDF = async () => {
//     if (!ticketRef.current) return

//     try {
//       const canvas = await html2canvas(ticketRef.current)
//       const imgData = canvas.toDataURL("image/png")
//       const pdf = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//       })

//       const imgWidth = 210
//       const imgHeight = (canvas.height * imgWidth) / canvas.width

//       pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
//       pdf.autoPrint()
//       window.open(pdf.output('bloburl'), '_blank')
//     } catch (error) {
//       console.error("Error printing PDF:", error)
//     }
//   }
//   const handleSharePDF = async () => {
//     if (!ticketRef.current) return

//     try {
//       const canvas = await html2canvas(ticketRef.current)
//       const imgData = canvas.toDataURL("image/png")
//       const pdf = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//       })

//       const imgWidth = 210
//       const imgHeight = (canvas.height * imgWidth) / canvas.width

//       pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
//       const blob = pdf.output("blob")
//       const url = URL.createObjectURL(blob)
//       const file = new File([blob], `ABU-Ticket-${bookingDetails.bookingId}.pdf`, { type: "application/pdf" })

//       // Share the PDF using the Web Share API
//       if (navigator.canShare && navigator.canShare({ files: [file] })) {
//         await navigator.share({
//           title: `ABU Ticket - ${bookingDetails.bookingId}`,
//           text: "Check out my ticket!",
//           files: [new File([blob], `ABU-Ticket-${bookingDetails.bookingId}.pdf`, { type: "application/pdf" })],
//         })
//       } else {
//         alert("Sharing is not supported on this device.")
//       }
//     } catch (error) {
//       console.error("Error sharing PDF:", error)
//     }
//   }
//   return (
//     <div className="min-h-screen bg-[#f5f5f5]">
//       <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />

//       <div className="container px-4 py-8 mx-auto">
//         <div className="max-w-3xl mx-auto">
//           <div className="flex flex-col items-center justify-center mb-8 text-center">
//             <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100">
//               <CheckCircleIcon className="w-8 h-8 text-[#006400]" />
//             </div>
//             <h1 className="text-2xl font-bold text-[#006400]">Booking Confirmed!</h1>
//             <p className="mt-2 text-gray-500">
//               Your booking has been confirmed. Your booking ID is{" "}
//               <span className="font-semibold">{bookingDetails.bookingId}</span>
//             </p>
//             <p className="mt-1 text-gray-500">A confirmation email has been sent to {bookingDetails.contactEmail}</p>
//           </div>

//           <Card className="mb-6 border-t-2 border-[#006400]">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-[#006400]">E-Ticket</CardTitle>
//               <CardDescription>Your electronic ticket details</CardDescription>
//             </CardHeader>
//             <CardContent>
//             <div ref={ticketRef}>

//               <div className="p-4 mb-4 border border-dashed border-[#006400] rounded-lg">
//                 <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//                   <div>
//                     <h3 className="text-lg font-semibold text-[#006400]">{bookingDetails.type}</h3>
//                     <p className="text-sm text-gray-500">{bookingDetails.category} Shuttle</p>
//                   </div>
//                   <div className="flex gap-2">
//                     {bookingDetails.facilities.map((facility: string, i: number) => (
//                       <Badge key={i} variant="outline" className="text-xs border-[#006400] text-[#006400]">
//                         {facility}
//                       </Badge>
//                     ))}
//                     {bookingDetails.isPremium && <Badge className="text-xs bg-amber-500">Premium</Badge>}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//                   <div>
//                     <p className="text-xl font-semibold">{bookingDetails.departureTime}</p>
//                     <p className="text-sm text-gray-500">{bookingDetails.departureDate}</p>
//                     <p className="text-sm text-gray-500">{bookingDetails.departureLocation}</p>
//                   </div>
//                   <div className="flex flex-col items-center justify-center">
//                     <div className="relative w-full">
//                       <Separator className="absolute top-1/2 w-full" />
//                       <div className="relative flex justify-center">
//                         <Badge variant="outline" className="px-2 py-0 text-xs bg-white border-[#006400] text-[#006400]">
//                           {bookingDetails.duration}
//                         </Badge>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xl font-semibold">{bookingDetails.arrivalTime}</p>
//                     <p className="text-sm text-gray-500">{bookingDetails.departureDate}</p>
//                     <p className="text-sm text-gray-500">{bookingDetails.arrivalLocation}</p>
//                   </div>
//                 </div>

//                 <Separator className="my-4" />

//                 <div className="grid gap-4 md:grid-cols-2">
//                   <div>
//                     <h4 className="mb-2 text-sm font-medium">Passenger Details</h4>
//                     <ul className="space-y-2">
//                       {bookingDetails.passengers.map((passenger: any, index: number) => (
//                         <li key={index} className="text-sm">
//                           <span className="font-medium">{passenger.name}</span>
//                           <div className="text-gray-500">
//                             {passenger.idType}: {passenger.idNumber}
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                   <div>
//                     <h4 className="mb-2 text-sm font-medium">Contact Information</h4>
//                     <div className="text-sm">
//                       <p>{bookingDetails.contactEmail}</p>
//                       <p>{bookingDetails.contactPhone}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* QR Code Section */}
//               <div className="flex flex-col items-center justify-center my-6 p-4 border border-dashed border-[#006400] rounded-lg bg-white">
//                 <h4 className="mb-4 text-sm font-medium text-center">Scan this QR code at the terminal</h4>
//                 <TicketQRCode data={qrCodeData} size={200} isPremium={bookingDetails.isPremium} />
//                 <p className="mt-4 text-xs text-center text-gray-500">
//                   Present this QR code to the driver or terminal staff for verification
//                 </p>
//               </div>
            

//               <div className="flex flex-wrap gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="gap-2 text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
//                   onClick={handleDownloadPDF}
//                 >
//                   <DownloadIcon className="w-4 h-4" />
//                   Download Ticket
//                 </Button>
//                 <Button
//                   onClick={handlePrintPDF}
//                   variant="outline"
//                   size="sm"
//                   className="gap-2 text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
//                 >
//                   <PrinterIcon className="w-4 h-4" />
//                   Print Ticket
//                 </Button>
//                 <Button
//                   onClick={handleSharePDF}
//                   variant="outline"
//                   size="sm"
//                   className="gap-2 text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
//                 >
//                   <ShareIcon className="w-4 h-4" />
//                   Share Ticket
//                 </Button>
//               </div>
//             </div>
//             </CardContent>
//           </Card>

//           <Card className="mb-6 border-t-2 border-[#006400]">
//             <CardHeader>
//               <CardTitle className="text-[#006400]">Booking Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid gap-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Booking ID</span>
//                   <span className="font-medium">{bookingDetails.bookingId}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Booking Date</span>
//                   <span>{new Date().toLocaleDateString()}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Payment Method</span>
//                   <span>{bookingDetails.paymentMethod}</span>
//                 </div>
//               </div>

//               <Separator />

//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Base Fare ({bookingDetails.passengers.length} passengers)</span>
//                   <span>₦{bookingDetails.price * bookingDetails.passengers.length}</span>
//                 </div>
//                 {bookingDetails.isPremium && (
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Premium Service</span>
//                     <span>+₦{Math.round(bookingDetails.price * 0.5 * bookingDetails.passengers.length)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Service Fee</span>
//                   <span>₦50</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Tax</span>
//                   <span>₦{Math.round(bookingDetails.price * bookingDetails.passengers.length * 0.05)}</span>
//                 </div>
//                 <Separator />
//                 <div className="flex justify-between font-semibold">
//                   <span>Total</span>
//                   <span className="text-[#006400]">₦{bookingDetails.totalAmount}</span>
//                 </div>
//               </div>
//             </CardContent>
//             <CardFooter>
//               <Button asChild className="w-full bg-[#006400] hover:bg-[#005000]">
//                 <Link href={`/my-bookings`}>View My Bookings</Link>
//               </Button>
//             </CardFooter>
//           </Card>

//           <Card className="border-t-2 border-[#006400]">
//             <CardHeader>
//               <CardTitle className="text-[#006400]">Important Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-start gap-3">
//                 <ClockIcon className="w-5 h-5 mt-0.5 text-gray-500" />
//                 <div>
//                   <h4 className="font-medium">Arrival Time</h4>
//                   <p className="text-sm text-gray-500">
//                     Please arrive at the terminal at least 15 minutes before departure time.
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <MapPinIcon className="w-5 h-5 mt-0.5 text-gray-500" />
//                 <div>
//                   <h4 className="font-medium">Boarding Point</h4>
//                   <p className="text-sm text-gray-500">{bookingDetails.departureLocation}, Gate 2</p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-3">
//                 <CalendarIcon className="w-5 h-5 mt-0.5 text-gray-500" />
//                 <div>
//                   <h4 className="font-medium">Cancellation Policy</h4>
//                   <p className="text-sm text-gray-500">
//                     Free cancellation up to 2 hours before departure. No refund if cancelled within 2 hours.
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//             <CardFooter className="flex flex-col items-start gap-4">
//               <p className="text-sm text-gray-500">
//                 For any assistance, please contact our support at support@abutiket.edu.ng or call +234 8012 345 678.
//               </p>
//               <div className="flex gap-4">
//                 <Button asChild className="bg-[#006400] hover:bg-[#005000]">
//                   <Link href="/">Return to Home</Link>
//                 </Button>
//                 <Button variant="outline" asChild className="text-[#006400] border-[#006400] hover:bg-[#e6f2e6]">
//                   <Link href="/my-bookings">View My Bookings</Link>
//                 </Button>
//               </div>
//             </CardFooter>
//           </Card>
//         </div>
//       </div>

//       <footer className="py-8 mt-12 bg-[#006400] text-white">
//         <div className="container px-4 mx-auto">
//           <div className="grid gap-8 md:grid-cols-4">
//             <div>
//               <h4 className="mb-4 text-sm font-semibold uppercase">ABU Tiket</h4>
//               <p className="text-sm text-green-200">
//                 Ahmadu Bello University's official transportation booking platform.
//               </p>
//             </div>
//             <div>
//               <h4 className="mb-4 text-sm font-semibold uppercase">University</h4>
//               <ul className="space-y-2 text-sm">
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     About ABU
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     Campus Map
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     Faculties
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="mb-4 text-sm font-semibold uppercase">Support</h4>
//               <ul className="space-y-2 text-sm">
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     Help Center
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     Contact Us
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     FAQs
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="mb-4 text-sm font-semibold uppercase">Legal</h4>
//               <ul className="space-y-2 text-sm">
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     Terms of Service
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     Privacy Policy
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-green-200 hover:text-white">
//                     Student Guidelines
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </div>
//           <div className="pt-8 mt-8 text-sm text-center text-green-200 border-t border-green-700">
//             © {new Date().getFullYear()} Ahmadu Bello University, Zaria. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }

// // Sample booking details for fallback
// const sampleBookingDetails = {
//   bookingId: "ABU-12345678",
//   type: "Campus Bus",
//   category: "Student",
//   departureTime: "07:30",
//   arrivalTime: "08:15",
//   duration: "45m",
//   departureDate: "April 20, 2025",
//   departureLocation: "Main Campus Terminal",
//   arrivalLocation: "Kongo Campus Terminal",
//   price: 150,
//   facilities: ["WiFi", "Air Conditioning"],
//   passengers: [
//     { name: "John Doe", idType: "Student ID", idNumber: "ABU/2023/12345" },
//     { name: "Jane Doe", idType: "Student ID", idNumber: "ABU/2023/67890" },
//   ],
//   contactEmail: "john.doe@example.com",
//   contactPhone: "+234 812 3456 7890",
//   paymentMethod: "Pay on Boarding",
//   totalAmount: 380,
//   isPremium: false,
//   shuttleType: "Standard",
//   shuttleCategory: "Campus",
// }
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  MapPinIcon,
  PrinterIcon,
  ShareIcon,
} from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { TicketQRCode } from "@/components/ticket-qr-code"
import { getBookingById } from "@/lib/actions"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking_id")
  const ticketRef = useRef<HTMLDivElement>(null)

  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"student" | "staff" | "admin" | "driver" | undefined>("student")
  const [userName, setUserName] = useState("")
  const [userInitials, setUserInitials] = useState("")

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return
    
    const canvas = await html2canvas(ticketRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`ticket-${bookingDetails.bookingId}.pdf`)
  }

  const handlePrintPDF = async () => {
    if (!ticketRef.current) return
    
    const canvas = await html2canvas(ticketRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.autoPrint()
    window.open(pdf.output('bloburl'), '_blank')
  }

  const handleShare = async () => {
    if (!ticketRef.current) return
    
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2 })
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
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUserType = localStorage.getItem("userType") as "student" | "staff" | "admin" | "driver" | undefined
    const storedUserName = localStorage.getItem("userName")
    const storedUserInitials = localStorage.getItem("userInitials")

    if (storedIsLoggedIn) {
      setIsLoggedIn(true)
      if (storedUserType) setUserType(storedUserType)
      if (storedUserName) setUserName(storedUserName)
      if (storedUserInitials) setUserInitials(storedUserInitials)
    }

    const storedBookingDetails = localStorage.getItem("currentBookingDetails")

    if (storedBookingDetails) {
      setBookingDetails(JSON.parse(storedBookingDetails))
      setIsLoading(false)
    } else if (bookingId) {
      fetchBookingDetails(bookingId)
    } else {
      setBookingDetails(sampleBookingDetails)
      setIsLoading(false)
    }
  }, [bookingId])

  const fetchBookingDetails = async (id: string) => {
    try {
      const booking = await getBookingById(id)

      if (booking) {
        const formattedBooking = {
          bookingId: booking.booking_id,
          type: booking.shuttle?.type || "Campus Bus",
          category: booking.user_id ? "Student" : "Guest",
          departureTime: booking.departure_time,
          arrivalTime: booking.arrival_time,
          duration: calculateDuration(booking.departure_time, booking.arrival_time),
          departureDate: new Date(booking.departure_date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          departureLocation: booking.route?.departure_location || booking.pickup_address || "Main Campus Terminal",
          arrivalLocation: booking.route?.arrival_location || booking.dropoff_address || "Kongo Campus Terminal",
          price: booking.price || booking.route?.base_price || 150,
          facilities: booking.shuttle?.facilities
            ? Array.isArray(booking.shuttle.facilities)
              ? booking.shuttle.facilities
              : JSON.parse(booking.shuttle.facilities)
            : ["WiFi", "Air Conditioning"],
          passengers:
            booking.passengers?.map((p: any) => ({
              name: p.name || `${p.first_name} ${p.last_name}`,
              idType: p.id_type === "student_id" ? "Student ID" : p.id_type === "staff_id" ? "Staff ID" : "National ID",
              idNumber: p.id_number,
            })) || [],
          contactEmail: booking.contactInfo?.email || "",
          contactPhone: booking.contactInfo?.phone || "",
          paymentMethod: "Pay on Boarding",
          totalAmount: booking.total_amount || 380,
          isPremium: booking.is_premium || false,
          shuttleType: booking.shuttle?.type || "Standard",
          shuttleCategory: booking.shuttle?.category || "Campus",
        }

        setBookingDetails(formattedBooking)
        localStorage.setItem("currentBookingDetails", JSON.stringify(formattedBooking))
      }
    } catch (error) {
      console.error("Error fetching booking details:", error)
      setBookingDetails(sampleBookingDetails)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    try {
      const [depHours, depMinutes] = departureTime.split(":").map(Number)
      const [arrHours, arrMinutes] = arrivalTime.split(":").map(Number)

      let totalMinutes = arrHours * 60 + arrMinutes - (depHours * 60 + depMinutes)
      if (totalMinutes < 0) totalMinutes += 24 * 60

      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    } catch (e) {
      return "45m"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />
        <div className="container px-4 py-8 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center mb-8 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const qrCodeData = {
    bookingId: bookingDetails.bookingId,
    departureDate: bookingDetails.departureDate,
    departureTime: bookingDetails.departureTime,
    passengers: bookingDetails.passengers.map((p: any) => ({
      name: p.name,
      idNumber: p.idNumber,
    })),
    route: `${bookingDetails.departureLocation} to ${bookingDetails.arrivalLocation}`,
    timestamp: Date.now(),
    shuttleType: bookingDetails.shuttleType,
    shuttleCategory: bookingDetails.shuttleCategory,
    isPremium: bookingDetails.isPremium,
    pickupAddress: bookingDetails.departureLocation,
    dropoffAddress: bookingDetails.arrivalLocation,
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <SiteHeader isLoggedIn={isLoggedIn} userType={userType} userName={userName} userInitials={userInitials} />

      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100">
              <CheckCircleIcon className="w-8 h-8 text-[#006400]" />
            </div>
            <h1 className="text-2xl font-bold text-[#006400]">Booking Confirmed!</h1>
            <p className="mt-2 text-gray-500">
              Your booking has been confirmed. Your booking ID is{" "}
              <span className="font-semibold">{bookingDetails.bookingId}</span>
            </p>
            <p className="mt-1 text-gray-500">A confirmation email has been sent to {bookingDetails.contactEmail}</p>
          </div>

          <Card className="mb-6 border-t-2 border-[#006400]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#006400]">E-Ticket</CardTitle>
              <CardDescription>Your electronic ticket details</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={ticketRef}>
                <div className="p-4 mb-4 border border-dashed border-[#006400] rounded-lg">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#006400]">{bookingDetails.type}</h3>
                      <p className="text-sm text-gray-500">{bookingDetails.category} Shuttle</p>
                    </div>
                    <div className="flex gap-2">
                      {bookingDetails.facilities.map((facility: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs border-[#006400] text-[#006400]">
                          {facility}
                        </Badge>
                      ))}
                      {bookingDetails.isPremium && <Badge className="text-xs bg-amber-500">Premium</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xl font-semibold">{bookingDetails.departureTime}</p>
                      <p className="text-sm text-gray-500">{bookingDetails.departureDate}</p>
                      <p className="text-sm text-gray-500">{bookingDetails.departureLocation}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-full">
                        <Separator className="absolute top-1/2 w-full" />
                        <div className="relative flex justify-center">
                          <Badge variant="outline" className="px-2 py-0 text-xs bg-white border-[#006400] text-[#006400]">
                            {bookingDetails.duration}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">{bookingDetails.arrivalTime}</p>
                      <p className="text-sm text-gray-500">{bookingDetails.departureDate}</p>
                      <p className="text-sm text-gray-500">{bookingDetails.arrivalLocation}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Passenger Details</h4>
                      <ul className="space-y-2">
                        {bookingDetails.passengers.map((passenger: any, index: number) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{passenger.name}</span>
                            <div className="text-gray-500">
                              {passenger.idType}: {passenger.idNumber}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Contact Information</h4>
                      <div className="text-sm">
                        <p>{bookingDetails.contactEmail}</p>
                        <p>{bookingDetails.contactPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center my-6 p-4 border border-dashed border-[#006400] rounded-lg bg-white">
                  <h4 className="mb-4 text-sm font-medium text-center">Scan this QR code at the terminal</h4>
                  <TicketQRCode data={qrCodeData} size={200} isPremium={bookingDetails.isPremium} />
                  <p className="mt-4 text-xs text-center text-gray-500">
                    Present this QR code to the driver or terminal staff for verification
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
                  onClick={handleDownloadPDF}
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download Ticket
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
                  onClick={handlePrintPDF}
                >
                  <PrinterIcon className="w-4 h-4" />
                  Print Ticket
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-[#006400] border-[#006400] hover:bg-[#e6f2e6]"
                  onClick={handleShare}
                >
                  <ShareIcon className="w-4 h-4" />
                  Share Ticket
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-t-2 border-[#006400]">
            <CardHeader>
              <CardTitle className="text-[#006400]">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-medium">{bookingDetails.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking Date</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span>{bookingDetails.paymentMethod}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Fare ({bookingDetails.passengers.length} passengers)</span>
                  <span>₦{bookingDetails.price * bookingDetails.passengers.length}</span>
                </div>
                {bookingDetails.isPremium && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Premium Service</span>
                    <span>+₦{Math.round(bookingDetails.price * 0.5 * bookingDetails.passengers.length)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Fee</span>
                  <span>₦50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>₦{Math.round(bookingDetails.price * bookingDetails.passengers.length * 0.05)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-[#006400]">₦{bookingDetails.totalAmount}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-[#006400] hover:bg-[#005000]">
                <Link href={`/my-bookings`}>View My Bookings</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-t-2 border-[#006400]">
            <CardHeader>
              <CardTitle className="text-[#006400]">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 mt-0.5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Arrival Time</h4>
                  <p className="text-sm text-gray-500">
                    Please arrive at the terminal at least 15 minutes before departure time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 mt-0.5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Boarding Point</h4>
                  <p className="text-sm text-gray-500">{bookingDetails.departureLocation}, Gate 2</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 mt-0.5 text-gray-500" />
                <div>
                  <h4 className="font-medium">Cancellation Policy</h4>
                  <p className="text-sm text-gray-500">
                    Free cancellation up to 2 hours before departure. No refund if cancelled within 2 hours.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <p className="text-sm text-gray-500">
                For any assistance, please contact our support at support@abutiket.edu.ng or call +234 8012 345 678.
              </p>
              <div className="flex gap-4">
                <Button asChild className="bg-[#006400] hover:bg-[#005000]">
                  <Link href="/">Return to Home</Link>
                </Button>
                <Button variant="outline" asChild className="text-[#006400] border-[#006400] hover:bg-[#e6f2e6]">
                  <Link href="/my-bookings">View My Bookings</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <footer className="py-8 mt-12 bg-[#006400] text-white">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">ABU Tiket</h4>
              <p className="text-sm text-green-200">
                Ahmadu Bello University's official transportation booking platform.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">University</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    About ABU
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Campus Map
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Faculties
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-green-200 hover:text-white">
                    Student Guidelines
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 text-sm text-center text-green-200 border-t border-green-700">
            © {new Date().getFullYear()} Ahmadu Bello University, Zaria. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

const sampleBookingDetails = {
  bookingId: "ABU-12345678",
  type: "Campus Bus",
  category: "Student",
  departureTime: "07:30",
  arrivalTime: "08:15",
  duration: "45m",
  departureDate: "April 20, 2025",
  departureLocation: "Main Campus Terminal",
  arrivalLocation: "Kongo Campus Terminal",
  price: 150,
  facilities: ["WiFi", "Air Conditioning"],
  passengers: [
    { name: "John Doe", idType: "Student ID", idNumber: "ABU/2023/12345" },
    { name: "Jane Doe", idType: "Student ID", idNumber: "ABU/2023/67890" },
  ],
  contactEmail: "john.doe@example.com",
  contactPhone: "+234 812 3456 7890",
  paymentMethod: "Pay on Boarding",
  totalAmount: 380,
  isPremium: false,
  shuttleType: "Standard",
  shuttleCategory: "Campus",
}