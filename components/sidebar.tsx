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
        /* ── Hamburger ── */
        .msb-ham{display:none;position:fixed;top:14px;left:14px;z-index:300;width:40px;height:40px;border-radius:12px;border:none;background:#dc2626;color:#fff;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(220,38,38,0.35);transition:background .18s}
        .msb-ham:hover{background:#b91c1c}

        /* ── Overlay ── */
        .msb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.3);backdrop-filter:blur(2px);z-index:200;animation:msbFadeIn .2s ease}
        @keyframes msbFadeIn{from{opacity:0}to{opacity:1}}

        /* ── Sidebar shell ── */
        .msb{
          width:240px;min-width:240px;flex-shrink:0;
          height:100vh;position:sticky;top:0;
          display:flex;flex-direction:column;
          background:#ffffff;
          border-left:1px solid #e8edf4;
          direction:rtl;
          overflow:visible;
          transition:width .28s cubic-bezier(.4,0,.2,1),min-width .28s cubic-bezier(.4,0,.2,1);
          z-index:210;
          box-shadow:2px 0 16px rgba(15,27,45,.06)
        }
        .msb.msb-collapsed{width:68px;min-width:68px}

        /* ── Collapse toggle ── */
        .msb-toggle{position:absolute;left:-14px;top:28px;width:28px;height:28px;border-radius:50%;background:#fff;border:1.5px solid #e8edf4;box-shadow:0 2px 10px rgba(15,27,45,.12);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#94a3b8;transition:background .18s,color .18s,transform .28s cubic-bezier(.4,0,.2,1),border-color .18s;z-index:50;flex-shrink:0}
        .msb-toggle:hover{background:#dc2626;color:#fff;border-color:#dc2626}
        .msb.msb-collapsed .msb-toggle{transform:rotate(180deg)}

        /* ── Brand ── */
        .msb-brand{display:flex;align-items:center;justify-content:center;padding:20px 16px 18px;border-bottom:1px solid #f1f5f9;overflow:hidden;min-height:72px}
        .msb-brand-logo-full{height:44px;width:auto;max-width:100%;object-fit:contain;transition:all .2s ease}
        .msb.msb-collapsed .msb-brand-logo-full{max-width:36px;height:36px;object-fit:cover;object-position:left center}

        /* ── Nav ── */
        .msb-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;overflow-x:hidden}
        .msb-section-label{font-size:.68rem;font-weight:700;color:#94a3b8;letter-spacing:.08em;text-transform:uppercase;padding:8px 10px 4px;white-space:nowrap;overflow:hidden;transition:opacity .2s ease,height .28s ease,padding .28s ease}
        .msb.msb-collapsed .msb-section-label{opacity:0;height:0;padding:0}

        /* ── Nav items ── */
        .msb-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:none;background:transparent;color:#64748b;cursor:pointer;transition:all .17s ease;font-family:inherit;font-size:.875rem;font-weight:500;text-align:right;direction:rtl;width:100%;position:relative;white-space:nowrap;overflow:hidden}
        .msb.msb-collapsed .msb-item{justify-content:center;padding:10px;gap:0}
        .msb-item:hover{background:#fef2f2;color:#dc2626}
        .msb-item:hover .msb-item-icon{color:#dc2626}
        .msb-item.msb-active{background:#dc2626;color:#fff;font-weight:700;box-shadow:0 4px 14px rgba(220,38,38,.3)}
        .msb-item.msb-active .msb-item-icon{color:#fff}
        .msb-item:focus-visible,.msb-logout:focus-visible{outline:2px solid #dc2626;outline-offset:2px;border-radius:10px}
        .msb-item-icon{display:flex;align-items:center;flex-shrink:0;color:#94a3b8;transition:color .17s}
        .msb-item.msb-active .msb-item-icon{color:#fff}
        .msb-item-label{flex:1;transition:opacity .18s ease,width .28s cubic-bezier(.4,0,.2,1);overflow:hidden}
        .msb.msb-collapsed .msb-item-label{opacity:0;width:0;flex:0}

        /* ── Tooltips (collapsed) ── */
        .msb-item .msb-tooltip,.msb-logout .msb-tooltip{display:none}
        .msb.msb-collapsed .msb-item .msb-tooltip,.msb.msb-collapsed .msb-logout .msb-tooltip{display:block;position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);background:#1a1a2e;color:#e2e8f0;font-size:.8rem;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;pointer-events:none;opacity:0;box-shadow:0 4px 14px rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.08);transition:opacity .15s,transform .15s;z-index:100}
        .msb.msb-collapsed .msb-item:hover .msb-tooltip,.msb.msb-collapsed .msb-logout:hover .msb-tooltip{opacity:1;transform:translateY(-50%) translateX(-4px)}

        /* ── Bottom / Logout ── */
        .msb-bottom{padding:10px 10px 0;border-top:1px solid #f1f5f9;overflow:hidden}
        .msb-logout{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:none;background:transparent;color:#ef4444;cursor:pointer;transition:all .17s ease;font-family:inherit;font-size:.875rem;font-weight:600;text-align:right;direction:rtl;width:100%;white-space:nowrap;overflow:hidden;position:relative}
        .msb.msb-collapsed .msb-logout{justify-content:center;gap:0;padding:10px}
        .msb-logout:hover{background:#fef2f2;color:#dc2626}
        .msb-logout-icon{display:flex;align-items:center;flex-shrink:0}
        .msb-logout-label{transition:opacity .18s ease,width .28s cubic-bezier(.4,0,.2,1);overflow:hidden}
        .msb.msb-collapsed .msb-logout-label{opacity:0;width:0}
        .msb-divider{height:1px;background:#f1f5f9;margin:8px 12px}

        /* ── User card ── */
        .msb-user{display:flex;align-items:center;gap:10px;padding:14px 12px 18px;direction:rtl;overflow:hidden;white-space:nowrap}
        .msb.msb-collapsed .msb-user{justify-content:center;padding:14px 0 18px}
        .msb-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#b91c1c);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.82rem;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(220,38,38,.3)}
        .msb-user-info{overflow:hidden;transition:opacity .18s ease,width .28s cubic-bezier(.4,0,.2,1);flex:1}
        .msb.msb-collapsed .msb-user-info{opacity:0;width:0;flex:0}
        .msb-user-name{font-size:.875rem;font-weight:700;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .msb-user-role{font-size:.72rem;color:#94a3b8;font-weight:500;margin-top:1px}

        /* ── Scrollbar ── */
        .msb-nav::-webkit-scrollbar{width:4px}
        .msb-nav::-webkit-scrollbar-track{background:transparent}
        .msb-nav::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}

        /* ── Mobile ── */
        @media(max-width:768px){
          .msb-ham{display:flex}
          .msb{position:fixed;top:0;right:0;height:100vh;width:260px !important;min-width:260px !important;transform:translateX(100%);transition:transform .28s cubic-bezier(.4,0,.2,1);z-index:250;box-shadow:-8px 0 32px rgba(0,0,0,.15)}
          .msb.msb-mobile-open{transform:translateX(0)}
          .msb.msb-collapsed{width:260px !important;min-width:260px !important}
          .msb.msb-collapsed .msb-brand-text{opacity:1;width:150px}
          .msb.msb-collapsed .msb-section-label{opacity:1;height:auto;padding:8px 10px 4px}
          .msb.msb-collapsed .msb-item{justify-content:flex-start;padding:10px 12px;gap:10px}
          .msb.msb-collapsed .msb-item-label{opacity:1;width:auto;flex:1}
          .msb.msb-collapsed .msb-logout{justify-content:flex-start;gap:10px;padding:10px 12px}
          .msb.msb-collapsed .msb-logout-label{opacity:1;width:auto}
          .msb.msb-collapsed .msb-user{justify-content:flex-start;padding:14px 12px 18px}
          .msb.msb-collapsed .msb-user-info{opacity:1;width:auto;flex:1}
          .msb-toggle{display:none}
          .msb-overlay{display:block}
          .msb-close-btn{display:flex !important}
        }
        @media(min-width:769px) and (max-width:1100px){.msb{width:68px;min-width:68px}.msb.msb-collapsed{width:68px;min-width:68px}}

        /* ── Mobile close button ── */
        .msb-close-btn{display:none;position:absolute;left:12px;top:22px;width:28px;height:28px;border-radius:8px;border:1px solid #e8edf4;background:#f8fafc;color:#94a3b8;align-items:center;justify-content:center;cursor:pointer;transition:background .15s,color .15s;z-index:10}
        .msb-close-btn:hover{background:#fef2f2;color:#dc2626}

        /* ── Logout modal ── */
        .logout-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:lmoFade .2s ease}
        @keyframes lmoFade{from{opacity:0}to{opacity:1}}
        .logout-modal{background:#fff;border-radius:20px;padding:32px 28px 24px;width:90%;max-width:360px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:lmoSlide .25s ease;direction:rtl}
        @keyframes lmoSlide{from{opacity:0;transform:scale(.92) translateY(10px)}to{opacity:1;transform:none}}
        .logout-modal-icon{width:56px;height:56px;border-radius:50%;background:#fef2f2;color:#dc2626;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
        .logout-modal-title{font-size:1.1rem;font-weight:800;color:#1a1a2e;margin-bottom:8px}
        .logout-modal-desc{font-size:.88rem;color:#64748b;margin-bottom:24px;line-height:1.6}
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

        {/* Brand */}
        <div className="msb-brand">
          <img
            src="/logo.png"
            alt="El Sewedy Electrometer"
            className="msb-brand-logo-full"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>

        {/* Nav */}
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

        {/* Bottom */}
        <div className="msb-bottom">
          <button className="msb-logout" onClick={handleLogout}>
            <span className="msb-logout-icon"><LogOut size={18} /></span>
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
