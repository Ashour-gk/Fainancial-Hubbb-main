'use client'

import { useState, useCallback } from 'react'
import { ArrowRight, FileText, Tag, User, Plus, Trash2, Paperclip, X, ChevronDown, Save, CheckCircle, Lock } from 'lucide-react'
import ReportChat from './report-chat'

interface ExpenseRow { id: number; date: string; amount: number; description: string; tags: string[]; attachments: string[] }
interface ReportDetailProps {
  report: { id: number; title: string; category: string; status: string; totalAmount: string }
  onBack: () => void
  userRole?: 'admin' | 'employee'
  userName?: string
  onStatusChange?: (newStatus: string) => void
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  completed: { label: 'مكتمل', bg: '#f0fdfa', color: '#0d9488', border: '#99f6e4' },
  approved: { label: 'معتمد', bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
  rejected: { label: 'مرفوض', bg: '#fff1f2', color: '#e11d48', border: '#fda4af' },
  review: { label: 'قيد المراجعة', bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  deleted: { label: 'محذوف', bg: '#f1f5f9', color: '#64748b', border: '#94a3b8' },
  draft: { label: 'مسودّة', bg: '#f8fafc', color: '#475569', border: '#94a3b8' },
}
const CATEGORIES = ['إشتراكات نت', 'مشتريات متنوعة', 'عهدة', 'انتقالات']
let nextId = 10

function getStatusTransitions(role: 'admin' | 'employee', status: string): string[] {
  if (role === 'employee') {
    switch (status) {
      case 'draft': return ['review', 'deleted']
      case 'deleted': return ['draft']
      case 'rejected': return ['review']
      default: return []
    }
  } else {
    switch (status) {
      case 'review': return ['approved', 'rejected', 'draft']
      default: return []
    }
  }
}

function getPermissions(role: 'admin' | 'employee', status: string) {
  const p = { canEditExpenses: false, canAddRows: false, canDeleteRows: false, canAttach: false, canChat: false, canChangeStatus: false, attachOnly: false }
  if (role === 'employee') {
    switch (status) {
      case 'draft': p.canEditExpenses = true; p.canAddRows = true; p.canDeleteRows = true; p.canAttach = true; p.canChangeStatus = true; p.canChat = true; break
      case 'deleted': p.canChangeStatus = true; break
      case 'review': p.canChat = true; break
      case 'rejected': p.canEditExpenses = true; p.canAddRows = true; p.canDeleteRows = true; p.canAttach = true; p.canChangeStatus = true; p.canChat = true; break
      case 'approved': p.canAttach = true; p.attachOnly = true; p.canChat = true; break
      case 'completed': p.canAttach = true; p.attachOnly = true; p.canChat = true; break
    }
  } else {
    switch (status) {
      case 'review': p.canEditExpenses = true; p.canAddRows = true; p.canDeleteRows = true; p.canAttach = true; p.canChangeStatus = true; p.canChat = true; break
      case 'completed': p.canChat = true; break
      case 'rejected': break
      case 'approved': break
    }
  }
  return p
}

export default function ReportDetailView({ report, onBack, userRole = 'employee', userName = 'أحمد يحيى', onStatusChange }: ReportDetailProps) {
  const isNew = report.category === 'غير مصنف'
  const [category, setCategory] = useState(isNew ? '' : report.category)
  const [catOpen, setCatOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [saved, setSaved] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(report.status)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [attachRowId, setAttachRowId] = useState<number | null>(null)
  const [attachName, setAttachName] = useState('')

  const isLocked = !category
  const dynamicTitle = category ? `بيانات تسوية ${category}` : (isNew ? 'تقرير جديد — اختر التصنيف أولاً' : report.title)
  const perm = getPermissions(userRole, currentStatus)
  const transitions = getStatusTransitions(userRole, currentStatus)

  const [rows, setRows] = useState<ExpenseRow[]>(
    isNew
      ? [{ id: 1, date: new Date().toLocaleDateString('en-US'), amount: 0, description: '', tags: [], attachments: [] }]
      : [
          { id: 1, date: '01/20/2024', amount: 300, description: 'شحن نت المدرسة 01252652642', tags: ['مثال'], attachments: ['فاتورة.pdf'] },
          { id: 2, date: '01/22/2024', amount: 0, description: '', tags: [], attachments: [] },
        ]
  )

  const cfg = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.draft
  const total = rows.reduce((s, r) => s + (r.amount || 0), 0)

  const changeStatus = (newSt: string) => {
    setCurrentStatus(newSt); setStatusMenuOpen(false)
    if (onStatusChange) onStatusChange(newSt)
  }

  const addRow = () => { if (perm.canAddRows && !isLocked) setRows(prev => [...prev, { id: nextId++, date: new Date().toLocaleDateString('en-US'), amount: 0, description: '', tags: [], attachments: [] }]) }
  const deleteRow = useCallback((id: number) => setRows(prev => prev.filter(r => r.id !== id)), [])
  const updateRow = useCallback((id: number, field: keyof ExpenseRow, value: string | number) => setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r)), [])

  const handleAttachRequest = (rowId: number) => { setAttachRowId(rowId); setAttachName('') }
  const confirmAttach = () => {
    if (!attachName.trim() || attachRowId === null) return
    setRows(prev => prev.map(r => r.id === attachRowId ? { ...r, attachments: [...r.attachments, attachName.trim()] } : r))
    if (currentStatus === 'approved') { changeStatus('completed') }
    setAttachRowId(null); setAttachName('')
  }
  const cancelAttach = () => { setAttachRowId(null); setAttachName('') }

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  const canEdit = perm.canEditExpenses && !isLocked && !perm.attachOnly

  return (
    <>
      <style>{`
        .rd-wrap{padding:24px 28px 60px;background:#f5f7fa;min-height:100vh;direction:rtl}
        @media(max-width:640px){.rd-wrap{padding:16px 12px 60px}}
        .rd-back{display:inline-flex;align-items:center;gap:8px;color:#64748b;font-size:.875rem;font-weight:600;cursor:pointer;border:none;background:none;padding:6px 10px 6px 0;border-radius:8px;transition:color .15s;margin-bottom:20px;font-family:inherit}
        .rd-back:hover{color:#dc2626}
        .rd-header-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 2px 14px rgba(15,27,45,.06);padding:24px 28px;margin-bottom:18px}
        @media(max-width:640px){.rd-header-card{padding:18px 16px}}
        .rd-header-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px}
        .rd-title-group{display:flex;align-items:center;gap:12px;flex:1;min-width:200px}
        .rd-title-ico{width:40px;height:40px;border-radius:11px;background:#fef2f2;color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .rd-title-display{font-size:1.4rem;font-weight:800;color:#0f1b2d;direction:rtl}
        @media(max-width:640px){.rd-title-display{font-size:1.1rem}}
        .rd-status-wrap{position:relative;display:inline-block}
        .rd-status-badge{display:inline-flex;align-items:center;padding:5px 14px;border-radius:20px;font-size:.8rem;font-weight:700;white-space:nowrap;flex-shrink:0;border:1.5px solid;cursor:pointer;transition:opacity .15s}
        .rd-status-badge:hover{opacity:.85}
        .rd-status-dd{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 8px 24px rgba(15,27,45,.14);z-index:200;overflow:hidden;min-width:140}
        .rd-status-opt{padding:9px 16px;font-size:.84rem;font-weight:600;cursor:pointer;direction:rtl;transition:background .12s}
        .rd-status-opt:hover{opacity:.9}
        .rd-desc-input{width:100%;border:none;outline:none;background:transparent;color:#64748b;font-size:.9rem;font-family:inherit;direction:rtl;margin-bottom:16px}
        .rd-desc-input::placeholder{color:#cbd5e1}
        .rd-desc-input:disabled{opacity:.5;cursor:not-allowed}
        .rd-cat-row{display:flex;align-items:center;gap:8px;padding:12px 0;border-top:1px solid #f1f5f9}
        .rd-cat-label{display:flex;align-items:center;gap:6px;font-size:.82rem;color:#64748b;font-weight:600;flex-shrink:0}
        .rd-cat-sel{position:relative;flex:1;max-width:260px}
        .rd-cat-btn{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 14px;border:1.5px solid #e2e8f0;border-radius:9px;background:#fff;cursor:pointer;font-family:inherit;font-size:.875rem;color:#334155;width:100%;transition:border-color .15s}
        .rd-cat-btn:hover{border-color:#fca5a5}
        .rd-cat-dd{position:absolute;top:calc(100% + 4px);right:0;left:0;background:#fff;border:1px solid #e2e8f0;border-radius:11px;box-shadow:0 8px 24px rgba(15,27,45,.13);z-index:200;overflow:hidden}
        .rd-cat-opt{padding:9px 14px;font-size:.875rem;color:#334155;cursor:pointer;direction:rtl;transition:background .12s}
        .rd-cat-opt:hover{background:#fef2f2;color:#dc2626}
        .rd-cat-opt.active{background:#fee2e2;color:#dc2626;font-weight:600}
        .rd-cat-required{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:#fef2f2;color:#dc2626;border-radius:6px;font-size:.72rem;font-weight:700;margin-right:8px;animation:catPulse 2s ease-in-out infinite}
        @keyframes catPulse{0%,100%{opacity:1}50%{opacity:.6}}
        .rd-meta-row{display:flex;align-items:center;gap:16px;padding:14px 0 0;border-top:1px solid #f1f5f9;flex-wrap:wrap}
        .rd-meta-item{display:flex;align-items:center;gap:7px;font-size:.82rem;color:#64748b}
        .rd-meta-val{font-weight:600;color:#334155}
        .rd-locked-section{position:relative}
        .rd-locked-overlay{position:absolute;inset:0;background:rgba(255,255,255,0.75);backdrop-filter:blur(2px);z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-radius:18px;cursor:not-allowed}
        .rd-locked-icon{width:48px;height:48px;border-radius:50%;background:#fef2f2;color:#dc2626;display:flex;align-items:center;justify-content:center}
        .rd-locked-text{font-size:.9rem;font-weight:700;color:#64748b}
        .rd-locked-hint{font-size:.78rem;color:#94a3b8}
        .rd-section{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 2px 14px rgba(15,27,45,.06);margin-bottom:18px;overflow:hidden}
        .rd-section-hd{display:flex;align-items:center;justify-content:space-between;padding:18px 24px 14px;border-bottom:1px solid #f1f5f9}
        .rd-section-title{font-size:1rem;font-weight:700;color:#0f1b2d}
        .rd-section-sub{font-size:.78rem;color:#94a3b8;margin-top:1px}
        .rd-table-wrap{overflow-x:auto}
        .rd-table{width:100%;border-collapse:collapse;min-width:520px}
        .rd-thead th{padding:10px 14px;font-size:.78rem;font-weight:700;color:#94a3b8;text-align:right;border-bottom:1px solid #f1f5f9;white-space:nowrap;background:#fafafa}
        .rd-tbody tr{border-bottom:1px solid #f8fafc;transition:background .13s}
        .rd-tbody tr:hover{background:#f8fafd}
        .rd-tbody td{padding:10px 14px;vertical-align:middle}
        .rd-row-num{font-size:.82rem;font-weight:700;color:#94a3b8;text-align:center}
        .rd-cell-input{width:100%;border:none;outline:none;background:transparent;font-family:inherit;font-size:.875rem;color:#1e293b;direction:rtl;min-width:80px}
        .rd-cell-input::placeholder{color:#cbd5e1}
        .rd-cell-input:disabled{opacity:.5;cursor:not-allowed}
        .rd-cell-input:focus{background:#fef2f2;border-radius:6px;padding:2px 6px;margin:-2px -6px}
        .rd-amount-input{width:80px;text-align:left;direction:ltr}
        .rd-date-input{width:115px;font-size:.82rem;color:#475569}
        .rd-attach{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;background:#f0fdf4;color:#15803d;border-radius:6px;font-size:.72rem;font-weight:600}
        .rd-attach-add{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;background:#f1f5f9;color:#64748b;border-radius:6px;font-size:.72rem;cursor:pointer;border:1px dashed #cbd5e1;transition:background .13s}
        .rd-attach-add:hover{background:#e2e8f0}
        .rd-del-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;border:none;background:transparent;color:#ef4444;cursor:pointer;transition:background .13s}
        .rd-del-btn:hover{background:#fee2e2}
        .rd-add-row{display:flex;align-items:center;gap:7px;padding:11px 20px;color:#dc2626;font-size:.875rem;font-weight:600;cursor:pointer;border:none;background:none;font-family:inherit;transition:color .15s}
        .rd-add-row:hover{color:#b91c1c}
        .rd-add-row:disabled{opacity:.4;cursor:not-allowed}
        .rd-summary-body{padding:20px 24px}
        .rd-summary-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:.9rem;color:#334155}
        .rd-summary-row:last-child{border-bottom:none;font-size:1rem;font-weight:800;color:#0f1b2d;padding-top:14px}
        .rd-summary-row .label{color:#64748b;font-weight:500}
        .rd-summary-row:last-child .label{color:#0f1b2d;font-weight:800}
        .rd-amount-positive{color:#16a34a;font-weight:700}
        .rd-amount-zero{color:#94a3b8;font-weight:600}
        .rd-save-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 22px;background:#dc2626;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.875rem;font-weight:700;cursor:pointer;transition:all .17s ease;box-shadow:0 2px 8px rgba(220,38,38,.28)}
        .rd-save-btn:hover{background:#b91c1c;transform:translateY(-1px)}
        .rd-save-btn.saved{background:#16a34a;box-shadow:0 2px 8px rgba(22,163,74,.28)}
        .rd-save-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .rd-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:4px}
        .rd-perm-note{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;margin-bottom:18px;font-size:.82rem;color:#854d0e;font-weight:600}
      `}</style>

      <div className="rd-wrap">
        <button className="rd-back" onClick={onBack}><ArrowRight size={16} /> العودة إلى سجل التقارير</button>

        {/* Permission note */}
        {perm.attachOnly && (
          <div className="rd-perm-note">
            <Paperclip size={14} />
            {currentStatus === 'approved' ? 'يمكنك إرفاق الملفات فقط — سيتغير التقرير لـ"مكتمل" تلقائياً عند الإرفاق' : 'يمكنك إرفاق الملفات فقط'}
          </div>
        )}

        <div className="rd-header-card">
          <div className="rd-header-top">
            <div className="rd-title-group">
              <div className="rd-title-ico"><FileText size={20} /></div>
              <div className="rd-title-display">{dynamicTitle}</div>
            </div>
            {/* Status badge with dropdown */}
            <div className="rd-status-wrap" onMouseLeave={() => setStatusMenuOpen(false)}>
              <span className="rd-status-badge"
                style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border, cursor: transitions.length > 0 ? 'pointer' : 'default' }}
                onMouseEnter={() => transitions.length > 0 && setStatusMenuOpen(true)}>
                {cfg.label}
              </span>
              {statusMenuOpen && transitions.length > 0 && (
                <div className="rd-status-dd">
                  {transitions.map(s => {
                    const sc = STATUS_CONFIG[s]
                    return (
                      <div key={s} className="rd-status-opt"
                        style={{ color: sc.color }}
                        onClick={() => changeStatus(s)}
                        onMouseEnter={e => (e.currentTarget.style.background = sc.bg)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        {sc.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <input className="rd-desc-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="أضف وصفاً مختصراً (اختياري)" disabled={isLocked || !canEdit} />
          <div className="rd-cat-row">
            <span className="rd-cat-label">
              <Tag size={14} /> التصنيف
              {isLocked && <span className="rd-cat-required">مطلوب *</span>}
            </span>
            <div className="rd-cat-sel">
              {(isNew || canEdit) ? (
                <>
                  <button className="rd-cat-btn" type="button" onClick={() => setCatOpen(o => !o)} style={isLocked ? { borderColor: '#fca5a5', background: '#fff5f5' } : {}}>
                    <span style={{ color: category ? '#334155' : '#dc2626', fontWeight: isLocked ? 700 : 400 }}>{category || 'اختر تصنيفاً لتفعيل التعديل...'}</span>
                    <ChevronDown size={14} style={{ flexShrink: 0, transition: 'transform .2s', transform: catOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {catOpen && (
                    <div className="rd-cat-dd">
                      {CATEGORIES.map(c => (
                        <div key={c} className={`rd-cat-opt${category === c ? ' active' : ''}`} onClick={() => { setCategory(c); setCatOpen(false) }}>{c}</div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: '.875rem', fontWeight: 600, color: '#334155' }}>{category}</span>
              )}
            </div>
          </div>
          <div className="rd-meta-row">
            <span className="rd-meta-item"><User size={14} color="#94a3b8" /><span>أنشئ بواسطة</span><span className="rd-meta-val">{userName}</span></span>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="rd-locked-section">
          {isLocked && (
            <div className="rd-locked-overlay">
              <div className="rd-locked-icon"><Lock size={22} /></div>
              <div className="rd-locked-text">يرجى اختيار التصنيف أولاً</div>
              <div className="rd-locked-hint">لن تتمكن من التعديل حتى تختار تصنيفاً للتقرير</div>
            </div>
          )}
          <div className="rd-section">
            <div className="rd-section-hd">
              <div>
                <div className="rd-section-title">سجل المصروفات</div>
                <div className="rd-section-sub">
                  {canEdit ? 'إضافة أو تعديل أو حذف المصروفات' : perm.attachOnly ? 'إرفاق الملفات فقط' : 'وضع الاطلاع فقط'}
                </div>
              </div>
            </div>
            <div className="rd-table-wrap">
              <table className="rd-table">
                <thead className="rd-thead"><tr>
                  <th style={{ width: 40, textAlign: 'center' }}>م</th><th style={{ width: 120 }}>التاريخ</th><th style={{ width: 100 }}>المبلغ</th><th>البيان</th><th style={{ width: 160 }}>المرفقات</th><th style={{ width: 40 }}></th>
                </tr></thead>
                <tbody className="rd-tbody">
                  {rows.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="rd-row-num">{idx + 1}</td>
                      <td><input type="date" className="rd-cell-input rd-date-input" disabled={!canEdit} value={row.date ? (() => { const p = row.date.split('/'); return p.length === 3 ? `${p[2]}-${p[0].padStart(2,'0')}-${p[1].padStart(2,'0')}` : '' })() : ''} onChange={e => { const d = new Date(e.target.value); if (!isNaN(d.getTime())) updateRow(row.id, 'date', d.toLocaleDateString('en-US')) }} /></td>
                      <td><input type="number" className="rd-cell-input rd-amount-input" disabled={!canEdit} value={row.amount || ''} placeholder="0.0" onChange={e => updateRow(row.id, 'amount', parseFloat(e.target.value) || 0)} /></td>
                      <td><input className="rd-cell-input" disabled={!canEdit} value={row.description} placeholder="أدخل البيان..." onChange={e => updateRow(row.id, 'description', e.target.value)} /></td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                          {row.attachments.map((a, i) => (<span key={i} className="rd-attach"><Paperclip size={10} /> {a}{canEdit && !perm.attachOnly && <span style={{ cursor: 'pointer', marginRight: 2 }} onClick={() => setRows(prev => prev.map(r => r.id === row.id ? { ...r, attachments: r.attachments.filter((_, j) => j !== i) } : r))}><X size={10} /></span>}</span>))}
                          {(perm.canAttach && !isLocked) && <span className="rd-attach-add" onClick={() => handleAttachRequest(row.id)}><Paperclip size={10} /> إرفاق</span>}
                        </div>
                      </td>
                      <td>{canEdit && perm.canDeleteRows && <button className="rd-del-btn" onClick={() => deleteRow(row.id)} title="حذف الصف"><Trash2 size={14} /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {perm.canAddRows && !isLocked && <button className="rd-add-row" onClick={addRow} disabled={!canEdit}><Plus size={16} /> إضافة صف</button>}
          </div>
        </div>

        {/* Summary */}
        <div className="rd-section">
          <div className="rd-section-hd"><div><div className="rd-section-title">ملخص</div><div className="rd-section-sub">المجاميع المحسوبة تلقائياً</div></div></div>
          <div className="rd-summary-body">
            <div className="rd-summary-row"><span className="label">عدد عمليات الصرف</span><span>{rows.length}</span></div>
            <div className="rd-summary-row"><span className="label">إجمالي المصروفات</span><span className={total > 0 ? 'rd-amount-positive' : 'rd-amount-zero'}>£{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            <div className="rd-summary-row"><span className="label">إجمالي المبلغ</span><span>£{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>

        {/* Chat Section */}
        <ReportChat userName={userName} userRole={userRole} canChat={perm.canChat && !isLocked} />

        {/* Save */}
        <div className="rd-actions">
          <button className={`rd-save-btn${saved ? ' saved' : ''}`} onClick={handleSave} disabled={isLocked || (!canEdit && !perm.canAttach)}>
            {saved ? <><CheckCircle size={15} /> تم الحفظ</> : <><Save size={15} /> حفظ التقرير</>}
          </button>
        </div>

        {/* Custom Attach File Modal */}
        {attachRowId !== null && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',animation:'delFadeIn .2s ease'}} onClick={cancelAttach}>
            <div style={{background:'#fff',borderRadius:20,padding:'32px 28px 24px',width:'90%',maxWidth:360,textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'#f0fdf4',color:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}><Paperclip size={24}/></div>
              <div style={{fontSize:'1.1rem',fontWeight:800,color:'#1a1a2e',marginBottom:8}}>إرفاق ملف</div>
              <div style={{fontSize:'.88rem',color:'#64748b',marginBottom:16}}>اختر ملفاً من جهازك</div>
              <input type="file" onChange={e=>{if(e.target.files && e.target.files.length > 0)setAttachName(e.target.files[0].name)}} autoFocus style={{width:'100%',padding:'10px 14px',border:'1.5px solid #e2e8f0',borderRadius:12,fontSize:'.9rem',fontFamily:'inherit',outline:'none',direction:'rtl',marginBottom:20,boxSizing:'border-box',transition:'border-color .15s',background:'#f9fafb'}} />
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button onClick={confirmAttach} disabled={!attachName.trim()} style={{padding:'10px 24px',borderRadius:12,fontSize:'.9rem',fontWeight:700,cursor:'pointer',border:'none',fontFamily:'inherit',background:'linear-gradient(135deg,#16a34a,#15803d)',color:'#fff',boxShadow:'0 4px 14px rgba(22,163,74,.3)',transition:'all .15s',opacity:attachName.trim()?1:.5}}>إرفاق</button>
                <button onClick={cancelAttach} style={{padding:'10px 24px',borderRadius:12,fontSize:'.9rem',fontWeight:700,cursor:'pointer',border:'1.5px solid #e2e8f0',fontFamily:'inherit',background:'#f1f5f9',color:'#475569',transition:'all .15s'}}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
