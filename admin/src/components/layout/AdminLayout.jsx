import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth.js"
import StatusBadge from "../common/StatusBadge.jsx"
import { usePage } from "../../contexts/PageContext.jsx"
import PageSelector from "./PageSelector.jsx"
import {
  DashboardIcon, LeadsIcon, OrdersIcon, CustomersIcon,
  UsersIcon, PricingIcon, MarketingIcon, ContentIcon, AutomationIcon, AiChatIcon, LogoutIcon, MessengerIcon, SettingsIcon
} from "../icons/index.js"

const NAV_ITEMS = [
  { path: "/dashboard", icon: DashboardIcon, label: "แดชบอร์ด", roles: null },
  { path: "/leads", icon: LeadsIcon, label: "ลีด", roles: ["superadmin", "admin", "staff"] },
  { path: "/orders", icon: OrdersIcon, label: "ออเดอร์", roles: null },
  { path: "/customers", icon: CustomersIcon, label: "ลูกค้า", roles: null },
  { path: "/users", icon: UsersIcon, label: "ผู้ใช้งาน", roles: ["superadmin", "admin"] },
  { path: "/products", icon: PricingIcon, label: "สินค้า", roles: ["superadmin", "admin"] },
  { path: "/pricing", icon: PricingIcon, label: "ราคา", roles: ["superadmin", "admin"] },
  { path: "/attribution", icon: MarketingIcon, label: "การตลาด", roles: ["superadmin", "admin"] },
  { path: "/content", icon: ContentIcon, label: "คอนเทนต์", roles: ["superadmin", "admin"] },
  { path: "/automation", icon: AutomationIcon, label: "ออโตเมชัน", roles: ["superadmin"] },
  { path: "/ai-chat", icon: AiChatIcon, label: "AI Chat", roles: ["superadmin", "admin"] },
  { path: "/messenger", icon: MessengerIcon, label: "Messenger", roles: ["superadmin", "admin"] },
  { path: "/ai-settings", icon: SettingsIcon, label: "ตั้งค่า AI", roles: ["superadmin", "admin"] },
  { path: "/linkedin", icon: MarketingIcon, label: "LinkedIn Posts", roles: ["superadmin"] },
]

function PageContextBar() {
  const { selectedPage, loading } = usePage()

  if (loading || !selectedPage) return null

  const pageName = selectedPage.page_name || selectedPage.name || selectedPage.page_id
  const isAiOn = selectedPage.ai_enabled !== false && selectedPage.ai_enabled !== 0

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>กำลังดูข้อมูลของ:</span>
        <span className="font-semibold text-gray-900">{pageName}</span>
      </div>
      <span className="flex items-center gap-1.5 text-xs">
        <span className={`w-1.5 h-1.5 rounded-full ${isAiOn ? "bg-green-500" : "bg-gray-400"}`} />
        <span className={isAiOn ? "text-green-600" : "text-gray-400"}>
          {isAiOn ? "AI เปิด" : "AI ปิด"}
        </span>
      </span>
    </div>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, hasRole, logout } = useAuth()
  const navigate = useNavigate()

  const visibleNav = NAV_ITEMS.filter((item) => !item.roles || hasRole(item.roles))

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center text-white font-black text-lg">
          H
        </div>
        <div>
          <div className="text-white font-bold text-lg leading-none">HATZ</div>
          <div className="text-white/50 text-xs">Admin Panel</div>
        </div>
      </div>

      {/* Page Selector */}
      <PageSelector />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-red text-white shadow-lg shadow-red-500/20"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">
              {user?.name || "ผู้ใช้งาน"}
            </div>
            <StatusBadge status={user?.role} type="role" className="mt-0.5" />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white text-sm transition-all"
        >
          <LogoutIcon />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-dark flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-brand-dark z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-red rounded-md flex items-center justify-center text-white font-black text-sm">
              H
            </div>
            <span className="font-bold text-gray-900">HATZ Admin</span>
          </div>
        </header>

        {/* Page context bar */}
        <PageContextBar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
