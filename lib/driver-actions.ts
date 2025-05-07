import { supabase, handleSupabaseError, isOnline } from "./supabase"

// Get passengers for a driver's shuttle
export async function getDriverShuttlePassengers(shuttleId: string) {
  try {
    // If offline, try to get from local storage
    if (!isOnline()) {
      const cachedPassengers = localStorage.getItem(`shuttle_passengers_${shuttleId}`)
      if (cachedPassengers) {
        return JSON.parse(cachedPassengers)
      }
      return []
    }

    // First, get all bookings for this shuttle
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("shuttle_id", shuttleId)
      .eq("status", "upcoming")

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
      throw bookingsError
    }

    if (!bookings || bookings.length === 0) {
      return []
    }

    // Get all booking IDs
    const bookingIds = bookings.map((booking) => booking.booking_id)

    // Get all passengers for these bookings
    const { data: passengers, error: passengersError } = await supabase
      .from("passengers")
      .select("*")
      .in("booking_id", bookingIds)

    if (passengersError) {
      console.error("Error fetching passengers:", passengersError)
      throw passengersError
    }

    // Format the data for the driver's view
    const formattedPassengers = passengers.map((passenger, index) => {
      const booking = bookings.find((b) => b.booking_id === passenger.booking_id)
      return {
        id: passenger.id || `PSG-${1000 + index}`,
        name: `${passenger.first_name} ${passenger.last_name}`,
        idNumber: passenger.id_number,
        bookingId: passenger.booking_id,
        status: booking?.check_in_status || "pending", // Use check_in_status if available
        seatNumber: passenger.seat_number || `${String.fromCharCode(65 + Math.floor(index / 4))}${(index % 4) + 1}`, // Generate seat numbers like A1, A2, etc.
        pickupLocation: booking?.pickup_address || "",
        dropoffLocation: booking?.dropoff_address || "",
      }
    })

    // Cache the result in localStorage for offline use
    localStorage.setItem(`shuttle_passengers_${shuttleId}`, JSON.stringify(formattedPassengers))

    return formattedPassengers
  } catch (error) {
    console.error("Error in getDriverShuttlePassengers:", error)
    const { error: errorMessage } = handleSupabaseError(error)
    throw new Error(errorMessage)
  }
}

// Verify a passenger ticket for a driver's shuttle
export async function verifyDriverTicket(ticketData: any, driverShuttleId: string) {
  try {
    // Check if the booking exists and is for this shuttle
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_id", ticketData.bookingId)
      .eq("shuttle_id", driverShuttleId)
      .single()

    if (bookingError || !booking) {
      return {
        success: false,
        message: "Ticket not valid for this shuttle.",
      }
    }

    // Check if the booking is not cancelled
    if (booking.status === "cancelled") {
      return {
        success: false,
        message: "This booking has been cancelled.",
      }
    }

    // Check if the passenger exists for this booking
    const { data: passenger, error: passengerError } = await supabase
      .from("passengers")
      .select("*")
      .eq("booking_id", ticketData.bookingId)
      .eq("id_number", ticketData.passengers[0]?.idNumber)
      .single()

    if (passengerError || !passenger) {
      return {
        success: false,
        message: "Passenger not found for this booking.",
      }
    }

    // Update the booking to mark passenger as checked in
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ check_in_status: "checked-in" })
      .eq("booking_id", ticketData.bookingId)

    if (updateError) {
      console.error("Error updating check-in status:", updateError)
    }

    // Return success
    return {
      success: true,
      message: "Passenger successfully verified.",
      passengerName: `${passenger.first_name} ${passenger.last_name}`,
      idNumber: passenger.id_number,
      seatNumber: passenger.seat_number || "A1", // In a real app, this would be assigned or retrieved
      bookingId: ticketData.bookingId,
    }
  } catch (error) {
    console.error("Error in verifyDriverTicket:", error)
    return {
      success: false,
      message: "An error occurred during verification. Please try again.",
    }
  }
}

// Start a trip
export async function startTrip(shuttleId: string) {
  try {
    // In a real app, this would update a trips table in the database
    // For now, we'll simulate a successful start
    return {
      success: true,
      message: "Trip started successfully.",
      tripId: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
    }
  } catch (error) {
    console.error("Error in startTrip:", error)
    return {
      success: false,
      message: "Failed to start trip. Please try again.",
    }
  }
}

// End a trip
export async function endTrip(tripId: string) {
  try {
    // In a real app, this would update the trip status in the database
    // For now, we'll simulate a successful end
    return {
      success: true,
      message: "Trip completed successfully.",
      stats: {
        totalPassengers: 8,
        checkedIn: 3,
        noShow: 5,
        departureTime: new Date().toISOString(),
        arrivalTime: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error in endTrip:", error)
    return {
      success: false,
      message: "Failed to end trip. Please try again.",
    }
  }
}

// Get driver by ID or email
export async function getDriverByIdOrEmail(driverId: string) {
  try {
    // First try to find in the drivers table
    let { data: driver, error } = await supabase
      .from("drivers")
      .select("*")
      .or(`id.eq.${driverId},email.eq.${driverId}`)
      .single()

    // If not found in drivers table, try the driver table (singular)
    if (error || !driver) {
      const { data: driverAlt, error: errorAlt } = await supabase
        .from("driver")
        .select("*")
        .or(`id.eq.${driverId},email.eq.${driverId}`)
        .single()

      if (errorAlt) {
        throw errorAlt
      }

      driver = driverAlt
    }

    if (!driver) {
      return null
    }

    // Get the shuttle information for this driver
    const { data: shuttle, error: shuttleError } = await supabase
      .from("shuttles")
      .select("*")
      .eq("shuttle_id", driver.shuttle_id)
      .single()

    if (shuttleError) {
      console.error("Error fetching shuttle:", shuttleError)
    }

    // Get the route information for this shuttle
    let route = null
    if (shuttle) {
      const { data: routeData, error: routeError } = await supabase
        .from("routes")
        .select("*")
        .eq("id", shuttle.route_id)
        .single()

      if (routeError) {
        console.error("Error fetching route:", routeError)
      } else {
        route = routeData
      }
    }

    // Return driver with shuttle and route information
    return {
      id: driver.driver_id || driver.id,
      name: driver.driver_name || driver.name,
      email: driver.email || "",
      shuttleId: driver.shuttle_id,
      shuttleType: shuttle?.type || "Standard",
      route: route ? `${route.origin} to ${route.destination}` : "Unknown Route",
    }
  } catch (error) {
    console.error("Error in getDriverByIdOrEmail:", error)
    return null
  }
}

// Authenticate driver
export async function authenticateDriver(driverId: string, password: string) {
  try {
    // Get driver information
    const driver = await getDriverByIdOrEmail(driverId)

    if (!driver) {
      return {
        success: false,
        message: "Driver not found. Please check your ID or email.",
      }
    }

    // In a real app, we would verify the password hash
    // For this demo, we're using a fixed password
    if (password !== "12345678") {
      return {
        success: false,
        message: "Invalid password. Please try again.",
      }
    }

    return {
      success: true,
      message: "Login successful.",
      driver,
    }
  } catch (error) {
    console.error("Error in authenticateDriver:", error)
    return {
      success: false,
      message: "An error occurred during authentication. Please try again.",
    }
  }
}
