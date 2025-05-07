"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, Edit, Trash2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

interface Driver {
  driver_id: string
  driver_name: string
  shuttle_id: string
  phone_number?: string
  email?: string
  license_number?: string
  status?: string
  created_at?: string
}

export default function DriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/admin/login")
    }

    fetchDrivers()
  }, [router])

  const fetchDrivers = async () => {
    try {
      setIsLoading(true)

      // First try the "drivers" table (plural)
      let { data: driversData, error: driversError } = await supabase.from("drivers").select("*")

      // If there's an error with the "drivers" table, try the "driver" table (singular)
      if (driversError) {
        console.log("Trying driver table instead of drivers")
        const { data: driverData, error: driverError } = await supabase.from("driver").select("*")

        if (driverError) {
          throw new Error("Could not fetch drivers from either 'drivers' or 'driver' tables")
        }

        // Map the driver data to match our expected format
        driversData = driverData.map((driver) => ({
          driver_id: driver.driver_id || "",
          driver_name: driver.driver_name || "",
          shuttle_id: driver.shuttle_id || "",
          status: "active", // Default status
          created_at: driver.created_at,
        }))
      }

      setDrivers(driversData || [])
    } catch (err: any) {
      console.error("Error fetching drivers:", err)
      setError(err.message || "An error occurred while fetching drivers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return

    try {
      // Try to delete from "drivers" table first
      const { error: driversError } = await supabase.from("drivers").delete().eq("driver_id", driverId)

      // If there's an error, try the "driver" table
      if (driversError) {
        const { error: driverError } = await supabase.from("driver").delete().eq("driver_id", driverId)

        if (driverError) {
          throw new Error("Could not delete driver from either 'drivers' or 'driver' tables")
        }
      }

      // Refresh the drivers list
      fetchDrivers()
    } catch (err: any) {
      console.error("Error deleting driver:", err)
      setError(err.message || "An error occurred while deleting the driver")
    }
  }

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.driver_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.shuttle_id?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status = "active") => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "on_leave":
        return <Badge className="bg-yellow-500">On Leave</Badge>
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>
      default:
        return <Badge>{status || "Active"}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="Drivers Management" />

        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Drivers</h1>
            <Button asChild>
              <Link href="/admin/drivers/new" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New Driver
              </Link>
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search drivers by ID, name, or shuttle..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Shuttle ID</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading drivers...
                      </TableCell>
                    </TableRow>
                  ) : filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {searchQuery
                          ? "No drivers found matching your search criteria"
                          : "No drivers found. Add your first driver!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow key={driver.driver_id}>
                        <TableCell className="font-medium">{driver.driver_id}</TableCell>
                        <TableCell>{driver.driver_name}</TableCell>
                        <TableCell>{driver.shuttle_id}</TableCell>
                        <TableCell>{driver.phone_number || "—"}</TableCell>
                        <TableCell>{driver.license_number || "—"}</TableCell>
                        <TableCell>{getStatusBadge(driver.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteDriver(driver.driver_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
