// import { supabase, handleSupabaseError, isOnline } from "./supabase"
// import type { Booking, Passenger, Shuttle, Route, ContactInfo, User } from "./definitions"

// // Improved sanitizeShuttle function with better error handling
// const sanitizeShuttle = (shuttle: any) => {
//   // Handle the case where shuttle might be null or undefined
//   if (!shuttle) return { facilities: "[]" }

//   // Ensure facilities exists
//   if (!shuttle.facilities) {
//     shuttle.facilities = "[]"
//     return shuttle
//   }

//   // If facilities is already an array, convert it to a JSON string
//   if (Array.isArray(shuttle.facilities)) {
//     try {
//       shuttle.facilities = JSON.stringify(shuttle.facilities)
//       return shuttle
//     } catch (error) {
//       console.error(`Error stringifying facilities array for shuttle ${shuttle.shuttle_id || "unknown"}:`, error)
//       shuttle.facilities = "[]"
//       return shuttle
//     }
//   }

//   // If facilities is a string, ensure it's valid JSON
//   if (typeof shuttle.facilities === "string") {
//     try {
//       // Try to parse and re-stringify to ensure valid JSON
//       const parsed = JSON.parse(shuttle.facilities)
//       shuttle.facilities = JSON.stringify(parsed)
//       return shuttle
//     } catch (error) {
//       // If parsing fails, log the error and set to empty array
//       console.error(`Invalid facilities JSON for shuttle ${shuttle.shuttle_id || "unknown"}: ${shuttle.facilities}`)
//       shuttle.facilities = "[]"
//       return shuttle
//     }
//   }

//   // If facilities is neither an array nor a string, set it to empty array
//   console.warn(
//     `Unexpected facilities type for shuttle ${shuttle.shuttle_id || "unknown"}: ${typeof shuttle.facilities}`,
//   )
//   shuttle.facilities = "[]"
//   return shuttle
// }

// // Get bookings for a user
// export async function getBookings(userId?: string): Promise<Booking[]> {
//   try {
//     // If offline, try to get from local storage
//     if (!isOnline()) {
//       const cachedBookings = localStorage.getItem("cachedBookings")
//       if (cachedBookings) {
//         return JSON.parse(cachedBookings)
//       }
//       return []
//     }

//     let query = supabase.from("bookings").select(`
//         *,
//         shuttle:shuttles(*),
//         route:routes(*),
//         contactInfo:contact_info(*)
//       `)

//     // If userId is provided, filter by user_id
//     if (userId) {
//       query = query.eq("user_id", userId)
//     }

//     const { data, error } = await query

//     if (error) {
//       throw error
//     }

//     // For each booking, fetch its passengers
//     const bookingsWithPassengers = await Promise.all(
//       data.map(async (booking) => {
//         const { data: passengers, error: passengersError } = await supabase
//           .from("passengers")
//           .select("*")
//           .eq("booking_id", booking.booking_id)

//         if (passengersError) {
//           console.error("Error fetching passengers:", passengersError)
//           return { ...booking, passengers: [] }
//         }

//         return { ...booking, passengers }
//       }),
//     )

//     // Cache the result in localStorage for offline use
//     localStorage.setItem("cachedBookings", JSON.stringify(bookingsWithPassengers))

//     return bookingsWithPassengers
//   } catch (error) {
//     console.error("Error in getBookings:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     throw new Error(errorMessage)
//   }
// }

// // Get a single booking by ID
// export async function getBookingById(bookingId: string): Promise<Booking | null> {
//   try {
//     // If offline, try to get from local storage
//     if (!isOnline()) {
//       const cachedBookings = localStorage.getItem("cachedBookings")
//       if (cachedBookings) {
//         const bookings = JSON.parse(cachedBookings)
//         return bookings.find((booking: Booking) => booking.booking_id === bookingId) || null
//       }
//       return null
//     }

//     console.log(`Fetching booking with ID: ${bookingId}`)

//     // First, get the booking details
//     const { data: bookingData, error: bookingError } = await supabase
//       .from("bookings")
//       .select(`
//         *,
//         shuttle:shuttles(*),
//         route:routes(*)
//       `)
//       .eq("booking_id", bookingId)
//       .single()

//     if (bookingError) {
//       console.error("Error fetching booking:", bookingError)
//       throw bookingError
//     }

//     if (!bookingData) {
//       console.log("No booking found with ID:", bookingId)
//       return null
//     }

//     console.log("Booking data retrieved:", bookingData)

//     // Fetch passengers for this booking
//     const { data: passengers, error: passengersError } = await supabase
//       .from("passengers")
//       .select("*")
//       .eq("booking_id", bookingId)

//     if (passengersError) {
//       console.error("Error fetching passengers:", passengersError)
//       // Continue with empty passengers array
//     }

//     console.log("Passengers retrieved:", passengers || [])

//     // Fetch contact info for this booking
//     const { data: contactInfo, error: contactInfoError } = await supabase
//       .from("contact_info")
//       .select("*")
//       .eq("booking_id", bookingId)
//       .single()

//     if (contactInfoError && contactInfoError.code !== "PGRST116") {
//       // PGRST116 is "no rows returned"
//       console.error("Error fetching contact info:", contactInfoError)
//       // Continue with null contact info
//     }

//     console.log("Contact info retrieved:", contactInfo || {})

//     // Combine all data
//     const completeBooking = {
//       ...bookingData,
//       passengers: passengers || [],
//       contactInfo: contactInfo || null,
//     }

//     return completeBooking
//   } catch (error) {
//     console.error("Error in getBookingById:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     throw new Error(errorMessage)
//   }
// }

// // Create a new booking
// export async function createBooking(
//   bookingData: Omit<Booking, "booking_id">,
//   passengers: Passenger[],
//   contactInfo: ContactInfo,
// ): Promise<{ booking: Booking; error: string | null }> {
//   try {
//     // Generate a booking ID
//     const bookingId = `ABU-${Math.floor(10000000 + Math.random() * 90000000)}`

//     // Log the booking data for debugging
//     console.log("Creating booking with data:", {
//       ...bookingData,
//       booking_id: bookingId,
//     })

//     // Start a transaction
//     const { data: booking, error: bookingError } = await supabase
//       .from("bookings")
//       .insert([
//         {
//           booking_id: bookingId,
//           user_id: bookingData.user_id,
//           shuttle_id: bookingData.shuttle_id,
//           route_id: bookingData.route_id,
//           departure_date: bookingData.departure_date,
//           departure_time: bookingData.departure_time,
//           arrival_time: bookingData.arrival_time,
//           booking_date: new Date().toISOString(),
//           status: "upcoming",
//           is_premium: bookingData.is_premium,
//           price: bookingData.price,
//           total_amount: bookingData.total_amount,
//           pickup_address: bookingData.pickup_address,
//           dropoff_address: bookingData.dropoff_address,
//           check_in_status: "pending",
//         },
//       ])
//       .select()
//       .single()

//     if (bookingError) {
//       console.error("Error creating booking:", bookingError)
//       throw bookingError
//     }

//     console.log("Booking created successfully:", booking)

//     // Insert contact info
//     const { error: contactError } = await supabase.from("contact_info").insert([
//       {
//         booking_id: bookingId,
//         email: contactInfo.email,
//         phone: contactInfo.phone,
//         special_request: contactInfo.special_requests || "",
//       },
//     ])

//     if (contactError) {
//       console.error("Error creating contact info:", contactError)
//       throw contactError
//     }

//     console.log("Contact info created successfully")

//     // Process passengers data
//     const processedPassengers = passengers.map((passenger) => {
//       // Combine first_name and last_name into name if needed
//       const name = `${passenger.first_name} ${passenger.last_name}`.trim()

//       return {
//         name,
//         id_type: passenger.id_type,
//         id_number: passenger.id_number,
//         booking_id: bookingId,
//       }
//     })

//     // Insert passengers
//     const { error: passengersError } = await supabase.from("passengers").insert(processedPassengers)

//     if (passengersError) {
//       console.error("Error creating passengers:", passengersError)
//       throw passengersError
//     }

//     console.log("Passengers created successfully")

//     // Return the created booking
//     return {
//       booking: {
//         ...booking,
//         passengers,
//         contactInfo,
//       },
//       error: null,
//     }
//   } catch (error: any) {
//     console.error("Error in createBooking:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     return { booking: {} as Booking, error: errorMessage }
//   }
// }

// // Cancel a booking
// export async function cancelBooking(bookingId: string): Promise<{ success: boolean; error: string | null }> {
//   try {
//     const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("booking_id", bookingId)

//     if (error) {
//       throw error
//     }

//     return { success: true, error: null }
//   } catch (error) {
//     console.error("Error in cancelBooking:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     return { success: false, error: errorMessage }
//   }
// }

// // Improved getShuttles function with better error handling
// export async function getShuttles() {
//   try {
//     // If offline, try to get from local storage
//     if (!isOnline()) {
//       const cachedShuttles = localStorage.getItem("cachedShuttles")
//       if (cachedShuttles) {
//         try {
//           const parsed = JSON.parse(cachedShuttles)
//           return parsed.map(sanitizeShuttle)
//         } catch (error) {
//           console.error("Error parsing cached shuttles:", error)
//           return []
//         }
//       }
//       return []
//     }

//     const { data, error } = await supabase.from("shuttles").select("*")

//     if (error) {
//       throw error
//     }

//     if (!data || !Array.isArray(data)) {
//       console.error("Invalid data returned from shuttles query:", data)
//       return []
//     }

//     // Sanitize the facilities data for each shuttle
//     const sanitizedData = data.map((shuttle) => {
//       try {
//         return sanitizeShuttle(shuttle)
//       } catch (error) {
//         console.error(`Error sanitizing shuttle ${shuttle?.shuttle_id || "unknown"}:`, error)
//         return { ...shuttle, facilities: "[]" }
//       }
//     })

//     // Cache the result in localStorage for offline use
//     try {
//       localStorage.setItem("cachedShuttles", JSON.stringify(sanitizedData))
//     } catch (error) {
//       console.error("Error caching shuttles:", error)
//     }

//     return sanitizedData
//   } catch (error) {
//     console.error("Error in getShuttles:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     throw new Error(errorMessage)
//   }
// }

// // Get all routes
// export async function getRoutes(): Promise<Route[]> {
//   try {
//     // If offline, try to get from local storage
//     if (!isOnline()) {
//       console.log("Device is offline, using cached routes")
//       const cachedRoutes = localStorage.getItem("cachedRoutes")
//       if (cachedRoutes) {
//         return JSON.parse(cachedRoutes)
//       }
//       console.log("No cached routes found, using fallback routes")
//       return getFallbackRoutes()
//     }

//     // Add timeout to the fetch request
//     const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
//       setTimeout(() => reject(new Error("Request timed out")), 5000),
//     )

//     const fetchPromise = supabase.from("routes").select("*")

//     // Race between fetch and timeout
//     const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any

//     if (error) {
//       console.warn("Error fetching routes from Supabase:", error)
//       throw error
//     }

//     if (!data || !Array.isArray(data)) {
//       console.warn("Invalid data returned from routes query:", data)
//       throw new Error("Invalid data returned from server")
//     }

//     // Cache the result in localStorage for offline use
//     try {
//       localStorage.setItem("cachedRoutes", JSON.stringify(data))
//     } catch (storageError) {
//       console.warn("Failed to cache routes:", storageError)
//     }

//     return data
//   } catch (error) {
//     console.error("Error in getRoutes:", error)

//     // Try to get from local storage as fallback
//     try {
//       const cachedRoutes = localStorage.getItem("cachedRoutes")
//       if (cachedRoutes) {
//         console.log("Using cached routes due to fetch error")
//         return JSON.parse(cachedRoutes)
//       }
//     } catch (cacheError) {
//       console.warn("Error reading cached routes:", cacheError)
//     }

//     // Return fallback routes if all else fails
//     console.log("Using fallback routes due to fetch error")
//     return getFallbackRoutes()
//   }
// }

// // Fallback routes for when network requests fail
// function getFallbackRoutes(): Route[] {
//   return [
//     {
//       shuttle_id: "SH-1001",
//       departure_location: "Main Campus",
//       arrival_location: "Kongo Campus",
//       base_price: 150,
//       premium_price: 250,
//       created_at: new Date().toISOString(),
//     },
//     {
//       shuttle_id: "SH-1002",
//       departure_location: "Kongo Campus",
//       arrival_location: "Main Campus",
//       base_price: 150,
//       premium_price: 250,
//       created_at: new Date().toISOString(),
//     },
//     {
//       shuttle_id: "SH-1003",
//       departure_location: "Main Campus",
//       arrival_location: "Samaru",
//       base_price: 120,
//       premium_price: 200,
//       created_at: new Date().toISOString(),
//     },
//     {
//       shuttle_id: "SH-1004",
//       departure_location: "Samaru",
//       arrival_location: "Main Campus",
//       base_price: 120,
//       premium_price: 200,
//       created_at: new Date().toISOString(),
//     },
//   ]
// }

// // Verify ticket
// export async function verifyTicket(ticketData: any): Promise<boolean> {
//   try {
//     // Check if the booking exists and is valid
//     const { data, error } = await supabase.from("bookings").select("*").eq("booking_id", ticketData.bookingId).single()

//     if (error || !data) {
//       return false
//     }

//     // Check if the booking is not cancelled
//     if (data.status === "cancelled") {
//       return false
//     }

//     // In a real app, we would also verify the signature or other security measures
//     return true
//   } catch (error) {
//     console.error("Error in verifyTicket:", error)
//     return false
//   }
// }

// // Get user profile
// export async function getUserProfile(userId: string): Promise<User | null> {
//   try {
//     // If offline, try to get from local storage
//     if (!isOnline()) {
//       const cachedUser = localStorage.getItem(`user_${userId}`)
//       if (cachedUser) {
//         return JSON.parse(cachedUser)
//       }
//       return null
//     }

//     const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

//     if (error) {
//       throw error
//     }

//     // Cache the result in localStorage for offline use
//     localStorage.setItem(`user_${userId}`, JSON.stringify(data))

//     return data
//   } catch (error) {
//     console.error("Error in getUserProfile:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     throw new Error(errorMessage)
//   }
// }

// // Update user profile
// export async function updateUserProfile(
//   userId: string,
//   userData: Partial<User>,
// ): Promise<{ success: boolean; error: string | null }> {
//   try {
//     const { error } = await supabase.from("users").update(userData).eq("id", userId)

//     if (error) {
//       throw error
//     }

//     // Update the cached user data
//     const cachedUser = localStorage.getItem(`user_${userId}`)
//     if (cachedUser) {
//       const user = JSON.parse(cachedUser)
//       localStorage.setItem(`user_${userId}`, JSON.stringify({ ...user, ...userData }))
//     }

//     return { success: true, error: null }
//   } catch (error) {
//     console.error("Error in updateUserProfile:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     return { success: false, error: errorMessage }
//   }
// }

// // Admin functions
// export async function getAllUsers(): Promise<User[]> {
//   try {
//     const { data, error } = await supabase.from("users").select("*")

//     if (error) {
//       throw error
//     }

//     return data
//   } catch (error) {
//     console.error("Error in getAllUsers:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     throw new Error(errorMessage)
//   }
// }

// export async function addShuttle(
//   shuttleData: Omit<Shuttle, "shuttle_id">,
// ): Promise<{ success: boolean; error: string | null }> {
//   try {
//     // Generate a shuttle ID
//     const shuttleId = `SH-${Math.floor(1000 + Math.random() * 9000)}`

//     // Ensure facilities is valid JSON if provided
//     if (shuttleData.facilities) {
//       try {
//         if (typeof shuttleData.facilities === "string") {
//           // Parse the string and ensure it's an array of strings
//           const parsed = JSON.parse(shuttleData.facilities)
//           shuttleData.facilities = Array.isArray(parsed) ? parsed : []
//         } else if (Array.isArray(shuttleData.facilities)) {
//           // Keep array as is, no conversion needed
//           shuttleData.facilities = shuttleData.facilities
//         } else {
//           // Default to empty array if invalid
//           shuttleData.facilities = []
//         }
//       } catch (error) {
//         console.error("Invalid facilities data:", error)
//         shuttleData.facilities = []
//       }
//     } else {
//       shuttleData.facilities = []
//     }

//     const { error } = await supabase.from("shuttles").insert([
//       {
//         shuttle_id: shuttleId,
//         ...shuttleData,
//         created_at: new Date().toISOString(),
//       },
//     ])

//     if (error) {
//       throw error
//     }

//     return { success: true, error: null }
//   } catch (error) {
//     console.error("Error in addShuttle:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     return { success: false, error: errorMessage }
//   }
// }

// export async function updateShuttle(
//   shuttleId: string,
//   shuttleData: Partial<Shuttle>,
// ): Promise<{ success: boolean; error: string | null }> {
//   try {
//     // Ensure facilities is valid JSON if provided
//     if (shuttleData.facilities) {
//       try {
//         if (typeof shuttleData.facilities === "string") {
//           // Try to parse string to array
//           const parsed = JSON.parse(shuttleData.facilities)
//           shuttleData.facilities = Array.isArray(parsed) ? parsed : []
//         } else if (Array.isArray(shuttleData.facilities)) {
//           // Keep array as is
//           shuttleData.facilities = shuttleData.facilities
//         } else {
//           // Default to empty array if invalid
//           shuttleData.facilities = []
//         }
//       } catch (error) {
//         console.error("Invalid facilities data:", error)
//         shuttleData.facilities = []
//       }
//     }

//     const { error } = await supabase.from("shuttles").update(shuttleData).eq("shuttle_id", shuttleId)

//     if (error) {
//       throw error
//     }

//     return { success: true, error: null }
//   } catch (error) {
//     console.error("Error in updateShuttle:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     return { success: false, error: errorMessage }
//   }
// }

// export async function deleteShuttle(shuttleId: string): Promise<{ success: boolean; error: string | null }> {
//   try {
//     const { error } = await supabase.from("shuttles").delete().eq("shuttle_id", shuttleId)

//     if (error) {
//       throw error
//     }

//     return { success: true, error: null }
//   } catch (error) {
//     console.error("Error in deleteShuttle:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     return { success: false, error: errorMessage }
//   }
// }

// export async function addRoute(
//   routeData: Omit<Route, "id" | "created_at">,
// ): Promise<{ success: boolean; error: string | null }> {
//   try {
//     const { error } = await supabase.from("routes").insert([
//       {
//         ...routeData,
//         created_at: new Date().toISOString(),
//       },
//     ])

//     if (error) {
//       throw error
//     }

//     return { success: true, error: null }
//   } catch (error) {
//     console.error("Error in addRoute:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     return { success: false, error: errorMessage }
//   }
// }

// // Add a new driver
// export async function addDriver(driverData: { shuttle_id: string; driver_name: string; driver_id: string }): Promise<{
//   success: boolean
//   error: string | null
// }> {
//   try {
//     const { error } = await supabase.from("drivers").insert([
//       {
//         ...driverData,
//         created_at: new Date().toISOString(),
//       },
//     ])

//     if (error) {
//       throw error
//     }

//     return { success: true, error: null }
//   } catch (error) {
//     console.error("Error in addDriver:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     return { success: false, error: errorMessage }
//   }
// }

// // Get all drivers
// export async function getDrivers(): Promise<any[]> {
//   try {
//     const { data, error } = await supabase.from("drivers").select(`
//         *,
//         shuttle:shuttles(*)
//       `)

//     if (error) {
//       throw error
//     }

//     return data
//   } catch (error) {
//     console.error("Error in getDrivers:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     throw new Error(errorMessage)
//   }
// }
import { supabase, handleSupabaseError, isOnline } from "./supabase"
import type { Booking, Passenger, Shuttle, Route, ContactInfo, User } from "./definitions"
import { createClient } from "@supabase/supabase-js"

// Improved sanitizeShuttle function with better error handling
const sanitizeShuttle = (shuttle: any) => {
  // Handle the case where shuttle might be null or undefined
  if (!shuttle) return { facilities: "[]" }

  // Ensure facilities exists
  if (!shuttle.facilities) {
    shuttle.facilities = "[]"
    return shuttle
  }

  // If facilities is already an array, convert it to a JSON string
  if (Array.isArray(shuttle.facilities)) {
    try {
      shuttle.facilities = JSON.stringify(shuttle.facilities)
      return shuttle
    } catch (error) {
      console.error(`Error stringifying facilities array for shuttle ${shuttle.shuttle_id || "unknown"}:`, error)
      shuttle.facilities = "[]"
      return shuttle
    }
  }

  // If facilities is a string, ensure it's valid JSON
  if (typeof shuttle.facilities === "string") {
    try {
      // Try to parse and re-stringify to ensure valid JSON
      const parsed = JSON.parse(shuttle.facilities)
      shuttle.facilities = JSON.stringify(parsed)
      return shuttle
    } catch (error) {
      // If parsing fails, log the error and set to empty array
      console.error(`Invalid facilities JSON for shuttle ${shuttle.shuttle_id || "unknown"}: ${shuttle.facilities}`)
      shuttle.facilities = "[]"
      return shuttle
    }
  }

  // If facilities is neither an array nor a string, set it to empty array
  console.warn(
    `Unexpected facilities type for shuttle ${shuttle.shuttle_id || "unknown"}: ${typeof shuttle.facilities}`,
  )
  shuttle.facilities = "[]"
  return shuttle
}

// Get bookings for a user
export async function getBookings(userId?: string): Promise<Booking[]> {
  try {
    // If offline, try to get from local storage
    if (!isOnline()) {
      const cachedBookings = localStorage.getItem("cachedBookings")
      if (cachedBookings) {
        return JSON.parse(cachedBookings)
      }
      return []
    }

    let query = supabase.from("bookings").select(`
        *,
        shuttle:shuttles(*),
        route:routes(*),
        contactInfo:contact_info(*)
      `)

    // If userId is provided, filter by user_id
    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // For each booking, fetch its passengers
    const bookingsWithPassengers = await Promise.all(
      data.map(async (booking) => {
        const { data: passengers, error: passengersError } = await supabase
          .from("passengers")
          .select("*")
          .eq("booking_id", booking.booking_id)

        if (passengersError) {
          console.error("Error fetching passengers:", passengersError)
          return { ...booking, passengers: [] }
        }

        return { ...booking, passengers }
      }),
    )

    // Cache the result in localStorage for offline use
    localStorage.setItem("cachedBookings", JSON.stringify(bookingsWithPassengers))

    return bookingsWithPassengers
  } catch (error) {
    console.error("Error in getBookings:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    throw new Error(errorMessage)
  }
}

// Get a single booking by ID
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    // If offline, try to get from local storage
    if (!isOnline()) {
      const cachedBookings = localStorage.getItem("cachedBookings")
      if (cachedBookings) {
        const bookings = JSON.parse(cachedBookings)
        return bookings.find((booking: Booking) => booking.booking_id === bookingId) || null
      }
      return null
    }

    console.log(`Fetching booking with ID: ${bookingId}`)

    // First, get the booking details
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        shuttle:shuttles(*),
        route:routes(*)
      `)
      .eq("booking_id", bookingId)
      .single()

    if (bookingError) {
      console.error("Error fetching booking:", bookingError)
      throw bookingError
    }

    if (!bookingData) {
      console.log("No booking found with ID:", bookingId)
      return null
    }

    console.log("Booking data retrieved:", bookingData)

    // Fetch passengers for this booking
    const { data: passengers, error: passengersError } = await supabase
      .from("passengers")
      .select("*")
      .eq("booking_id", bookingId)

    if (passengersError) {
      console.error("Error fetching passengers:", passengersError)
      // Continue with empty passengers array
    }

    console.log("Passengers retrieved:", passengers || [])

    // Fetch contact info for this booking
    const { data: contactInfo, error: contactInfoError } = await supabase
      .from("contact_info")
      .select("*")
      .eq("booking_id", bookingId)
      .single()

    if (contactInfoError && contactInfoError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error fetching contact info:", contactInfoError)
      // Continue with null contact info
    }

    console.log("Contact info retrieved:", contactInfo || {})

    // Combine all data
    const completeBooking = {
      ...bookingData,
      passengers: passengers || [],
      contactInfo: contactInfo || null,
    }

    return completeBooking
  } catch (error) {
    console.error("Error in getBookingById:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    throw new Error(errorMessage)
  }
}

// Create a new booking
export async function createBooking(
  bookingData: Omit<Booking, "booking_id">,
  passengers: Passenger[],
  contactInfo: ContactInfo,
): Promise<{ booking: Booking; error: string | null }> {
  try {
    // Generate a booking ID
    const bookingId = `ABU-${Math.floor(10000000 + Math.random() * 90000000)}`

    // Log the booking data for debugging
    console.log("Creating booking with data:", {
      ...bookingData,
      booking_id: bookingId,
    })

    // Start a transaction
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          booking_id: bookingId,
          user_id: bookingData.user_id,
          shuttle_id: bookingData.shuttle_id,
          route_id: bookingData.route_id,
          departure_date: bookingData.departure_date,
          departure_time: bookingData.departure_time,
          arrival_time: bookingData.arrival_time,
          booking_date: new Date().toISOString(),
          status: "upcoming",
          is_premium: bookingData.is_premium,
          price: bookingData.price,
          total_amount: bookingData.total_amount,
          pickup_address: bookingData.pickup_address,
          dropoff_address: bookingData.dropoff_address,
          check_in_status: "pending",
        },
      ])
      .select()
      .single()

    if (bookingError) {
      console.error("Error creating booking:", bookingError)
      throw bookingError
    }

    console.log("Booking created successfully:", booking)

    // Insert contact info
    const { error: contactError } = await supabase.from("contact_info").insert([
      {
        booking_id: bookingId,
        email: contactInfo.email,
        phone: contactInfo.phone,
        special_request: contactInfo.special_requests || "",
      },
    ])

    if (contactError) {
      console.error("Error creating contact info:", contactError)
      throw contactError
    }

    console.log("Contact info created successfully")

    // Process passengers data
    const processedPassengers = passengers.map((passenger) => {
      // Combine first_name and last_name into name if needed
      const name = `${passenger.first_name} ${passenger.last_name}`.trim()

      return {
        name,
        id_type: passenger.id_type,
        id_number: passenger.id_number,
        booking_id: bookingId,
      }
    })

    // Insert passengers
    const { error: passengersError } = await supabase.from("passengers").insert(processedPassengers)

    if (passengersError) {
      console.error("Error creating passengers:", passengersError)
      throw passengersError
    }

    console.log("Passengers created successfully")

    // Return the created booking
    return {
      booking: {
        ...booking,
        passengers,
        contactInfo,
      },
      error: null,
    }
  } catch (error: any) {
    console.error("Error in createBooking:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    return { booking: {} as Booking, error: errorMessage }
  }
}

// Cancel a booking
export async function cancelBooking(bookingId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("booking_id", bookingId)

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in cancelBooking:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    return { success: false, error: errorMessage }
  }
}

// Improved getShuttles function with better error handling
export async function getShuttles() {
  try {
    // If offline, try to get from local storage
    if (!isOnline()) {
      const cachedShuttles = localStorage.getItem("cachedShuttles")
      if (cachedShuttles) {
        try {
          const parsed = JSON.parse(cachedShuttles)
          return parsed.map(sanitizeShuttle)
        } catch (error) {
          console.error("Error parsing cached shuttles:", error)
          return []
        }
      }
      return []
    }

    const { data, error } = await supabase.from("shuttles").select("*")

    if (error) {
      throw error
    }

    if (!data || !Array.isArray(data)) {
      console.error("Invalid data returned from shuttles query:", data)
      return []
    }

    // Sanitize the facilities data for each shuttle
    const sanitizedData = data.map((shuttle) => {
      try {
        return sanitizeShuttle(shuttle)
      } catch (error) {
        console.error(`Error sanitizing shuttle ${shuttle?.shuttle_id || "unknown"}:`, error)
        return { ...shuttle, facilities: "[]" }
      }
    })

    // Cache the result in localStorage for offline use
    try {
      localStorage.setItem("cachedShuttles", JSON.stringify(sanitizedData))
    } catch (error) {
      console.error("Error caching shuttles:", error)
    }

    return sanitizedData
  } catch (error) {
    console.error("Error in getShuttles:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    throw new Error(errorMessage)
  }
}

// Get all routes
export async function getRoutes(): Promise<Route[]> {
  try {
    // If offline, try to get from local storage
    if (!isOnline()) {
      console.log("Device is offline, using cached routes")
      const cachedRoutes = localStorage.getItem("cachedRoutes")
      if (cachedRoutes) {
        return JSON.parse(cachedRoutes)
      }
      console.log("No cached routes found, using fallback routes")
      return getFallbackRoutes()
    }

    // Add timeout to the fetch request
    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 5000),
    )

    const fetchPromise = supabase.from("routes").select("*")

    // Race between fetch and timeout
    const { data, error } = (await Promise.race([fetchPromise, timeoutPromise])) as any

    if (error) {
      console.warn("Error fetching routes from Supabase:", error)
      throw error
    }

    if (!data || !Array.isArray(data)) {
      console.warn("Invalid data returned from routes query:", data)
      throw new Error("Invalid data returned from server")
    }

    // Cache the result in localStorage for offline use
    try {
      localStorage.setItem("cachedRoutes", JSON.stringify(data))
    } catch (storageError) {
      console.warn("Failed to cache routes:", storageError)
    }

    return data
  } catch (error) {
    console.error("Error in getRoutes:", error)

    // Try to get from local storage as fallback
    try {
      const cachedRoutes = localStorage.getItem("cachedRoutes")
      if (cachedRoutes) {
        console.log("Using cached routes due to fetch error")
        return JSON.parse(cachedRoutes)
      }
    } catch (cacheError) {
      console.warn("Error reading cached routes:", cacheError)
    }

    // Return fallback routes if all else fails
    console.log("Using fallback routes due to fetch error")
    return getFallbackRoutes()
  }
}

// Fallback routes for when network requests fail
function getFallbackRoutes(): Route[] {
  return [
    {
      shuttle_id: "SH-1001",
      departure_location: "Main Campus",
      arrival_location: "Kongo Campus",
      base_price: 150,
      premium_price: 250,
      created_at: new Date().toISOString(),
    },
    {
      shuttle_id: "SH-1002",
      departure_location: "Kongo Campus",
      arrival_location: "Main Campus",
      base_price: 150,
      premium_price: 250,
      created_at: new Date().toISOString(),
    },
    {
      shuttle_id: "SH-1003",
      departure_location: "Main Campus",
      arrival_location: "Samaru",
      base_price: 120,
      premium_price: 200,
      created_at: new Date().toISOString(),
    },
    {
      shuttle_id: "SH-1004",
      departure_location: "Samaru",
      arrival_location: "Main Campus",
      base_price: 120,
      premium_price: 200,
      created_at: new Date().toISOString(),
    },
  ]
}

// Verify ticket
export async function verifyTicket(ticketData: any): Promise<boolean> {
  try {
    // Check if the booking exists and is valid
    const { data, error } = await supabase.from("bookings").select("*").eq("booking_id", ticketData.bookingId).single()

    if (error || !data) {
      return false
    }

    // Check if the booking is not cancelled
    if (data.status === "cancelled") {
      return false
    }

    // In a real app, we would also verify the signature or other security measures
    return true
  } catch (error) {
    console.error("Error in verifyTicket:", error)
    return false
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    // If offline, try to get from local storage
    if (!isOnline()) {
      const cachedUser = localStorage.getItem(`user_${userId}`)
      if (cachedUser) {
        return JSON.parse(cachedUser)
      }
      return null
    }

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      throw error
    }

    // Cache the result in localStorage for offline use
    localStorage.setItem(`user_${userId}`, JSON.stringify(data))

    return data
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    throw new Error(errorMessage)
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  userData: Partial<User>,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from("users").update(userData).eq("id", userId)

    if (error) {
      throw error
    }

    // Update the cached user data
    const cachedUser = localStorage.getItem(`user_${userId}`)
    if (cachedUser) {
      const user = JSON.parse(cachedUser)
      localStorage.setItem(`user_${userId}`, JSON.stringify({ ...user, ...userData }))
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    return { success: false, error: errorMessage }
  }
}

// Admin functions
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase.from("users").select("*")

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getAllUsers:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    throw new Error(errorMessage)
  }
}

export async function addShuttle(
  shuttleData: Omit<Shuttle, "shuttle_id">,
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Generate a shuttle ID
    const shuttleId = `SH-${Math.floor(1000 + Math.random() * 9000)}`

    // Ensure facilities is valid JSON if provided
    if (shuttleData.facilities) {
      try {
        if (typeof shuttleData.facilities === "string") {
          // Parse the string and ensure it's an array of strings
          const parsed = JSON.parse(shuttleData.facilities)
          shuttleData.facilities = Array.isArray(parsed) ? parsed : []
        } else if (Array.isArray(shuttleData.facilities)) {
          // Keep array as is, no conversion needed
          shuttleData.facilities = shuttleData.facilities
        } else {
          // Default to empty array if invalid
          shuttleData.facilities = []
        }
      } catch (error) {
        console.error("Invalid facilities data:", error)
        shuttleData.facilities = []
      }
    } else {
      shuttleData.facilities = []
    }

    const { error } = await supabase.from("shuttles").insert([
      {
        shuttle_id: shuttleId,
        ...shuttleData,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in addShuttle:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    return { success: false, error: errorMessage }
  }
}

export async function updateShuttle(
  shuttleId: string,
  shuttleData: Partial<Shuttle>,
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Ensure facilities is valid JSON if provided
    if (shuttleData.facilities) {
      try {
        if (typeof shuttleData.facilities === "string") {
          // Try to parse string to array
          const parsed = JSON.parse(shuttleData.facilities)
          shuttleData.facilities = Array.isArray(parsed) ? parsed : []
        } else if (Array.isArray(shuttleData.facilities)) {
          // Keep array as is
          shuttleData.facilities = shuttleData.facilities
        } else {
          // Default to empty array if invalid
          shuttleData.facilities = []
        }
      } catch (error) {
        console.error("Invalid facilities data:", error)
        shuttleData.facilities = []
      }
    }

    const { error } = await supabase.from("shuttles").update(shuttleData).eq("shuttle_id", shuttleId)

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in updateShuttle:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    return { success: false, error: errorMessage }
  }
}

export async function deleteShuttle(shuttleId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from("shuttles").delete().eq("shuttle_id", shuttleId)

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in deleteShuttle:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    return { success: false, error: errorMessage }
  }
}

export async function addRoute(
  routeData: Omit<Route, "id" | "created_at">,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from("routes").insert([
      {
        ...routeData,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in addRoute:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    return { success: false, error: errorMessage }
  }
}

// Add a new driver
export async function addDriver(driverData: { shuttle_id: string; driver_name: string; driver_id: string }): Promise<{
  success: boolean
  error: string | null
}> {
  try {
    const { error } = await supabase.from("drivers").insert([
      {
        ...driverData,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in addDriver:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    return { success: false, error: errorMessage }
  }
}

// // Get all drivers
// export async function getDrivers(): Promise<any[]> {
//   try {
//     const { data, error } = await supabase.from("drivers").select(`
//         *,
//         shuttle:shuttles(*)
//       `)

//     if (error) {
//       throw error
//     }

//     return data
//   } catch (error) {
//     console.error("Error in getDrivers:", error)
//     const { error: errorMessage } = handleSupabaseError(error)
//     throw new Error(errorMessage)
//   }
// }

// Helper function to generate refund ID
function generateRefundId() {
  return `RF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
}

export async function updateBookingStatus(bookingId: string, status: 'upcoming' | 'completed' | 'cancelled') {
  try {
    const updateData: any = { 
      status,
      // Add refund_status when cancelling
      ...(status === 'cancelled' ? {
        refund_id: generateRefundId(),
        refund_status: 'NOT REFUNDED'
      } : {})
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('booking_id', bookingId)
      .select('*')

    if (error) {
      console.error('Database error:', error)
      throw new Error(error.message)
    }

    return { 
      data: data?.[0], 
      error: null,
      refund_id: status === 'cancelled' ? data?.[0]?.refund_id : null 
    }
  } catch (error) {
    console.error('Update error:', error)
    return { 
      data: null, 
      error: 'Failed to update booking status',
      refund_id: null 
    }
  }
}

export async function updateRefundStatus(bookingId: string, status: 'REFUNDED' | 'NOT REFUNDED') {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ refund_status: status })
      .eq('booking_id', bookingId)
      .select('*')

    if (error) {
      console.error('Database error:', error)
      throw new Error(error.message)
    }

    return { 
      data: data?.[0], 
      error: null
    }
  } catch (error) {
    console.error('Update error:', error)
    return { 
      data: null, 
      error: 'Failed to update refund status'
    }
  }
}
