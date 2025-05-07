import { supabase } from "./supabase"
import type { User } from "./definitions"

// Sign in with email and password
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
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
    console.error("Error signing in:", error)
    return { user: null, error: error.message }
  }
}

// Sign up with email and password
export async function signUp(email: string, password: string, userData: Omit<User, "id" | "created_at">) {
  try {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: data.user?.id,
        ...userData,
        created_at: new Date().toISOString(),
      },
    ])

    if (profileError) {
      throw profileError
    }

    return { user: data.user, error: null }
  } catch (error) {
    console.error("Error signing up:", error)
    return { user: null, error: error.message }
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
    return { error: error.message }
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
    return { user: null, error: error.message }
  }
}
