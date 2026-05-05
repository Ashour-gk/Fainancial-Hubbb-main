'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ICellRendererParams, RowClickedEvent } from 'ag-grid-community'
import { themeQuartz, ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

const customTheme = themeQuartz.withParams({
  spacing: 4,
  rowVerticalPaddingScale: 0.8,
})

ModuleRegistry.registerModules([AllCommunityModule])
import { FileSpreadsheet, Trash2, FileText, Search } from 'lucide-react'
import ReportDetailView from './report-detail-view'

interface ReportRecord {
  id: number; title: string; lastOperationDate: string; category: string
  totalAmount: string; status: 'approved' | 'review' | 'rejected' | 'completed' | 'draft' | 'deleted'
}

const initialReports: ReportRecord[] = [
  { id: 1, title: 'تقرير إشتراكات الإنترنت', lastOperationDate: '1/15/2024', category: 'إشتراكات نت', totalAmount: '£4,750.00', status: 'approved' },
  { id: 2, title: 'تقرير مشتريات متنوعة يناير', lastOperationDate: '2/1/2024', category: 'مشتريات متنوعة', totalAmount: '£12,500.00', status: 'review' },
  { id: 3, title: 'بيانات تسوية عهدة مبلغ', lastOperationDate: '1/28/2024', category: 'عهدة', totalAmount: '£25,000.00', status: 'rejected' },
  { id: 4, title: 'تقرير انتقالات الموظفين', lastOperationDate: '12/1/2023', category: 'انتقالات', totalAmount: '£3,200.00', status: 'completed' },
  { id: 5, title: 'مسودة مشتريات فبراير', lastOperationDate: '2/5/2024', category: 'مشتريات متنوعة', totalAmount: '£980.00', status: 'draft' },
  { id: 6, title: 'تقرير الاشتراكات المحذوف', lastOperationDate: '2/10/2024', category: 'إشتراكات نت', totalAmount: '£1,500.00', status: 'deleted' },
]

const STATUS_CONFIG = {
  approved: { label: 'معتمد', bg: '#dcfce7', color: '#166534', border: '#86efac' },
  review: { label: 'قيد المراجعة', bg: '#fef9c3', color: '#854d0e', border: '#fcd34d' },
  rejected: { label: 'مرفوض', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  completed: { label: 'مكتمل', bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  draft: { label: 'مسودة', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  deleted: { label: 'محذوف', bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['review', 'deleted'], review: ['approved', 'rejected', 'draft'],
  approved: ['completed'], rejected: ['draft', 'review'], completed: [], deleted: ['draft'],
}

function StatusRenderer({ value, data, context }: ICellRendererParams) {
  const [showMenu, setShowMenu] = useState(false)
  const cfg = STATUS_CONFIG[value as keyof typeof STATUS_CONFIG]
  if (!cfg) return null
  const transitions = STATUS_TRANSITIONS[value as string] || []
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => transitions.length > 0 && setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 10, fontSize: '.77rem', fontWeight: 700, whiteSpace: 'nowrap', background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}`, cursor: transitions.length > 0 ? 'pointer' : 'default' }}>{cfg.label}</span>
      {showMenu && transitions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 100, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(15,27,45,.14)', overflow: 'hidden', minWidth: 130, marginTop: 4 }}>
          {transitions.map(s => {
            const sc = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]
            return (<div key={s} onClick={e => { e.stopPropagation(); context.onStatusChange(data.id, s); setShowMenu(false) }}
              style={{ padding: '8px 14px', fontSize: '.82rem', fontWeight: 600, color: sc.color, cursor: 'pointer', transition: 'background .12s', direction: 'rtl' }}
              onMouseEnter={e => (e.currentTarget.style.background = sc.bg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{sc.label}</div>)
          })}
        </div>
      )}
    </div>
  )
}

function DeleteRenderer({ data, context }: ICellRendererParams) {
  return (
    <button onClick={() => context.onDelete(data.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', transition: 'background .15s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} title="حذف"><Trash2 size={14} /></button>
  )
}


export default function ReportsView() {
  const gridRef = useRef<AgGridReact>(null)
  const [rowData, setRowData] = useState<ReportRecord[]>(initialReports)
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null)
  const [searchText, setSearchText] = useState('')

  const flash = (text: string) => { setMessage(text); setTimeout(() => setMessage(''), 3000) }

  const handleDelete = useCallback((id: number) => { setRowData(prev => prev.filter(r => r.id !== id)); flash('تم حذف التقرير') }, [])
  const handleStatusChange = useCallback((id: number, newStatus: string) => { setRowData(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as ReportRecord['status'] } : r)) }, [])
  
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const rows = rowData.map(r => [r.lastOperationDate, r.category, r.totalAmount, STATUS_CONFIG[r.status].label].join(','))
      const csv = [['تاريخ آخر عملية', 'الفئة', 'إجمالي المبلغ', 'الحالة'].join(','), ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `reports_${Date.now()}.csv`; a.style.display = 'none'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      flash('تم تصدير التقارير بنجاح ✓')
    } catch { flash('حدث خطأ أثناء التصدير') }
    finally { setIsExporting(false) }
  }


  const onSearchChange = (val: string) => { setSearchText(val); gridRef.current?.api?.setGridOption('quickFilterText', val) }

  const colDefs = useMemo<ColDef<ReportRecord>[]>(() => [
    { headerName: '', field: 'id', width: 56, cellRenderer: DeleteRenderer, sortable: false, filter: false, resizable: false, cellStyle: () => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }) },
    { headerName: 'تاريخ آخر عملية', field: 'lastOperationDate', flex: 1, sortable: true, filter: 'agTextColumnFilter', cellStyle: () => ({ color: '#64748b', fontSize: '.875rem', display: 'flex', alignItems: 'center' }) },
    { headerName: 'الفئة', field: 'category', flex: 1, sortable: true, filter: 'agTextColumnFilter', cellStyle: () => ({ fontWeight: '600', fontSize: '.875rem', display: 'flex', alignItems: 'center' }) },
    { headerName: 'إجمالي المبلغ', field: 'totalAmount', flex: 1, sortable: true, cellStyle: () => ({ fontWeight: '700', color: '#0f172a', direction: 'ltr', justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }) },
    { headerName: 'الحالة', field: 'status', flex: 1, sortable: true, filter: 'agTextColumnFilter', cellRenderer: StatusRenderer, cellStyle: () => ({ display: 'flex', alignItems: 'center', overflow: 'visible' }) },
  ], [])

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true, suppressMovable: false }), [])

  const toastCls = message.includes('خطأ') ? 'rv-toast-err' : message.includes('حذف') ? 'rv-toast-del' : 'rv-toast-ok'

  if (selectedReport) {
    return <ReportDetailView report={selectedReport} onBack={() => setSelectedReport(null)} />
  }

  return (
    <>
      <style>{`
        .rv-wrap{padding:32px 36px 48px;background:#f5f7fa;min-height:100vh;direction:rtl}
        @media(max-width:640px){.rv-wrap{padding:16px 14px 40px}}
        .rv-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:18px}
        .rv-title{font-size:1.9rem;font-weight:800;color:#0f1b2d;letter-spacing:-.025em}
        @media(max-width:640px){.rv-title{font-size:1.4rem !important}}
        .rv-btns{display:flex;gap:10px;flex-direction:row-reverse;flex-wrap:wrap}
        .rv-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:10px;font-family:inherit;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .18s ease;white-space:nowrap;border:none;line-height:1}
        .rv-btn:disabled{opacity:.6;cursor:not-allowed}
        .rv-btn-green{background:#fff;color:#16a34a;border:1.5px solid #16a34a}
        .rv-btn-green:not(:disabled):hover{background:#f0fdf4;transform:translateY(-1px)}
        .rv-toast{margin-bottom:16px;padding:10px 16px;border-radius:10px;font-size:.875rem;font-weight:500;animation:rvFade .22s ease}
        .rv-toast-ok{background:#dcfce7;color:#166534}
        .rv-toast-err{background:#fee2e2;color:#991b1b}
        .rv-toast-del{background:#fef9c3;color:#854d0e}
        @keyframes rvFade{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
        .rv-search-wrap{margin-bottom:16px;position:relative;max-width:400px}
        .rv-search-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none}
        .rv-search-input{width:100%;padding:10px 40px 10px 14px;border:1.5px solid #e2e8f0;border-radius:12px;font-family:inherit;font-size:.875rem;color:#334155;background:#fff;outline:none;direction:rtl;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
        .rv-search-input:focus{border-color:#dc2626;box-shadow:0 0 0 3px rgba(220,38,38,0.1)}
        .rv-search-input::placeholder{color:#94a3b8}
        .rv-grid-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 2px 14px rgba(15,27,45,.07);overflow:hidden}
        .rv-grid-card .ag-root-wrapper{border:none !important;border-radius:0}
        .rv-grid-card .ag-header{background:#fff !important;border-bottom:1.5px solid #eef2f8 !important}
        .rv-grid-card .ag-header-cell{background:#fff !important}
        .rv-grid-card .ag-header-cell-text{font-size:.82rem;font-weight:700;color:#94a3b8;letter-spacing:.01em}
        .rv-grid-card .ag-row{cursor:pointer;transition:background .14s}
        .rv-grid-card .ag-row:hover{background:#f8fafd !important}
        .rv-grid-card .ag-row-selected{background:#fef2f2 !important}
        .rv-grid-card .ag-row-selected:hover{background:#fee2e2 !important}
        .rv-grid-card .ag-cell{border:none !important;font-size:.875rem;overflow:visible !important}
        .rv-grid-card .ag-sort-ascending-icon,.rv-grid-card .ag-sort-descending-icon{color:#dc2626}
        .rv-grid-card .ag-paging-panel{border-top:1px solid #f1f5f9;font-size:.82rem;color:#64748b}
        `}</style>

      <div className="rv-wrap">
        <div className="rv-header">
          <h1 className="rv-title">سجل التقارير المالية</h1>
          <div className="rv-btns">
            <button className="rv-btn rv-btn-green" onClick={handleExport} disabled={isExporting}>
              <FileSpreadsheet size={16} /> {isExporting ? 'جاري التصدير…' : 'تصدير بصيغة إكسل'}
            </button>
          </div>
        </div>

        {message && <div className={`rv-toast ${toastCls}`}>{message}</div>}

        <div className="rv-search-wrap">
          <span className="rv-search-icon"><Search size={16} /></span>
          <input className="rv-search-input" placeholder="بحث في التقارير..." value={searchText} onChange={e => onSearchChange(e.target.value)} />
        </div>

        <div className="rv-grid-card">
          <div style={{ height: 450, width: '100%', direction: 'rtl' }}>
            <AgGridReact
              ref={gridRef} theme={customTheme} rowData={rowData} columnDefs={colDefs}
              defaultColDef={defaultColDef} suppressRowClickSelection={true}

              animateRows={true} pagination={true} paginationPageSize={10} enableRtl={true}
              context={{ onDelete: handleDelete, onStatusChange: handleStatusChange }}
              cacheQuickFilter={true}
              onRowClicked={(e: RowClickedEvent<ReportRecord>) => { if (e.data) setSelectedReport(e.data) }}
              noRowsOverlayComponent={() => (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <FileSpreadsheet size={48} style={{ marginBottom: 12, opacity: .35 }} /><p style={{ fontSize: '.9rem' }}>لا توجد تقارير</p>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </>
  )
}
