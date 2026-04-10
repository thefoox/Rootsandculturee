'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="fixed inset-0 z-[200] flex bg-cream">
      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden md:block overflow-hidden motion-safe:transition-[width] motion-safe:duration-200',
          collapsed ? 'w-[64px]' : 'w-[240px]'
        )}
      >
        <AdminSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(prev => !prev)} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-[240] bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <AdminSidebar mobile onClose={() => setSidebarOpen(false)} />
        </>
      )}

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-auto">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
