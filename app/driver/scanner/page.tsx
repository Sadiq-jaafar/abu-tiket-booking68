"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  ScanLine,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Loader2
} from "lucide-react"
import { DriverHeader } from "@/components/driver-header"
import { verifyDriverTicket } from "@/lib/driver-actions"
import router from "next/router"

interface DriverInfo {
  id: string
  name: string
  email: string
  shuttleId: string
  shuttleType: string
  route: string
}
export default function DriverScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [verificationStatus, setVerificationStatus] = useState<"verified" | "invalid" | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = "qr-reader"

   useEffect(() => {
    // Check if driver is logged in
    const authData = localStorage.getItem("driverAuth")
    if (!authData) {
      router.push("/driver/login")
      return
    }
    const driver = JSON.parse(authData) as DriverInfo
    setDriverInfo(driver)

  }, []) // Add empty dependency array

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode(scannerDivId)
    scannerRef.current = html5QrCode

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          try {
            const ticketData = JSON.parse(decodedText)
            setScanResult(ticketData)
            verifyTicketData(ticketData)
            stopScanner()
          } catch (error) {
            console.error("Invalid QR code format:", error)
            setVerificationStatus("invalid")
          }
        },
        (errorMessage) => {
          console.log(errorMessage)
        }
      )
      .catch((err) => {
        console.error(`Unable to start scanning: ${err}`)
      })

    setScanning(true)
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch((err) => {
        console.error(`Unable to stop scanning: ${err}`)
      })
      setScanning(false)
    }
  }

  const verifyTicketData = async (ticketData: any) => {
    setIsVerifying(true)
    try {
      const driverShuttleId = localStorage.getItem("driverShuttleId")
      if (!driverShuttleId) throw new Error("Driver shuttle ID not found")
      const isValid = await verifyDriverTicket(ticketData, driverShuttleId)
      setVerificationStatus(isValid ? "verified" : "invalid")
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationStatus("invalid")
    } finally {
      setIsVerifying(false)
    }
  }

  const resetScanner = () => {
    setScanResult(null)
    setVerificationStatus(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("driverAuthenticated")
    localStorage.removeItem("driverShuttleId")
    window.location.href = "/driver/login"
  }
  if (!driverInfo) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <DriverHeader title="Ticket Scanner" driverName={driverInfo.name} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6 border-t-2 border-[#006400]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="w-5 h-5" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription>Scan passenger tickets to verify and check in</CardDescription>
              </CardHeader>
              <CardContent>
                {!scanResult ? (
                  <div className="flex flex-col items-center">
                    <div
                      id={scannerDivId}
                      className="w-full max-w-sm h-64 bg-gray-100 rounded-lg overflow-hidden mb-4"
                    ></div>

                    {scanning ? (
                      <Button variant="outline" onClick={stopScanner} className="mt-2">
                        Stop Scanner
                      </Button>
                    ) : (
                      <Button onClick={startScanner} className="mt-2 bg-[#006400] hover:bg-[#005000]">
                        Start Scanner
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Verification Status Alert */}
                    {isVerifying ? (
                      <div className="text-center py-4">Verifying ticket...</div>
                    ) : verificationStatus === "verified" ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <AlertTitle className="text-green-800">Valid Ticket</AlertTitle>
                        <AlertDescription className="text-green-700">
                          Passenger checked in successfully.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-red-50 border-red-200">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <AlertTitle className="text-red-800">Invalid Ticket</AlertTitle>
                        <AlertDescription className="text-red-700">
                          This ticket is not valid for this shuttle or has already been used.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Ticket Information */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Ticket Information</h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <div className="font-medium">Passenger Name:</div>
                          <div>{scanResult.passenger_name}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="font-medium">ID Number:</div>
                          <div>{scanResult.id_number}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="font-medium">Seat Number:</div>
                          <div>{scanResult.seat_number}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="font-medium">Booking ID:</div>
                          <div>{scanResult.booking_id}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="font-medium">Shuttle ID:</div>
                          <div>{scanResult.shuttle_id}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="font-medium">Departure:</div>
                          <div>{new Date(scanResult.departure_date).toLocaleDateString()} {scanResult.departure_time}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="font-medium">Status:</div>
                          <div>
                            <Badge variant={verificationStatus === "verified" ? "default" : "destructive"}>
                              {verificationStatus === "verified" ? "Checked In" : "Invalid Ticket"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              {scanResult && (
                <CardFooter>
                  <Button onClick={resetScanner} className="w-full bg-[#006400] hover:bg-[#005000]">
                    Scan Another Ticket
                  </Button>
                </CardFooter>
              )}
            </Card>

            <div className="text-sm text-gray-500">
              <p className="mb-2 font-medium">Instructions for Drivers:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Click "Start Scanner" and allow camera access</li>
                <li>Point the camera at the passenger's QR code ticket</li>
                <li>The system will verify if the ticket is valid for your shuttle</li>
                <li>Check the passenger's ID against the displayed information</li>
                <li>For valid tickets, allow the passenger to board</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
