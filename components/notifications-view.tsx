'use client'

import { useState } from 'react'
import { Bell, BellRing, Check, CheckCheck, Trash2, AlertTriangle, FileText, Info, Filter } from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'report', title: 'تقرير جديد تم إنشاؤه', desc: 'تم إنشاء تقرير "بيانات تسوية عهدة مبلغ" بنجاح', time: 'منذ 5 دقائق', read: false },
  { id: 2, type: 'alert', title: 'مصروفات تنتظر الموافقة', desc: 'هناك 3 مصروفات جديدة بحاجة إلى مراجعة وموافقة', time: 'منذ 15 دقيقة', read: false },
  { id: 3, type: 'system', title: 'تحديث النظام', desc: 'تم تحديث النظام إلى الإصدار الأخير بنجاح', time: 'منذ ساعة', read: false },
  { id: 4, type: 'report', title: 'تقرير تمت الموافقة عليه', desc: 'تمت الموافقة على تقرير "مشتريات مكتبية متنوعة"', time: 'منذ ساعتين', read: true },
  { id: 5, type: 'alert', title: 'تنبيه: تقرير مرفوض', desc: 'تم رفض تقرير "عهدة نقدية ربع سنوية" - يرجى المراجعة', time: 'منذ 3 ساعات', read: true },
  { id: 6, type: 'system', title: 'نسخة احتياطية', desc: 'تم إنشاء نسخة احتياطية تلقائية للبيانات', time: 'أمس', read: true },
  { id: 7, type: 'report', title: 'تقرير قيد المراجعة', desc: 'تقرير "انتقالات الموظفين" في انتظار المراجعة', time: 'أمس', read: true },
  { id: 8, type: 'system', title: 'صيانة مجدولة', desc: 'سيتم إجراء صيانة للنظام يوم الجمعة القادم', time: 'منذ يومين', read: true },
]

const TYPE_CONFIG = {
  report: { icon: <FileText size={18} />, bg: '#fef2f2', color: '#dc2626' },
  alert: { icon: <AlertTriangle size={18} />, bg: '#fffbeb', color: '#d97706' },
  system: { icon: <Info size={18} />, bg: '#f0f9ff', color: '#0284c7' },
}

export default function NotificationsView() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const markAsRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const deleteNotification = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id))
  const clearAll = () => setNotifications([])

  return (
    <>
      <style>{`
        .ntf-wrap{padding:28px 36px 60px;background:#f5f7fa;min-height:100vh;direction:rtl}
        @media(max-width:768px){.ntf-wrap{padding:20px 14px 60px}}
        .ntf-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:14px}
        .ntf-header-right{display:flex;align-items:center;gap:12px}
        .ntf-header-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#dc2626,#b91c1c);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 14px rgba(220,38,38,0.3)}
        .ntf-header-text h1{font-size:1.6rem;font-weight:800;color:#0f1b2d;margin:0}
        .ntf-header-text p{font-size:.82rem;color:#94a3b8;margin:0}
        .ntf-header-actions{display:flex;gap:8px;flex-wrap:wrap}
        .ntf-action-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s;border:1.5px solid #e2e8f0;background:#fff;color:#64748b}
        .ntf-action-btn:hover{border-color:#cbd5e1;background:#f8fafc;color:#334155}
        .ntf-action-btn.danger{color:#ef4444;border-color:#fecaca}
        .ntf-action-btn.danger:hover{background:#fef2f2;border-color:#f87171}
        .ntf-badge{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;border-radius:10px;background:#dc2626;color:#fff;font-size:.72rem;font-weight:700;padding:0 6px}
        .ntf-filters{display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap}
        .ntf-filter-btn{padding:7px 16px;border-radius:20px;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s;border:1.5px solid #e2e8f0;background:#fff;color:#64748b}
        .ntf-filter-btn:hover{border-color:#cbd5e1;background:#f8fafc}
        .ntf-filter-btn.active{background:#dc2626;color:#fff;border-color:#dc2626}
        .ntf-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 2px 12px rgba(15,27,45,.06);overflow:hidden}
        .ntf-item{display:flex;align-items:flex-start;gap:14px;padding:18px 22px;border-bottom:1px solid #f1f5f9;transition:background .13s;cursor:pointer;position:relative}
        .ntf-item:last-child{border-bottom:none}
        .ntf-item:hover{background:#fafbfd}
        .ntf-item.unread{background:#fef2f2}
        .ntf-item.unread:hover{background:#fee2e2}
        .ntf-unread-dot{width:8px;height:8px;border-radius:50%;background:#dc2626;position:absolute;top:22px;right:10px;animation:dotPulse 2s ease-in-out infinite}
        @keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.4}}
        .ntf-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .ntf-content{flex:1;min-width:0}
        .ntf-title{font-size:.9rem;font-weight:700;color:#0f1b2d;margin-bottom:3px}
        .ntf-desc{font-size:.82rem;color:#64748b;line-height:1.5}
        .ntf-time{font-size:.75rem;color:#94a3b8;margin-top:6px;font-weight:500}
        .ntf-item-actions{display:flex;gap:4px;align-items:center;flex-shrink:0;opacity:0;transition:opacity .15s}
        .ntf-item:hover .ntf-item-actions{opacity:1}
        .ntf-item-btn{width:30px;height:30px;border-radius:8px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .13s}
        .ntf-item-btn.read{color:#16a34a}
        .ntf-item-btn.read:hover{background:#dcfce7}
        .ntf-item-btn.del{color:#ef4444}
        .ntf-item-btn.del:hover{background:#fef2f2}
        .ntf-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#94a3b8;gap:12px}
        .ntf-empty-icon{width:60px;height:60px;border-radius:16px;background:#f1f5f9;display:flex;align-items:center;justify-content:center}
        .ntf-empty p{font-size:.9rem;font-weight:600;margin:0}
        @media(max-width:640px){
          .ntf-item{padding:14px 16px;gap:10px}
          .ntf-icon{width:34px;height:34px}
          .ntf-item-actions{opacity:1}
        }
      `}</style>
      <div className="ntf-wrap">
        <div className="ntf-header">
          <div className="ntf-header-right">
            <div className="ntf-header-icon"><BellRing size={20} /></div>
            <div className="ntf-header-text">
              <h1>الإشعارات {unreadCount > 0 && <span className="ntf-badge">{unreadCount}</span>}</h1>
              <p>إدارة جميع الإشعارات والتنبيهات</p>
            </div>
          </div>
          <div className="ntf-header-actions">
            {unreadCount > 0 && (
              <button className="ntf-action-btn" onClick={markAllAsRead}><CheckCheck size={14} /> تحديد الكل كمقروء</button>
            )}
            <button className="ntf-action-btn danger" onClick={clearAll}><Trash2 size={14} /> مسح الكل</button>
          </div>
        </div>
        <div className="ntf-filters">
          <button className={`ntf-filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>الكل ({notifications.length})</button>
          <button className={`ntf-filter-btn${filter === 'unread' ? ' active' : ''}`} onClick={() => setFilter('unread')}>غير مقروءة ({unreadCount})</button>
          <button className={`ntf-filter-btn${filter === 'read' ? ' active' : ''}`} onClick={() => setFilter('read')}>مقروءة ({notifications.length - unreadCount})</button>
        </div>
        <div className="ntf-card">
          {filtered.length === 0 ? (
            <div className="ntf-empty">
              <div className="ntf-empty-icon"><Bell size={28} color="#94a3b8" /></div>
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            filtered.map(n => {
              const tcfg = TYPE_CONFIG[n.type as keyof typeof TYPE_CONFIG]
              return (
                <div key={n.id} className={`ntf-item${!n.read ? ' unread' : ''}`} onClick={() => markAsRead(n.id)}>
                  {!n.read && <div className="ntf-unread-dot" />}
                  <div className="ntf-icon" style={{ background: tcfg.bg, color: tcfg.color }}>{tcfg.icon}</div>
                  <div className="ntf-content">
                    <div className="ntf-title">{n.title}</div>
                    <div className="ntf-desc">{n.desc}</div>
                    <div className="ntf-time">{n.time}</div>
                  </div>
                  <div className="ntf-item-actions">
                    {!n.read && <button className="ntf-item-btn read" onClick={e => { e.stopPropagation(); markAsRead(n.id) }} title="تحديد كمقروء"><Check size={14} /></button>}
                    <button className="ntf-item-btn del" onClick={e => { e.stopPropagation(); deleteNotification(n.id) }} title="حذف"><Trash2 size={14} /></button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
