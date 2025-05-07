// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency (₦)
export function formatCurrency(amount: number | string): string {
  if (amount === undefined || amount === null) return "₦0.00"

  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (isNaN(numAmount)) return "₦0.00"

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

// Format date
export function formatDate(dateString: string): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // Return original if invalid

    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString // Return original on error
  }
}

// Format time
export function formatTime(timeString: string): string {
  if (!timeString) return ""

  // If it's already in HH:MM format, return it
  if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString

  try {
    // Try to parse as ISO date
    const date = new Date(timeString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    }

    return timeString // Return original if not parseable
  } catch (error) {
    console.error("Error formatting time:", error)
    return timeString // Return original on error
  }
}
