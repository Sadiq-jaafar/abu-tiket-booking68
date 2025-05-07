"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface TicketQRCodeProps {
  data: {
    bookingId: string
    departureDate: string
    departureTime: string
    passengers: { name: string; idNumber: string }[]
    route: string
    timestamp: number // Creation timestamp for verification
    shuttleType?: string
    shuttleCategory?: string
    isPremium?: boolean
    pickupAddress?: string
    dropoffAddress?: string
    signature?: string // Could be a hash of the booking details with a secret key
  }
  size?: number
  isPremium?: boolean
}

export function TicketQRCode({ data, size = 180, isPremium = false }: TicketQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Convert the data object to a JSON string
      const qrData = JSON.stringify({
        ...data,
        // Add a verification signature (in a real app, this would be a proper digital signature)
        signature: btoa(`${data.bookingId}-${data.timestamp}-${data.passengers.map((p) => p.idNumber).join("-")}`),
      })

      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: size,
          margin: 2,
          color: {
            dark: isPremium ? "#b45309" : "#006400", // Amber-700 for premium, Green for regular
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H", // High error correction for better scanning
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error)
        },
      )
    }
  }, [data, size, isPremium])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className={`border rounded-md ${isPremium ? "border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "border-gray-200"}`}
      />
      <p className={`mt-2 text-xs text-center ${isPremium ? "text-amber-700" : "text-gray-500"}`}>
        {isPremium ? "✨ Premium Secure Ticket" : "Secure Ticket"} • {data.bookingId}
      </p>
    </div>
  )
}
