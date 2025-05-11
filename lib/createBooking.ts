// lib/createBooking.ts
import { supabase, handleSupabaseError as importedHandleSupabaseError, isOnline as importedIsOnline } from "./supabase";
import type { Booking, Passenger, Shuttle, Route, ContactInfo, User } from "./definitions";

function generateBookingId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ABU-${timestamp}${random}`;
}

async function fetchRouteByShuttleId(shuttleId: string) {
  const { data: route, error } = await supabase
    .from('routes')
    .select('*')
    .eq('shuttle_id', shuttleId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch route: ${error.message}`);
  }

  return route;
}

export async function createBooking(
  bookingData: Booking,
  passengers: Passenger[],
  contactInfo: ContactInfo,
): Promise<{ booking: Booking | null; error: string | null }> {
  try {
    // Validate required fields
    if (!bookingData.user_id) {
      throw new Error("User ID is required");
    }

    const booking_id = generateBookingId();

    // Create booking with required fields
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{ 
        ...bookingData,
        booking_id,
        user_id: bookingData.user_id // Ensure user_id is included
      }])
      .select()
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Create passengers with the booking ID
    const passengersWithBookingId = passengers.map(p => ({
      ...p,
      booking_id,
      shuttle_id: bookingData.shuttle_id
    }));

    const { error: passengersError } = await supabase
      .from('passengers')
      .insert(passengersWithBookingId);

    if (passengersError) {
      throw new Error(`Failed to create passengers: ${passengersError.message}`);
    }

    // Create contact info
    const contactWithBookingId = {
      ...contactInfo,
      booking_id
    };

    const { error: contactError } = await supabase
      .from('contact_info')
      .insert([contactWithBookingId]);

    if (contactError) {
      throw new Error(`Failed to create contact info: ${contactError.message}`);
    }

    return { booking, error: null };

  } catch (error) {
    console.error('Booking creation failed:', error);
    return { 
      booking: null, 
      error: error instanceof Error ? error.message : 'Failed to create booking'
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

