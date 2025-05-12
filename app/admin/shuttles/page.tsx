"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, Search, Trash2, Edit, Plus, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

// Define the Shuttle interface based on our database schema
interface Shuttle {
  shuttle_id: string
  type: string
  category: string
  capacity: number
  facilities: string[]
  status: "active" | "maintenance" | "inactive"
  is_premium: boolean
  created_at: string
  driver_name: string
  route_id?: string // Add route ID reference
}

export default function AdminShuttlesPage() {
  const router = useRouter()
  const [shuttles, setShuttles] = useState<Shuttle[]>([])
  const [filteredShuttles, setFilteredShuttles] = useState<Shuttle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }

    // Fetch shuttles from Supabase
    const fetchShuttles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabase.from("shuttles").select("*")

        if (error) {
          throw error
        }

        if (data) {
          setShuttles(data)
          setFilteredShuttles(data)
        }
      } catch (error) {
        console.error("Error fetching shuttles:", error)
        setError("Failed to load shuttles. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShuttles()
  }, [router])

  // Apply filters
  useEffect(() => {
    let result = [...shuttles]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (shuttle) =>
          shuttle.shuttle_id.toLowerCase().includes(term) ||
          shuttle.type.toLowerCase().includes(term) ||
          shuttle.driver_name.toLowerCase().includes(term),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((shuttle) => shuttle.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((shuttle) => shuttle.category === categoryFilter)
    }

    setFilteredShuttles(result)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, categoryFilter, shuttles])

  // Handle shuttle deletion
  const handleDeleteShuttle = async (shuttleId: string) => {
    if (confirm("Are you sure you want to delete this shuttle?")) {
      try {
        setError(null)
        const { error } = await supabase.from("shuttles").delete().eq("shuttle_id", shuttleId)

        if (error) {
          throw error
        }

        // Update the local state after successful deletion
        setShuttles((prevShuttles) => prevShuttles.filter((shuttle) => shuttle.shuttle_id !== shuttleId))
      } catch (error) {
        console.error("Error deleting shuttle:", error)
        setError("Failed to delete shuttle. Please try again.")
      }
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredShuttles.length / itemsPerPage)
  const paginatedShuttles = filteredShuttles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="Shuttle Management" />

        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>All Shuttles</CardTitle>
                  <CardDescription>View and manage all shuttles in the system</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search shuttles..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <span>Status</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <span>Category</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button asChild>
                      <Link href="/admin/shuttles/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Shuttle
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-8">Loading shuttles...</div>
              ) : filteredShuttles.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">No shuttles found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search term</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm">
                            <div className="flex items-center">
                              Shuttle ID
                              <ArrowUpDown className="ml-1 h-4 w-4" />
                            </div>
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Capacity</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Driver</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedShuttles.map((shuttle) => (
                          <tr key={shuttle.shuttle_id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{shuttle.shuttle_id}</td>
                            <td className="py-3 px-4">{shuttle.type}</td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  shuttle.category === "Premium"
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                    : shuttle.category === "Staff"
                                      ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                      : shuttle.category === "Express"
                                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                        : "bg-green-100 text-green-800 hover:bg-green-100"
                                }
                              >
                                {shuttle.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">{shuttle.capacity} seats</td>
                            <td className="py-3 px-4">{shuttle.driver_name || "Unassigned"}</td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  shuttle.status === "active"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : shuttle.status === "maintenance"
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                      : "bg-red-100 text-red-800 hover:bg-red-100"
                                }
                              >
                                {shuttle.status.charAt(0).toUpperCase() + shuttle.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    router.push(`/admin/shuttles/${shuttle.shuttle_id}`)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteShuttle(shuttle.shuttle_id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredShuttles.length)} of {filteredShuttles.length}{" "}
                        shuttles
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1),
                          )
                          .map((page, i, array) => (
                            <React.Fragment key={page}>
                              {i > 0 && array[i - 1] !== page - 1 && <span className="text-gray-400">...</span>}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
