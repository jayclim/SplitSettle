"use client"

import { Bell, LogOut, Zap } from "lucide-react"
import { NotificationsModal } from "./NotificationsModal"
import { ThemeToggle } from "./ui/theme-toggle"
import { Button } from "./ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export function Header() {
  const { logout } = useAuth()
  const router = useRouter()
  const handleLogout = () => {
    logout()
    router.push("/login")
  }
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SplitSettle
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationsModal />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}