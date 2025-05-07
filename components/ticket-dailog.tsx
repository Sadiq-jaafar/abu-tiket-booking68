// // components/ticket-dialog.tsx
// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Badge } from "@/components/ui/badge"
// import { TicketQRCode } from "@/components/ticket-qr-code"
// import { MapPinIcon, StarIcon } from "lucide-react"
// import type { Booking ,Shuttle, Passenger} from "@/lib/definitions"

// export function TicketDialog({ booking, shuttle, passenger }: { booking: Booking, shuttle: Shuttle , passenger: Passenger }) {
//   const [open, setOpen] = useState(false)

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button
//           variant="outline"
//           size="sm"
//           className={`${
//             booking.is_premium
//               ? "border-amber-500 text-amber-700 hover:bg-amber-50"
//               : "border-[#006400] text-[#006400] hover:bg-[#e6f2e6]"
//           }`}
//         >
//           View Ticket
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Ticket Details</DialogTitle>
//           <DialogDescription>Present this QR code for boarding the shuttle.</DialogDescription>
//         </DialogHeader>
//         <div className="flex flex-col p-6">
//           <div
//             className={`p-4 mb-4 bg-white border rounded-lg shadow-sm ${
//               booking.is_premium ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white" : ""
//             }`}
//           >
//             <div
//               className={`flex justify-between items-center mb-3 pb-2 border-b ${
//                 booking.is_premium ? "border-amber-200" : "border-gray-100"
//               }`}
//             >
//               <h3 className={`text-lg font-medium ${booking.is_premium ? "text-amber-700" : "text-[#006400]"}`}>
//                 {booking.is_premium && <StarIcon className="w-4 h-4 inline mr-1" />}
//                 ABU Ticket
//               </h3>
//               <Badge className={booking.is_premium ? "bg-amber-500" : "bg-[#006400]"}>
//                 {booking.status.toUpperCase()}
//               </Badge>
//             </div>

//             {booking.is_premium && (
//               <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
//                 <p className="text-sm font-medium flex items-center">
//                   <StarIcon className="w-4 h-4 mr-1" /> Premium Door-to-Door Service
//                 </p>
//                 <p className="text-xs mt-1">Enjoy exclusive pickup and dropoff at your specified locations</p>
//               </div>
//             )}

//             <div className="mb-4">
//               <div className="flex justify-between mb-1">
//                 <p className="text-sm font-medium">Route:</p>
//                 <p className="text-sm">
//                   {booking.pickup_address} to {booking.dropoff_address}
//                 </p>
//               </div>
//               <div className="flex justify-between mb-1">
//                 <p className="text-sm font-medium">Shuttle Type:</p>
//                 <p className="text-sm">
//                   {shuttle.type} ({shuttle.category})
//                 </p>
//               </div>
//               <div className="flex justify-between mb-1">
//                 <p className="text-sm font-medium">Booking Time:</p>
//                 <p className="text-sm">{new Date(booking. booking_date).toLocaleString()}</p>
//               </div>
//               <div className="flex justify-between mb-1">
//                 <p className="text-sm font-medium">Departure Date:</p>
//                 <p className="text-sm">{new Date(booking.departure_date).toLocaleDateString()}</p>
//               </div>
//               <div className="flex justify-between">
//                 <p className="text-sm font-medium">Departure Time:</p>
//                 <p className="text-sm">{booking.departure_time}</p>
//               </div>
//             </div>

//             {booking.is_premium && (
//               <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
//                 <p className="font-medium border-b border-amber-200 pb-1 mb-2 text-amber-800">
//                   Pickup & Dropoff Details:
//                 </p>
//                 <div className="space-y-2">
//                   <div className="flex items-start">
//                     <MapPinIcon className="w-4 h-4 mr-2 text-amber-700 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium text-amber-800">Pickup Address:</p>
//                       <p className="text-sm">{booking.pickup_address}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start">
//                     <MapPinIcon className="w-4 h-4 mr-2 text-amber-700 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium text-amber-800">Dropoff Address:</p>
//                       <p className="text-sm">{booking.dropoff_address}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div
//               className={`p-3 mb-4 rounded-md ${
//                 booking.is_premium ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
//               }`}
//             >
//               <p
//                 className={`font-medium border-b pb-1 mb-2 ${
//                   booking.is_premium ? "border-amber-200 text-amber-800" : "border-gray-200"
//                 }`}
//               >
//                 Passenger Details:
//               </p>
//               {passenger.map((passenger, idx) => (
//                 <div key={idx} className="mt-2 pb-2 border-b border-gray-100 last:border-0">
//                   <div className="flex justify-between mb-1">
//                     <p className="font-medium text-sm">{passenger.first_name, passenger.last_name}:</p>
//                     <p className={`text-sm ${booking.is_premium ? "font-medium text-amber-700" : ""}`}>
//                       {shuttle.category}
//                       {booking.is_premium && " (Premium)"}
//                     </p>
//                   </div>
//                   <div className="flex justify-between mb-1">
//                     <p className="font-medium text-sm">Name:</p>
//                     <p className="text-sm">{passenger.name}</p>
//                   </div>
//                   <div className="flex justify-between">
//                     <p className="font-medium text-sm">ID Number:</p>
//                     <p className="text-sm">{passenger.id_number}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-center mt-4">
//               <TicketQRCode
//                 data={{
//                   bookingId: booking.booking_id,
//                   departureDate: booking.departure_date,
//                   departureTime: booking.departure_time,
//                   route: `${booking.pickup_address} to ${booking.dropoff_address}`,
//                   timestamp: new Date(booking. booking_date).getTime(),
//                   shuttleType: shuttle.type,
//                   shuttleCategory: shuttle.category,
//                   isPremium: booking.is_premium,
//                   pickupAddress: booking.pickup_address,
//                   dropoffAddress: booking.dropoff_address,
                  
//                 }}
//                 size={200}
//                 is_premium={booking.is_premium}
//               />
//             </div>
//             <p className="text-xs text-center mt-2 text-gray-500">Booking ID: {booking.booking_id}</p>
//           </div>

//           <div className="text-sm text-gray-500">
//             <p>This is a secure digital ticket for ABU Tiket shuttle service.</p>
//             <p>Please arrive 15 minutes before departure time.</p>
//             {booking.is_premium && (
//               <p className="mt-1 text-amber-700">
//                 Premium passengers: Our driver will contact you 30 minutes before pickup.
//               </p>
//             )}
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }