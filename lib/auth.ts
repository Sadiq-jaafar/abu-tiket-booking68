import { supabase } from "./supabase"
import type { User } from "./definitions"
import { AuthApiError } from '@supabase/supabase-js'

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
        }
      }
      throw error
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) throw profileError

    return { user: profile, error: null }
  } catch (error) {
    console.error("Error signing in:", error)
    
    // Handle generic errors
    if (error instanceof AuthApiError) {
      return { user: null, error: error.message }
    }
    return { user: null, error: 'An error occurred during login. Please try again.' }
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
//       },
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          created_at: new Date().toISOString()
        }
      }
    })

    if (error) throw error
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: data.user?.id,
        ...userData,
        created_at: new Date().toISOString(),
      })
      .select();

    if (profileError) throw profileError;

    return { user: data.user, error: null };

    // Check if email confirmation was sent
    if (data.user?.identities?.length === 0) {
      return { 
        user: null, 
        error: 'User already exists. Please sign in or reset your password.'
      }
    }

    return { 
      user: data.user, 
      error: null,
      needsConfirmation: !data.user?.email_confirmed_at
    }
  } catch (error) {
    console.error("Error signing up:", error)
    
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case 'User already registered':
          return { user: null, error: 'Email already registered. Please sign in.' }
        case 'Password should be at least 6 characters':
          return { user: null, error: 'Password must be at least 6 characters long.' }
      }
    }
    return { user: null, error: 'An error occurred during registration. Please try again.' }
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
