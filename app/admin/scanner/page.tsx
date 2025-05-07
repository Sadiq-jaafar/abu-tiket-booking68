"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, ScanLine, UserCheck, Calendar, Clock, MapPin } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { verifyTicket } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"

export default function AdminScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [verificationStatus, setVerificationStatus] = useState<"verified" | "invalid" | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = "qr-reader"

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      window.location.href = "/admin/login"
    }
  }, [])

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

            // Verify the ticket
            verifyTicketData(ticketData)

            // Stop scanning after successful scan
            stopScanner()
          } catch (error) {
            console.error("Invalid QR code format:", error)
            setVerificationStatus("invalid")
          }
        },
        (errorMessage) => {
          console.log(errorMessage)
        },
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
      // In a real app, this would verify against a database
      const isValid = await verifyTicket(ticketData)
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="Ticket Scanner" />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6 border-t-2 border-[#006400]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="w-5 h-5" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription>Scan passenger tickets to verify authenticity</CardDescription>
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
                    {isVerifying ? (
                      <div className="text-center py-4">Verifying ticket...</div>
                    ) : verificationStatus === "verified" ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <AlertTitle className="text-green-800">Valid Ticket</AlertTitle>
                        <AlertDescription className="text-green-700">
                          This ticket is authentic and valid for travel.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-red-50 border-red-200">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <AlertTitle className="text-red-800">Invalid Ticket</AlertTitle>
                        <AlertDescription className="text-red-700">
                          This ticket could not be verified. It may be expired, forged, or already used.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Ticket Information</h3>
                      <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-gray-500">Booking ID</p>
                            <p className="font-medium">{scanResult.bookingId}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <Badge
                              className={
                                verificationStatus === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {verificationStatus === "verified" ? "Valid" : "Invalid"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-500">Route</p>
                            <p className="font-medium">{scanResult.route}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-500">Departure Date</p>
                            <p className="font-medium">{scanResult.departureDate}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-500">Departure Time</p>
                            <p className="font-medium">{scanResult.departureTime}</p>
                          </div>
                        </div>

                        {scanResult.isPremium && (
                          <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                            <p className="font-medium text-amber-800 mb-1">Premium Service</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-amber-700">Pickup</p>
                                <p>{scanResult.pickupAddress || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-amber-700">Dropoff</p>
                                <p>{scanResult.dropoffAddress || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-3">
                          <h4 className="font-medium mb-2">Passengers:</h4>
                          <div className="space-y-2">
                            {scanResult.passengers.map((passenger: any, index: number) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                                <UserCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="font-medium">{passenger.name}</p>
                                  <p className="text-sm text-gray-500">{passenger.idNumber}</p>
                                </div>
                              </div>
                            ))}
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
              <p className="mb-2 font-medium">Instructions for Administrators:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Click "Start Scanner" and allow camera access</li>
                <li>Point the camera at the passenger's QR code ticket</li>
                <li>The system will automatically verify the ticket's authenticity</li>
                <li>Check the passenger's ID against the information displayed</li>
                <li>For valid tickets, allow the passenger to board</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
