import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error)

  // Check if we're offline
  if (!navigator.onLine) {
    return { error: "You are currently offline. Please check your internet connection and try again." }
  }

  // Handle specific error types
  if (error.code === "PGRST116") {
    return { error: "Resource not found. Please try again later." }
  }

  if (error.code === "PGRST301") {
    return { error: "Database connection error. Please try again later." }
  }

  if (error.message?.includes("timeout")) {
    return { error: "Request timed out. Please try again later." }
  }

  // Default error message
  return { error: "An error occurred. Please try again later." }
}

// Function to check if we're online
export const isOnline = () => {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}
