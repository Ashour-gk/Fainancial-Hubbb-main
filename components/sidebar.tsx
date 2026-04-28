'use client'

import { useState, useEffect } from 'react'
import { LogOut, FileText, LayoutGrid, ChevronRight, Menu, X, Bell } from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout?: () => void
  userName?: string
  userRole?: string
  userInitials?: string
}

export default function Sidebar({ activeTab, onTabChange, onLogout, userName, userRole, userInitials }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handle = (e: MediaQueryListEvent | MediaQueryList) => { setIsMobile(e.matches); if (e.matches) { setCollapsed(false); setMobileOpen(false) } }
    handle(mq); mq.addEventListener('change', handle); return () => mq.removeEventListener('change', handle)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1100px)')
    const handle = (e: MediaQueryListEvent | MediaQueryList) => { if (!window.matchMedia('(max-width: 768px)').matches) setCollapsed(e.matches) }
    handle(mq); mq.addEventListener('change', handle); return () => mq.removeEventListener('change', handle)
  }, [])

  const tabs = [
    { id: 'dashboard', icon: <LayoutGrid size={20} />, label: 'لوحة المعلومات' },
    { id: 'financial', icon: <FileText size={20} />, label: 'التقارير المالية' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'الإشعارات' },
  ]

  const handleNav = (id: string) => { onTabChange(id); if (isMobile) setMobileOpen(false) }
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const handleLogout = () => { setShowLogoutConfirm(true) }
  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    if (isMobile) setMobileOpen(false)
    if (onLogout) onLogout()
    else onTabChange('dashboard')
  }
  const cancelLogout = () => { setShowLogoutConfirm(false) }

  return (
    <>
      <style>{`
        .msb-ham{display:none;position:fixed;top:14px;right:14px;z-index:300;width:40px;height:40px;border-radius:12px;border:none;background:#2d1215;color:#e2e8f0;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.3);transition:background .18s}
        .msb-ham:hover{background:#4a1a1f}
        .msb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(2px);z-index:200;animation:msbFadeIn .2s ease}
        @keyframes msbFadeIn{from{opacity:0}to{opacity:1}}
        .msb{width:230px;min-width:230px;flex-shrink:0;height:100vh;position:sticky;top:0;display:flex;flex-direction:column;background:linear-gradient(180deg,#1a0a0a 0%,#2d1215 60%,#1a0808 100%);border-left:1px solid rgba(255,255,255,0.07);direction:rtl;overflow:visible;transition:width .28s cubic-bezier(.4,0,.2,1),min-width .28s cubic-bezier(.4,0,.2,1);z-index:210}
        .msb.msb-collapsed{width:68px;min-width:68px}
        .msb-toggle{position:absolute;left:-14px;top:28px;width:28px;height:28px;border-radius:50%;background:#4a1a1f;border:2px solid rgba(255,255,255,0.1);box-shadow:0 2px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#94a3b8;transition:background .18s,color .18s,transform .28s cubic-bezier(.4,0,.2,1);z-index:50;flex-shrink:0}
        .msb-toggle:hover{background:#dc2626;color:#fff;border-color:rgba(220,38,38,0.4)}
        .msb.msb-collapsed .msb-toggle{transform:rotate(180deg)}
        .msb-brand{display:flex;align-items:center;gap:10px;padding:24px 16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);overflow:hidden;white-space:nowrap}
        .msb-brand-logo{width:36px;height:36px;border-radius:10px;flex-shrink:0;filter:drop-shadow(0 3px 8px rgba(220,38,38,0.4))}
        .msb-brand-text{overflow:hidden;transition:opacity .2s ease,width .28s cubic-bezier(.4,0,.2,1);width:140px}
        .msb.msb-collapsed .msb-brand-text{opacity:0;width:0;pointer-events:none}
        .msb-brand-name{font-size:.95rem;font-weight:700;color:#fff;letter-spacing:.01em}
        .msb-brand-sub{font-size:.72rem;color:rgba(148,163,184,0.8)}
        .msb-nav{flex:1;padding:14px 8px;display:flex;flex-direction:column;gap:3px;overflow-y:auto;overflow-x:hidden}
        .msb-section-label{font-size:.68rem;font-weight:700;color:rgba(148,163,184,0.55);letter-spacing:.08em;text-transform:uppercase;padding:10px 10px 4px;white-space:nowrap;overflow:hidden;transition:opacity .2s ease,height .28s ease,padding .28s ease}
        .msb.msb-collapsed .msb-section-label{opacity:0;height:0;padding:0}
        .msb-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:11px;border:none;background:transparent;color:rgba(203,213,225,0.7);cursor:pointer;transition:all .17s ease;font-family:inherit;font-size:.875rem;font-weight:500;text-align:right;direction:rtl;width:100%;position:relative;white-space:nowrap;overflow:hidden}
        .msb.msb-collapsed .msb-item{justify-content:center;padding:10px;gap:0}
        .msb-item:hover{background:rgba(255,255,255,0.07);color:#fff}
        .msb-item:hover .msb-item-icon{color:#f87171}
        .msb-item.msb-active{background:rgba(220,38,38,0.18);color:#fff;font-weight:600}
        .msb-item.msb-active .msb-item-icon{color:#f87171}
        .msb-item.msb-active::before{content:'';position:absolute;right:0;top:50%;transform:translateY(-50%);width:3px;height:60%;border-radius:0 3px 3px 0;background:#dc2626}
        .msb-item:focus-visible,.msb-logout:focus-visible{outline:2px solid #f87171;outline-offset:2px;border-radius:11px}
        .msb-item-icon{display:flex;align-items:center;flex-shrink:0;color:rgba(148,163,184,0.8);transition:color .17s}
        .msb-item-label{flex:1;transition:opacity .18s ease,width .28s cubic-bezier(.4,0,.2,1);overflow:hidden}
        .msb.msb-collapsed .msb-item-label{opacity:0;width:0;flex:0}
        .msb-item .msb-tooltip,.msb-logout .msb-tooltip{display:none}
        .msb.msb-collapsed .msb-item .msb-tooltip,.msb.msb-collapsed .msb-logout .msb-tooltip{display:block;position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);background:#4a1a1f;color:#e2e8f0;font-size:.8rem;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;pointer-events:none;opacity:0;box-shadow:0 4px 14px rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);transition:opacity .15s,transform .15s;z-index:100}
        .msb.msb-collapsed .msb-item:hover .msb-tooltip,.msb.msb-collapsed .msb-logout:hover .msb-tooltip{opacity:1;transform:translateY(-50%) translateX(-4px)}
        .msb.msb-collapsed .msb-logout .msb-tooltip{color:#fca5a5;border-color:rgba(239,68,68,0.2)}
        .msb-bottom{padding:10px 8px 0;border-top:1px solid rgba(255,255,255,0.06);overflow:hidden}
        .msb-logout{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:11px;border:none;background:transparent;color:rgba(248,113,113,0.8);cursor:pointer;transition:all .17s ease;font-family:inherit;font-size:.875rem;font-weight:500;text-align:right;direction:rtl;width:100%;white-space:nowrap;overflow:hidden;position:relative}
        .msb.msb-collapsed .msb-logout{justify-content:center;gap:0;padding:10px}
        .msb-logout:hover{background:rgba(239,68,68,0.12);color:#f87171}
        .msb-logout-icon{display:flex;align-items:center;flex-shrink:0}
        .msb-logout-label{transition:opacity .18s ease,width .28s cubic-bezier(.4,0,.2,1);overflow:hidden}
        .msb.msb-collapsed .msb-logout-label{opacity:0;width:0}
        .msb-divider{height:1px;background:rgba(255,255,255,0.06);margin:6px 12px}
        .msb-user{display:flex;align-items:center;gap:10px;padding:14px 10px 20px;direction:rtl;overflow:hidden;white-space:nowrap}
        .msb.msb-collapsed .msb-user{justify-content:center;padding:14px 0 20px}
        .msb-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#b91c1c);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.8rem;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(220,38,38,0.35)}
        .msb-user-info{overflow:hidden;transition:opacity .18s ease,width .28s cubic-bezier(.4,0,.2,1);flex:1}
        .msb.msb-collapsed .msb-user-info{opacity:0;width:0;flex:0}
        .msb-user-name{font-size:.875rem;font-weight:600;color:rgba(226,232,240,0.9);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .msb-user-role{font-size:.72rem;color:rgba(148,163,184,0.65)}
        .msb-nav::-webkit-scrollbar{width:4px}
        .msb-nav::-webkit-scrollbar-track{background:transparent}
        .msb-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}
        @media(max-width:768px){
          .msb-ham{display:flex}
          .msb{position:fixed;top:0;right:0;height:100vh;width:260px !important;min-width:260px !important;transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);z-index:250;box-shadow:-8px 0 32px rgba(0,0,0,0.4)}
          .msb.msb-mobile-open{transform:translateX(0)}
          .msb.msb-collapsed{width:260px !important;min-width:260px !important}
          .msb.msb-collapsed .msb-brand-text{opacity:1;width:140px}
          .msb.msb-collapsed .msb-section-label{opacity:1;height:auto;padding:10px 10px 4px}
          .msb.msb-collapsed .msb-item{justify-content:flex-start;padding:10px 12px;gap:11px}
          .msb.msb-collapsed .msb-item-label{opacity:1;width:auto;flex:1}
          .msb.msb-collapsed .msb-logout{justify-content:flex-start;gap:11px;padding:10px 12px}
          .msb.msb-collapsed .msb-logout-label{opacity:1;width:auto}
          .msb.msb-collapsed .msb-user{justify-content:flex-start;padding:14px 10px 20px}
          .msb.msb-collapsed .msb-user-info{opacity:1;width:auto;flex:1}
          .msb-toggle{display:none}
          .msb-overlay{display:block}
          .msb-close-btn{display:flex !important}
        }
        @media(min-width:769px) and (max-width:1100px){.msb{width:68px;min-width:68px}.msb.msb-collapsed{width:68px;min-width:68px}}
        .msb-close-btn{display:none;position:absolute;left:12px;top:22px;width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.07);color:#94a3b8;align-items:center;justify-content:center;cursor:pointer;transition:background .15s,color .15s;z-index:10}
        .msb-close-btn:hover{background:rgba(255,255,255,0.14);color:#fff}
        .logout-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:lmoFade .2s ease}
        @keyframes lmoFade{from{opacity:0}to{opacity:1}}
        .logout-modal{background:#fff;border-radius:20px;padding:32px 28px 24px;width:90%;max-width:360px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:lmoSlide .25s ease}
        @keyframes lmoSlide{from{opacity:0;transform:scale(.92) translateY(10px)}to{opacity:1;transform:none}}
        .logout-modal-icon{width:56px;height:56px;border-radius:50%;background:#fef2f2;color:#dc2626;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
        .logout-modal-title{font-size:1.1rem;font-weight:800;color:#1a1a2e;margin-bottom:8px}
        .logout-modal-desc{font-size:.88rem;color:#64748b;margin-bottom:24px}
        .logout-modal-btns{display:flex;gap:10px;justify-content:center}
        .logout-modal-btn{padding:10px 24px;border-radius:12px;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s;border:none;font-family:inherit}
        .logout-modal-btn-confirm{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;box-shadow:0 4px 14px rgba(220,38,38,.3)}
        .logout-modal-btn-confirm:hover{background:linear-gradient(135deg,#ef4444,#dc2626);transform:translateY(-1px)}
        .logout-modal-btn-cancel{background:#f1f5f9;color:#475569;border:1.5px solid #e2e8f0}
        .logout-modal-btn-cancel:hover{background:#e2e8f0}
      `}</style>

      <button className="msb-ham" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة"><Menu size={20} /></button>
      {isMobile && mobileOpen && <div className="msb-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={['msb', !isMobile && collapsed ? 'msb-collapsed' : '', isMobile && mobileOpen ? 'msb-mobile-open' : ''].filter(Boolean).join(' ')}>
        <button className="msb-close-btn" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة"><X size={15} /></button>
        {!isMobile && (
          <button className="msb-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}>
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        )}

        <div className="msb-brand">
          <img src="/logo.png" alt="Logo" className="msb-brand-logo" />
          <div className="msb-brand-text">
            <div className="msb-brand-name">Financial Hub</div>
            <div className="msb-brand-sub">نظام التقارير المالية</div>
          </div>
        </div>

        <nav className="msb-nav">
          <div className="msb-section-label">القائمة الرئيسية</div>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => handleNav(tab.id)} className={`msb-item${activeTab === tab.id ? ' msb-active' : ''}`}>
              <span className="msb-item-icon">{tab.icon}</span>
              <span className="msb-item-label">{tab.label}</span>
              <span className="msb-tooltip">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="msb-bottom">
          <button className="msb-logout" onClick={handleLogout}>
            <span className="msb-logout-icon"><LogOut size={19} /></span>
            <span className="msb-logout-label">تسجيل الخروج</span>
            <span className="msb-tooltip">تسجيل الخروج</span>
          </button>
          <div className="msb-divider" />
          <div className="msb-user">
            <div className="msb-avatar">{userInitials || 'م'}</div>
            <div className="msb-user-info">
              <div className="msb-user-name">{userName || 'مستخدم'}</div>
              <div className="msb-user-role">{userRole || 'مستخدم'}</div>
            </div>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon"><LogOut size={24} /></div>
            <div className="logout-modal-title">تسجيل الخروج</div>
            <div className="logout-modal-desc">هل أنت متأكد من تسجيل الخروج؟</div>
            <div className="logout-modal-btns">
              <button className="logout-modal-btn logout-modal-btn-confirm" onClick={confirmLogout}>نعم، خروج</button>
              <button className="logout-modal-btn logout-modal-btn-cancel" onClick={cancelLogout}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
