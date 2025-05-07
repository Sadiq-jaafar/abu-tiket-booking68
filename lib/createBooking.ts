// lib/createBooking.ts
import { supabase, handleSupabaseError as importedHandleSupabaseError, isOnline as importedIsOnline } from "./supabase";
import type { Booking, Passenger, Shuttle, Route, ContactInfo, User } from "./definitions";

export async function createBooking(
  bookingData: Omit<Booking, "booking_id">,
  passengers: Passenger[],
  contactInfo: ContactInfo,
): Promise<{ booking: Booking; error: string | null }> {
  try {
    // Validate required fields
    const requiredFields = [
      { field: bookingData.user_id, name: "user_id" },
      { field: bookingData.shuttle_id, name: "shuttle_id" },
      { field: bookingData.departure_date, name: "departure_date" },
    ];

    const missingFields = requiredFields.filter(f => !f.field).map(f => f.name);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validate passenger data
    if (!passengers || passengers.length === 0) {
      throw new Error("At least one passenger is required");
    }

    // Generate booking ID
    const bookingId = `ABU-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Start transaction
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([{
        booking_id: bookingId,
        user_id: bookingData.user_id,
        shuttle_id: bookingData.shuttle_id,
        departure_date: bookingData.departure_date,
        departure_time: bookingData.departure_time || "08:00:00",
        arrival_time: bookingData.arrival_time || "10:00:00",
        booking_date: new Date().toISOString(),
        status: "upcoming",
        is_premium: bookingData.is_premium || false,
        price: bookingData.price || 0,
        total_amount: bookingData.total_amount || 0,
        pickup_address: bookingData.pickup_address || "",
        dropoff_address: bookingData.dropoff_address || "",
        check_in_status: "pending",
      }])
      .select()
      .single();

    if (bookingError) {
      throw {
        type: "booking_creation_error",
        error: bookingError,
        context: {
          bookingId,
          userId: bookingData.user_id,
          shuttleId: bookingData.shuttle_id,
          timestamp: new Date().toISOString()
        }
      };
    }

    // Insert contact info
    const { error: contactError } = await supabase
      .from("contact_info")
      .insert([{
        booking_id: bookingId,
        email: contactInfo.email,
        phone: contactInfo.phone,
        special_requests: contactInfo.special_requests || "",
      }]);

    if (contactError) {
      throw {
        type: "contact_info_error",
        error: contactError,
        context: {
          bookingId,
          email: contactInfo.email,
          phone: contactInfo.phone
        }
      };
    }

    // Validate and insert passengers
    const validatedPassengers = passengers.map(p => ({
      ...p,
      booking_id: bookingId,
      created_at: new Date().toISOString()
    }));

    const { error: passengersError } = await supabase
      .from("passengers")
      .insert(validatedPassengers);

    if (passengersError) {
      throw {
        type: "passenger_insert_error",
        error: passengersError,
        context: {
          bookingId,
          passengerCount: passengers.length
        }
      };
    }

    return {
      booking: { 
        ...booking,
        passengers: validatedPassengers,
        contactInfo: {
          ...contactInfo,
          booking_id: bookingId
        }
      },
      error: null
    };

  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      context: (error as { context?: object })?.context || {}
    };

    console.error("CreateBooking Error:", JSON.stringify(errorDetails, null, 2));

    // Offline handling
    if (!importedIsOnline()) {
      try {
        const pendingBookings = JSON.parse(localStorage.getItem("pendingBookings") || "[]");
        pendingBookings.push({
          bookingData,
          passengers,
          contactInfo
        });
        localStorage.setItem("pendingBookings", JSON.stringify(pendingBookings));
        return { 
          booking: {} as Booking,
          error: "Booking saved locally. Will sync when online."
        };
      } catch (e) {
        return { 
          booking: {} as Booking,
          error: "Failed to save booking locally. Please check your input."
        };
      }
    }

    return { 
      booking: {} as Booking,
      error: importedHandleSupabaseError(error).error
    };
  }
}

// lib/supabase.ts
export const handleSupabaseError = (error: any): string => {
  // Handle circular references
  const seen = new WeakSet();
  const replacer = (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  };

  // Log full error details
  const errorDetails = {
    error: JSON.parse(JSON.stringify(error, replacer)),
    timestamp: new Date().toISOString()
  };
  
  console.error("Supabase Error Details:", JSON.stringify(errorDetails, null, 2));

  // Network error check
  if (!navigator.onLine) {
    return "Network error: Please check your internet connection";
  }

  // Extract error message from Supabase response
  const supabaseError = error?.error || error;
  const errorMessages = [
    supabaseError?.message,
    supabaseError?.details,
    supabaseError?.hint,
    error?.message,
    "Failed to complete the operation. Please try again."
  ];

  return errorMessages.find(msg => msg && typeof msg === "string") || "Unknown error occurred";
};

export const isOnline = () => typeof navigator !== "undefined" && navigator.onLine;