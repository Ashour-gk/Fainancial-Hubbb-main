'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams } from 'ag-grid-community'
import { themeQuartz, ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])
import '@/lib/ag-grid-setup'
import { Calendar, User, FileText, Paperclip, Trash2, Plus, Calculator, X, Check } from 'lucide-react'

interface ExpenseRecord {
  id: number
  date: string
  amount: string
  description: string
  attachment: string
}

/* ── Cell Renderers ──────────────────────────── */
function RowNumRenderer({ node }: ICellRendererParams) {
  return (
    <span style={{ fontSize: '.8rem', color: '#94a3b8', fontWeight: 600 }}>
      {(node.rowIndex ?? 0) + 1}
    </span>
  )
}

function DateCellRenderer({ data, context }: ICellRendererParams) {
  const parts = data.date ? data.date.split('/') : ['', '', '']
  const isoVal = parts.length === 3
    ? `${parts[2]}-${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}`
    : ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Calendar size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
      <input
        type="date"
        style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '.84rem', color: '#1e293b', background: 'transparent', direction: 'ltr' }}
        value={isoVal}
        onChange={e => {
          const p = e.target.value.split('-')
          context.updateRow(data.id, 'date', p.length === 3 ? `${p[1]}/${p[2]}/${p[0]}` : '')
        }}
      />
    </div>
  )
}

function AmountCellRenderer({ data, context }: ICellRendererParams) {
  return (
    <input
      type="number"
      placeholder="0.00"
      style={{ width: '100%', border: '1px solid transparent', borderRadius: 7, padding: '6px 10px', fontFamily: 'inherit', fontSize: '.875rem', color: '#1e293b', background: 'transparent', outline: 'none', direction: 'ltr', textAlign: 'left' }}
      value={data.amount}
      onChange={e => context.updateRow(data.id, 'amount', e.target.value)}
      onFocus={e => { e.target.style.borderColor = '#93c5fd'; e.target.style.background = '#eff6ff' }}
      onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent' }}
    />
  )
}

function DescCellRenderer({ data, context }: ICellRendererParams) {
  return (
    <input
      type="text"
      placeholder="أدخل البيان..."
      style={{ width: '100%', border: '1px solid transparent', borderRadius: 7, padding: '6px 10px', fontFamily: 'inherit', fontSize: '.875rem', color: '#1e293b', background: 'transparent', outline: 'none', direction: 'rtl' }}
      value={data.description}
      onChange={e => context.updateRow(data.id, 'description', e.target.value)}
      onFocus={e => { e.target.style.borderColor = '#93c5fd'; e.target.style.background = '#eff6ff' }}
      onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent' }}
    />
  )
}

function AttachCellRenderer({ data, context }: ICellRendererParams) {
  if (data.attachment) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Paperclip size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
        <span style={{ fontSize: '.8rem', color: '#475569', fontWeight: 500 }}>{data.attachment}</span>
        <button
          onClick={() => context.updateRow(data.id, 'attachment', '')}
          style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <X size={12} />
        </button>
      </div>
    )
  }
  return (
    <button
      onClick={() => context.addAttachment(data.id)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: '1px dashed #cbd5e1', borderRadius: 6, background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '.78rem', fontFamily: 'inherit', transition: 'all .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}
    >
      <Paperclip size={12} /> إرفاق
    </button>
  )
}

function DeleteRowRenderer({ data, context }: ICellRendererParams) {
  return (
    <button
      onClick={() => context.deleteRow(data.id)}
      title="حذف الصف"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', transition: 'background .15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <Trash2 size={14} />
    </button>
  )
}

/* ── Main Component ───────────────────────────── */
const CATEGORY_LABELS: Record<string, string> = {
  internet: 'إشتراكات نت',
  misc: 'مشتريات متنوعة',
  custody: 'عهدة',
  other: 'أخرى',
}

export default function SettlementView() {
  const gridRef = useRef<AgGridReact>(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('internet')
  const dynamicTitle = `بيانات تسوية ${CATEGORY_LABELS[category] || category}`
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([
    { id: 1, date: '01/20/2024', amount: '300', description: 'شحن نت المدرسة 01252652642', attachment: 'مثال' },
    { id: 2, date: '01/22/2024', amount: '0.0', description: '', attachment: '' },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [msgText, setMsg] = useState('')
  const [attachModal, setAttachModal] = useState<{ rowId: number } | null>(null)
  const [attachInput, setAttachInput] = useState('')

  const flash = (msg: string) => { setMsg(msg); setTimeout(() => setMsg(''), 3000) }

  const addRow = () => {
    setExpenses(prev => [...prev, {
      id: Math.max(...prev.map(e => e.id), 0) + 1,
      date: new Date().toLocaleDateString('en-CA').replace(/-/g, '/').slice(0, 10),
      amount: '0.00', description: '', attachment: '',
    }])
    flash('تمت إضافة صف جديد')
  }

  const deleteRow = useCallback((id: number) => {
    setExpenses(prev => {
      if (prev.length <= 1) { flash('لا يمكن حذف جميع الصفوف'); return prev }
      return prev.filter(e => e.id !== id)
    })
  }, [])

  const updateRow = useCallback((id: number, field: keyof ExpenseRecord, value: string) =>
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e)), [])

  const addAttachment = useCallback((id: number) => {
    setAttachModal({ rowId: id })
    setAttachInput('')
  }, [])

  const confirmAttachment = () => {
    if (attachModal && attachInput.trim()) {
      updateRow(attachModal.rowId, 'attachment', attachInput.trim())
      setAttachModal(null)
      setAttachInput('')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    flash('تم حفظ البيانات بنجاح!')
    setIsSaving(false)
  }

  const handleExport = () => {
    const csv = [
      ['م', 'التاريخ', 'المبلغ', 'البيان', 'المرفقات'].join(','),
      ...expenses.map((e, i) => [i + 1, e.date, e.amount, e.description, e.attachment || ''].join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `expenses_${Date.now()}.csv`, style: 'display:none' })
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    flash('تم تصدير البيانات بنجاح')
  }

  const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)

  const gridContext = useMemo(() => ({ deleteRow, updateRow, addAttachment }), [deleteRow, updateRow, addAttachment])

  const colDefs = useMemo<ColDef<ExpenseRecord>[]>(() => [
    { headerName: 'م', colId: 'rowNum', width: 56, cellRenderer: RowNumRenderer, sortable: false, filter: false, resizable: false, cellStyle: () => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }) },
    { headerName: 'التاريخ', field: 'date', width: 190, cellRenderer: DateCellRenderer, sortable: false, filter: false, cellStyle: () => ({ display: 'flex', alignItems: 'center', padding: '2px 8px' }) },
    { headerName: 'المبلغ', field: 'amount', width: 120, cellRenderer: AmountCellRenderer, sortable: false, filter: false, cellStyle: () => ({ padding: '2px 4px' }) },
    { headerName: 'البيان', field: 'description', flex: 1, cellRenderer: DescCellRenderer, sortable: false, filter: false, cellStyle: () => ({ padding: '2px 4px' }) },
    { headerName: 'المرفقات', field: 'attachment', width: 140, cellRenderer: AttachCellRenderer, sortable: false, filter: false, resizable: false, cellStyle: () => ({ display: 'flex', alignItems: 'center', padding: '4px 8px' }) },
    { headerName: '', colId: 'del', width: 52, cellRenderer: DeleteRowRenderer, sortable: false, filter: false, resizable: false, cellStyle: () => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }) },
  ], [])

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true }), [])

  const isOk  = msgText.includes('نجاح') || msgText.includes('جديد')
  const isErr = msgText.includes('خطأ') || msgText.includes('لا يمكن')

  return (
    <>
      <style>{`
        .sv-wrap { padding:28px 36px 60px; background:#f5f7fa; min-height:100vh; direction:rtl; }
        @media(max-width:640px){ .sv-wrap { padding:16px 14px 48px; } }
        .sv-page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; flex-wrap:wrap; gap:12px; }
        .sv-page-title { font-size:1.7rem; font-weight:800; color:#0f1b2d; letter-spacing:-.025em; }
        @media(max-width:640px){ .sv-page-title { font-size:1.3rem; } }
        .sv-save-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 22px; background:#dc2626; color:#fff; border:none; border-radius:10px; font-family:inherit; font-size:.875rem; font-weight:600; cursor:pointer; box-shadow:0 2px 10px rgba(220,38,38,.28); transition:all .18s ease; }
        .sv-save-btn:hover:not(:disabled) { background:#b91c1c; transform:translateY(-1px); }
        .sv-save-btn:disabled { opacity:.6; cursor:not-allowed; }
        .sv-toast { margin-bottom:18px; padding:10px 16px; border-radius:10px; font-size:.875rem; font-weight:500; animation:svFade .22s ease; }
        .sv-toast-ok  { background:#dcfce7; color:#166534; }
        .sv-toast-err { background:#fee2e2; color:#991b1b; }
        .sv-toast-info{ background:#dbeafe; color:#1e40af; }
        @keyframes svFade { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:none} }
        .sv-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; box-shadow:0 2px 12px rgba(15,27,45,.06); margin-bottom:18px; overflow:hidden; }
        .sv-card-hd { display:flex; align-items:center; justify-content:space-between; padding:18px 22px 14px; border-bottom:1px solid #f1f5f9; flex-wrap:wrap; gap:10px; }
        .sv-card-hd-l { display:flex; align-items:center; gap:10px; }
        .sv-card-ico { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:#fef2f2; color:#dc2626; }
        .sv-card-title { font-size:1rem; font-weight:700; color:#0f1b2d; }
        .sv-card-sub { font-size:.75rem; color:#94a3b8; margin-top:1px; }
        .sv-status-badge { display:inline-flex; align-items:center; padding:5px 14px; border-radius:20px; font-size:.8rem; font-weight:700; background:#f1f5f9; color:#475569; border:1.5px solid #cbd5e1; user-select:none; }
        .sv-body { padding:20px 22px; }
        @media(max-width:640px){ .sv-body { padding:16px; } }
        .sv-desc-input { width:100%; border:none; outline:none; font-family:inherit; font-size:.9rem; color:#334155; background:transparent; resize:none; min-height:36px; direction:rtl; margin-bottom:14px; padding-bottom:10px; border-bottom:1px dashed #e2e8f0; box-sizing:border-box; }
        .sv-desc-input::placeholder { color:#94a3b8; }
        .sv-meta-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #f8fafc; flex-wrap:wrap; }
        .sv-meta-row:last-child { border-bottom:none; }
        .sv-meta-label { display:flex; align-items:center; gap:6px; font-size:.82rem; color:#64748b; font-weight:600; min-width:110px; flex-shrink:0; }
        .sv-meta-label svg { color:#94a3b8; }
        .sv-meta-val { font-size:.875rem; font-weight:600; color:#1e293b; }
        .sv-cat-sel { padding:7px 12px; border:1px solid #e2e8f0; border-radius:9px; background:#f8fafc; font-family:inherit; font-size:.875rem; color:#1e293b; outline:none; transition:border-color .15s; }
        .sv-cat-sel:focus { border-color:#dc2626; box-shadow:0 0 0 3px rgba(220,38,38,.12); }

        /* AG Grid card */
        .sv-grid-card .ag-root-wrapper { border:none !important; }
        .sv-grid-card .ag-header { background:#fafbfd !important; border-bottom:1px solid #f1f5f9 !important; }
        .sv-grid-card .ag-header-cell { background:#fafbfd !important; }
        .sv-grid-card .ag-header-cell-text { font-size:.78rem; font-weight:700; color:#94a3b8; letter-spacing:.02em; }
        .sv-grid-card .ag-row { border-bottom:1px solid #f8fafc !important; }
        .sv-grid-card .ag-row:hover { background:#fafbfd !important; }
        .sv-grid-card .ag-row:last-child { border-bottom:none !important; }
        .sv-grid-card .ag-cell { border:none !important; }

        /* Bottom toolbar */
        .sv-grid-footer { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid #f1f5f9; flex-wrap:wrap; gap:10px; }
        .sv-add-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border:1.5px dashed #dc2626; border-radius:9px; background:transparent; color:#dc2626; cursor:pointer; font-family:inherit; font-size:.84rem; font-weight:600; transition:all .16s; }
        .sv-add-btn:hover { background:#fef2f2; border-style:solid; }
        .sv-export-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border:1.5px solid #16a34a; border-radius:9px; background:transparent; color:#16a34a; cursor:pointer; font-family:inherit; font-size:.84rem; font-weight:600; transition:all .16s; }
        .sv-export-btn:hover { background:#f0fdf4; }

        /* Summary */
        .sv-sum-body { padding:20px 22px; direction:rtl; }
        @media(max-width:640px){ .sv-sum-body { padding:16px; } }
        .sv-sum-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media(max-width:700px){ .sv-sum-cards { grid-template-columns:1fr 1fr; } }
        @media(max-width:400px){ .sv-sum-cards { grid-template-columns:1fr; } }
        .sv-sum-card { background:#f8fafc; border:1px solid #f1f5f9; border-radius:12px; padding:14px 16px; }
        .sv-sum-lbl { font-size:.78rem; color:#94a3b8; font-weight:500; margin-bottom:4px; }
        .sv-sum-val { font-size:1.2rem; font-weight:800; color:#0f1b2d; font-variant-numeric:tabular-nums; }
        .sv-sum-val.blue { color:#dc2626; }
        .sv-form-footer { display:flex; justify-content:flex-end; margin-top:18px; }
      `}</style>

      <div className="sv-wrap">

        {/* Page Header */}
        <div className="sv-page-header">
          <h1 className="sv-page-title">تسوية عهدة مبلغ</h1>
          <button className="sv-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </button>
        </div>

        {/* Toast */}
        {msgText && (
          <div className={`sv-toast ${isErr ? 'sv-toast-err' : isOk ? 'sv-toast-ok' : 'sv-toast-info'}`}>
            {msgText}
          </div>
        )}

        {/* ── Card 1: Report Info ── */}
        <div className="sv-card">
          <div className="sv-card-hd">
            <div className="sv-card-hd-l">
              <div className="sv-card-ico" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <FileText size={18} />
              </div>
              <div>
                <div className="sv-card-title">{dynamicTitle}</div>
              </div>
            </div>
            <span className="sv-status-badge">مسودة</span>
          </div>
          <div className="sv-body">
            <textarea
              className="sv-desc-input"
              rows={1}
              placeholder="أضف وصفاً مختصراً (اختياري)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div className="sv-meta-row">
              <span className="sv-meta-label">التصنيف</span>
              <select className="sv-cat-sel" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="internet">إشتراكات نت</option>
                <option value="misc">مشتريات متنوعة</option>
                <option value="custody">عهدة</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            <div className="sv-meta-row">
              <span className="sv-meta-label"><User size={14} />أنشئ بواسطة</span>
              <span className="sv-meta-val">أحمد يحيى</span>
              <span className="sv-meta-label" style={{ marginRight: 'auto' }}><Calendar size={14} />تاريخ الإنشاء</span>
              <span className="sv-meta-val">١٥ يناير ٢٠٢٤</span>
            </div>
          </div>
        </div>

        {/* ── Card 2: Expenses Grid ── */}
        <div className="sv-card">
          <div className="sv-card-hd">
            <div className="sv-card-hd-l">
              <div className="sv-card-ico" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Calculator size={18} />
              </div>
              <div>
                <div className="sv-card-title">سجل المصروفات</div>
                <div className="sv-card-sub">إضافة أو تعديل أو حذف المصروفات</div>
              </div>
            </div>
          </div>

          <div className="sv-grid-card" style={{ width: '100%', direction: 'rtl' }}>
            <AgGridReact
              ref={gridRef}
              theme={themeQuartz}
              rowData={expenses}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              context={gridContext}
              domLayout="autoHeight"
              enableRtl={true}
              suppressRowClickSelection={true}
              animateRows={true}
              rowHeight={52}
              headerHeight={40}
            />
          </div>

          <div className="sv-grid-footer">
            <button className="sv-add-btn" onClick={addRow}>
              <Plus size={15} /> إضافة صف
            </button>
            <button className="sv-export-btn" onClick={handleExport}>
              <FileText size={15} /> تصدير CSV
            </button>
          </div>
        </div>

        {/* ── Card 3: Summary ── */}
        <div className="sv-card">
          <div className="sv-card-hd">
            <div className="sv-card-hd-l">
              <div className="sv-card-ico" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Calculator size={18} />
              </div>
              <div>
                <div className="sv-card-title">ملخص</div>
                <div className="sv-card-sub">المجاميع المحسوبة تلقائياً</div>
              </div>
            </div>
          </div>
          <div className="sv-sum-body">
            <div className="sv-sum-cards">
              <div className="sv-sum-card">
                <div className="sv-sum-lbl">إجمالي المصروفات</div>
                <div className="sv-sum-val blue">£{totalExpenses.toFixed(2)}</div>
              </div>
              <div className="sv-sum-card">
                <div className="sv-sum-lbl">عدد البنود</div>
                <div className="sv-sum-val">{expenses.length}</div>
              </div>
              <div className="sv-sum-card">
                <div className="sv-sum-lbl">المتبقي</div>
                <div className="sv-sum-val">{(300 - totalExpenses).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Attachment Name Modal */}
      {attachModal && (
        <div style={{ position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(15,23,42,.45)',backdropFilter:'blur(4px)',animation:'svModalIn .2s ease' }}>
          <div style={{ background:'#fff',borderRadius:18,padding:'28px 32px',width:'90%',maxWidth:380,boxShadow:'0 20px 60px rgba(15,27,45,.22)',direction:'rtl',animation:'svModalScale .22s ease' }}>
            <h3 style={{ fontSize:'1.05rem',fontWeight:700,color:'#0f1b2d',marginBottom:16 }}>اسم المرفق</h3>
            <input
              autoFocus
              value={attachInput}
              onChange={e => setAttachInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmAttachment()}
              placeholder="أدخل اسم المرفق..."
              style={{ width:'100%',padding:'10px 14px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:'.9rem',fontFamily:'inherit',color:'#334155',outline:'none',boxSizing:'border-box',transition:'border-color .15s' }}
              onFocus={e => e.target.style.borderColor = '#dc2626'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ display:'flex',gap:10,marginTop:18,justifyContent:'flex-start' }}>
              <button onClick={confirmAttachment} disabled={!attachInput.trim()} style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 20px',background:'#dc2626',color:'#fff',border:'none',borderRadius:10,fontFamily:'inherit',fontSize:'.875rem',fontWeight:600,cursor:'pointer',transition:'all .15s',opacity:attachInput.trim()?1:.5 }}>
                <Check size={15} /> تأكيد
              </button>
              <button onClick={() => { setAttachModal(null); setAttachInput('') }} style={{ padding:'9px 20px',background:'#f1f5f9',color:'#64748b',border:'none',borderRadius:10,fontFamily:'inherit',fontSize:'.875rem',fontWeight:600,cursor:'pointer',transition:'all .15s' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes svModalIn { from{opacity:0} to{opacity:1} }
        @keyframes svModalScale { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </>
  )
}
