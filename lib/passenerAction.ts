// lib/passengerActions.ts - Add these functions
import { supabase } from "@/lib/supabase";
import type { Passenger, ContactInfo } from "@/lib/definitions";

export const createBooking = async (bookingData: any) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return { booking: data, error: null };
  } catch (error) {
    return { booking: null, error: (error as Error).message };
  }
};

// export const createPassengers = async (passengers: Passenger[]) => {
//   try {
//     const { data, error } = await supabase
//       .from('passengers')
//       .insert(passengers)
//       .select();

//     if (error) throw error;
//     return { passengers: data, error: null };
//   } catch (error) {
//     return { passengers: null, error: (error as Error).message };
//   }
// };

// export const createContactInfo = async (contactInfo: ContactInfo) => {
//   try {
//     const { data, error } = await supabase
//       .from('contact_info')
//       .insert([contactInfo])
//       .select()
//       .single();

//     if (error) throw error;
//     return { contactInfo: data, error: null };
//   } catch (error) {
//     return { contactInfo: null, error: (error as Error).message};
//   }
// };
const validatePassenger = (passenger: Passenger) => {
    const errors: string[] = [];
    
    if (!passenger.first_name?.trim()) {
      errors.push("First name is required");
    }
    if (!passenger.last_name?.trim()) {
      errors.push("Last name is required");
    }
    if (!passenger.id_type?.trim()) {
      errors.push("ID type is required");
    }
    if (!passenger.id_number?.trim()) {
      errors.push("ID number is required");
    }
    if (!passenger.booking_id?.trim()) {
      errors.push("Booking reference is missing");
    }
    if (!passenger.shuttle_id?.trim()) {
      errors.push("Shuttle reference is missing");
    }
  
    if (errors.length > 0) {
      throw new Error(`Invalid passenger data: ${errors.join(", ")}`);
    }
  };
  
  const validateContactInfo = (contactInfo: ContactInfo) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;
    const errors: string[] = [];
  
    if (!contactInfo.email?.trim()) {
      errors.push("Email is required");
    } else if (!emailRegex.test(contactInfo.email)) {
      errors.push("Invalid email format");
    }
  
    if (!contactInfo.phone?.trim()) {
      errors.push("Phone number is required");
    } else {
      const cleanPhone = contactInfo.phone.replace(/[^0-9]/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        errors.push("Phone number must be 10-15 digits");
      }
    }
  
    if (!contactInfo.booking_id?.trim()) {
      errors.push("Booking reference is missing");
    }
  
    if (errors.length > 0) {
      throw new Error(`Invalid contact info: ${errors.join(", ")}`);
    }
  };
  
  // Updated functions with validation
  export const createPassengers = async (passengers: Passenger[]) => {
    try {
      // Validate all passengers first
      passengers.forEach(validatePassenger);
  
      const { data, error } = await supabase
        .from('passengers')
        .insert(passengers)
        .select();
  
      if (error) throw error;
      return { passengers: data, error: null };
    } catch (error) {
      return { 
        passengers: null, 
        error: error instanceof Error ? error.message : "Failed to create passengers"
      };
    }
  };
  
  export const createContactInfo = async (contactInfo: ContactInfo) => {
    try {
      validateContactInfo(contactInfo);
  
      const { data, error } = await supabase
        .from('contact_info')
        .insert([contactInfo])
        .select()
        .single();
  
      if (error) throw error;
      return { contactInfo: data, error: null };
    } catch (error) {
      return { 
        contactInfo: null, 
        error: error instanceof Error ? error.message : "Failed to create contact info"
      };
    }
  };