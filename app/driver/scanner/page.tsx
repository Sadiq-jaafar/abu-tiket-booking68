"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, QrCode, ArrowLeft, CheckCircle2, XCircle } from "lucide-react"
import { DriverHeader } from "@/components/driver-header"
import { verifyDriverTicket } from "@/lib/driver-actions"

interface DriverInfo {
  id: string
  name: string
  email: string
  shuttleId: string
  shuttleType: string
  route: string
}

interface ScanResult {
  success: boolean
  message: string
  passengerName?: string
  idNumber?: string
  seatNumber?: string
  bookingId?: string
}

export default function DriverScannerPage() {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
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

    return () => {
      // Clean up scanner when component unmounts
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [router])

  const startScanner = () => {
    if (!driverInfo) return

    setIsScanning(true)
    setScanResult(null)

    // Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false,
    )

    scannerRef.current = scanner

    // Define success callback
    const onScanSuccess = async (decodedText: string) => {
      // Stop scanning
      scanner.clear()
      setIsScanning(false)
      setIsProcessing(true)

      try {
        // Parse the QR code data
        let ticketData
        try {
          ticketData = JSON.parse(decodedText)
        } catch (err) {
          setScanResult({
            success: false,
            message: "Invalid QR code format. Please try again.",
          })
          setIsProcessing(false)
          return
        }

        // Verify the ticket
        const result = await verifyDriverTicket(ticketData, driverInfo.shuttleId)
        setScanResult(result)
      } catch (err) {
        console.error("Error processing ticket:", err)
        setScanResult({
          success: false,
          message: "An error occurred while processing the ticket. Please try again.",
        })
      } finally {
        setIsProcessing(false)
      }
    }

    // Define error callback
    const onScanFailure = (error: any) => {
      // We'll ignore errors as they're usually just frames without QR codes
      console.log("QR scan error:", error)
    }

    // Render the scanner
    scanner.render(onScanSuccess, onScanFailure)
  }

  const resetScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
    }
    setScanResult(null)
    setIsScanning(false)
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
    <div className="min-h-screen bg-gray-50">
      <DriverHeader driverName={driverInfo.name} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-6">
        <Button variant="outline" onClick={() => router.push("/driver/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="mr-2 h-5 w-5" /> Ticket Scanner
            </CardTitle>
            <CardDescription>Scan passenger tickets to verify and check them in</CardDescription>
          </CardHeader>
          <CardContent>
            {!isScanning && !scanResult && (
              <div className="text-center py-8">
                <QrCode className="mx-auto h-16 w-16 mb-4 text-muted-foreground" />
                <p className="mb-6">Ready to scan passenger tickets</p>
                <Button onClick={startScanner}>Start Scanner</Button>
              </div>
            )}

            {isScanning && (
              <div className="space-y-4">
                <div id="reader" className="mx-auto"></div>
                <div className="text-center">
                  <Button variant="outline" onClick={resetScanner}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4">Processing ticket...</p>
              </div>
            )}

            {scanResult && (
              <div className="space-y-4">
                <Alert variant={scanResult.success ? "default" : "destructive"}>
                  {scanResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertTitle>{scanResult.success ? "Ticket Valid" : "Ticket Invalid"}</AlertTitle>
                  <AlertDescription>{scanResult.message}</AlertDescription>
                </Alert>

                {scanResult.success && scanResult.passengerName && (
                  <div className="rounded-md border p-4 mt-4">
                    <h3 className="font-medium mb-2">Passenger Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Name:</div>
                      <div>{scanResult.passengerName}</div>

                      <div className="font-medium">ID Number:</div>
                      <div>{scanResult.idNumber}</div>

                      <div className="font-medium">Seat Number:</div>
                      <div>{scanResult.seatNumber}</div>

                      <div className="font-medium">Booking ID:</div>
                      <div>{scanResult.bookingId}</div>

                      <div className="font-medium">Status:</div>
                      <div>
                        <Badge variant="default">Checked In</Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-4 mt-6">
                  <Button onClick={startScanner}>Scan Another Ticket</Button>
                  <Button variant="outline" onClick={() => router.push("/driver/dashboard")}>
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
