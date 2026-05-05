'use client'

import { useState, useCallback } from 'react'
import Loader from '@/components/loader'
import Sidebar from '@/components/sidebar'
import DashboardView from '@/components/dashboard-view'
import FinancialReportsView from '@/components/financial-reports-view'
import NotificationsView from '@/components/notifications-view'
import LoginView from '@/components/login-view'
import SignupView from '@/components/signup-view'

interface UserInfo {
  name: string
  role: 'admin' | 'employee'
  initials: string
}

export default function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [showLoader, setShowLoader] = useState(false)

  const handleLoaderFinish = useCallback(() => setShowLoader(false), [])

  const handleLogin = (userInfo: { name: string; role: string; initials: string }) => {
    setUser({ name: userInfo.name, role: userInfo.role as 'admin' | 'employee', initials: userInfo.initials })
    setIsLoggedIn(true)
    setShowLoader(true)
  }
  const handleSignup = () => { setAuthPage('login') }
  const handleLogout = () => { setIsLoggedIn(false); setUser(null); setActiveTab('dashboard'); setAuthPage('login') }

  if (!isLoggedIn) {
    return authPage === 'login'
      ? <LoginView onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />
      : <SignupView onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onAddClick={() => setActiveTab('financial')} userName={user?.name} />
      case 'financial':
        return <FinancialReportsView userRole={user?.role || 'employee'} userName={user?.name || ''} />
      case 'notifications':
        return <NotificationsView />
      default:
        return <DashboardView onAddClick={() => setActiveTab('financial')} userName={user?.name} />
    }
  }

  return (
    <>
      <style>{`
        .app-layout { display: flex; min-height: 100vh; background: #f5f7fa; direction: rtl; }
        .app-main { flex: 1; overflow-y: auto; min-width: 0; }
        @media (max-width: 768px) { .app-main { padding-top: 64px; } }
      `}</style>
      {showLoader && <Loader onFinish={handleLoaderFinish} userName={user?.name || ''} duration={3000} />}
      <div className="app-layout">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          userName={user?.name}
          userRole={user?.role === 'admin' ? 'الإدارة' : 'الموظف'}
          userInitials={user?.initials}
        />
        <div className="app-main">
          {renderView()}
        </div>
      </div>
    </>
  )
}
