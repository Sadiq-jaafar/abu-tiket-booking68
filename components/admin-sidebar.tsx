"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Bus, QrCode, User } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    window.location.href = "/login"
  }

  return (
    <aside className="bg-[#006400] text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-green-700">
        <h2 className="text-xl font-bold">Abu Tiket Admin</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {[
            { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/admin/bookings", icon: Calendar, label: "Bookings" },
            { href: "/admin/shuttles", icon: Bus, label: "Shuttles" },
            { href: "/admin/drivers", icon: User, label: "Drivers" },
            { href: "/admin/users", icon: Users, label: "Users" },
            { href: "/admin/scanner", icon: QrCode, label: "Ticket Scanner" },
            { href: "/admin/settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:text-white hover:bg-green-700"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-green-100 hover:text-white hover:bg-green-700 w-full"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
