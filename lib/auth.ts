import { supabase } from "./supabase"
import { AuthApiError } from "@supabase/supabase-js"
import type { User } from "./definitions"

// Sign in with email and password
// Sign in with email and password
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Handle specific error cases
      if (error instanceof AuthApiError) {
        switch (error.message) {
          case 'Email not confirmed':
            return { user: null, error: 'Please confirm your email before logging in.' }
          case 'Invalid login credentials':
            return { user: null, error: 'Invalid email or password.' }
          case 'Too many requests':
            return { user: null, error: 'Too many attempts. Please try again later.' }
          default:
            return { user: null, error: error.message }
        }
      }
      return { user: null, error: error.message || 'Authentication failed' }
    }

    if (!data?.user?.id) {
      return { user: null, error: 'No user data returned' }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      return { user: null, error: profileError.message || 'Failed to fetch user profile' }
    }

    if (!profile) {
      return { user: null, error: 'User profile not found' }
    }

    return { user: profile, error: null }
  } catch (error) {
    console.error("Error signing in:", error)
    
    // Improved error handling
    if (error instanceof AuthApiError) {
      return { user: null, error: error.message }
    }
    
    if (error instanceof Error) {
      return { user: null, error: error.message }
    }
    
    return { 
      user: null, 
      error: 'An unexpected error occurred during login. Please try again.' 
    }
  }
}

// Sign up with email and password
// export async function signUp(email: string, password: string, userData: Omit<User, "id" | "created_at">) {
//   try {
//     // Create auth user
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     })

//     if (error) {
//       throw error
//     }

//     // Create user profile
//     const { error: profileError } = await supabase.from("users").insert([
//       {
//         id: data.user?.id,
//         ...userData,
//         created_at: new Date().toISOString(),
        // },
//     ])

//     if (profileError) {
//       throw profileError
//     }

//     return { user: data.user, error: null }
//   } catch (error) {
//     console.error("Error signing up:", error)
//     return { user: null, error: error instanceof Error ? error.message : 'An unknown error occurred' }
//   }
// }
// Sign up with email and password
export async function signUp(email: string, password: string, userData: Omit<User, "id" | "created_at">) {
  try {
    // First check if email exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single()

    if (existingUser) {
      return { user: null, error: "Email already registered. Please sign in." }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role
        }
      }
    })

    if (authError) {
      throw authError
    }

    if (!authData.user?.id) {
      return { user: null, error: "Failed to create user account" }
    }

    // Create user profile in users table
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        id_type: userData.id_type,
        id_number: userData.id_number,
        user_type: userData.user_type,
        role: userData.role,
        email: email,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      // Log the actual error for debugging
      console.error("Profile creation error details:", profileError)
      
      // Rollback auth user if profile creation fails
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
      if (deleteError) {
        console.error("Rollback error:", deleteError)
      }
      
      return { user: null, error: "Failed to create user profile: " + profileError.message }
    }

    return {
      user: profileData,
      error: null
    }

  } catch (error) {
    console.error("SignUp error details:", error)
    if (error instanceof Error) {
      return { user: null, error: error.message }
    }
    return { user: null, error: "Registration failed. Please try again." }
  }
}
// Sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    if (!data.user) {
      return { user: null, error: null }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      throw profileError
    }

    return { user: profile, error: null }
  } catch (error) {
    console.error("Error getting current user:", error)
    return { error: error instanceof Error ? error.message : 'An unknown error occurred' }
  }
}
