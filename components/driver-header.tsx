"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, Menu, Home, Users, QrCode, Clock, Settings } from "lucide-react"

interface DriverHeaderProps {
  driverName: string
  onLogout: () => void
  title: string;
}


export function DriverHeader({ driverName, onLogout }: DriverHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const closeSheet = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/driver/dashboard"
                  className="flex items-center gap-2 text-lg font-medium"
                  onClick={closeSheet}
                >
                  <Home className="h-5 w-5" /> Dashboard
                </Link>
                <Link
                  href="/driver/scanner"
                  className="flex items-center gap-2 text-lg font-medium"
                  onClick={closeSheet}
                >
                  <QrCode className="h-5 w-5" /> Scan Tickets
                </Link>
                <Link
                  href="/driver/passengers"
                  className="flex items-center gap-2 text-lg font-medium"
                  onClick={closeSheet}
                >
                  <Users className="h-5 w-5" /> Passengers
                </Link>
                <Link
                  href="/driver/trip-history"
                  className="flex items-center gap-2 text-lg font-medium"
                  onClick={closeSheet}
                >
                  <Clock className="h-5 w-5" /> Trip History
                </Link>
                <Link
                  href="/driver/settings"
                  className="flex items-center gap-2 text-lg font-medium"
                  onClick={closeSheet}
                >
                  <Settings className="h-5 w-5" /> Settings
                </Link>
                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  onClick={() => {
                    closeSheet()
                    onLogout()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/driver/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-xl">ABU Shuttle</span>
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">Driver</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/driver/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/driver/scanner" className="text-sm font-medium transition-colors hover:text-primary">
            Scan Tickets
          </Link>
          <Link href="/driver/passengers" className="text-sm font-medium transition-colors hover:text-primary">
            Passengers
          </Link>
          <Link href="/driver/trip-history" className="text-sm font-medium transition-colors hover:text-primary">
            Trip History
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-sm font-medium">Welcome, {driverName}</span>
          <Button variant="outline" size="sm" onClick={onLogout} className="hidden md:flex">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
