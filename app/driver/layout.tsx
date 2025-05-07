import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ABU Shuttle - Driver Portal",
  description: "Driver portal for ABU Shuttle service",
}

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}
