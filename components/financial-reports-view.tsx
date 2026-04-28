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
import { Trash2, FileText, FileSpreadsheet, Search, Plus, AlertTriangle } from 'lucide-react'
import ReportDetailView from './report-detail-view'

interface Report {
  id: number; title: string; category: string; status: string
  totalAmount: string; createdBy: string
}

interface FinancialReportsViewProps {
  userRole: 'admin' | 'employee'
  userName: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  completed: { label: 'مكتمل', bg: '#f0fdfa', color: '#0d9488', border: '#99f6e4' },
  approved: { label: 'معتمد', bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
  rejected: { label: 'مرفوض', bg: '#fff1f2', color: '#e11d48', border: '#fda4af' },
  review: { label: 'قيد المراجعة', bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  deleted: { label: 'محذوف', bg: '#f1f5f9', color: '#64748b', border: '#94a3b8' },
  draft: { label: 'مسودّة', bg: '#f8fafc', color: '#475569', border: '#94a3b8' },
}

/*
  Status transition rules based on user role:
  
  Employee can:
  - draft → review, deleted
  - deleted → draft
  - rejected → review
  
  Admin can:
  - review → approved, rejected, draft
  
  Auto transitions:
  - approved → completed (auto when employee attaches a file)
*/
function getStatusTransitions(role: 'admin' | 'employee', currentStatus: string): string[] {
  if (role === 'employee') {
    switch (currentStatus) {
      case 'draft': return ['review', 'deleted']
      case 'deleted': return ['draft']
      case 'rejected': return ['review']
      default: return []
    }
  } else {
    // admin
    switch (currentStatus) {
      case 'review': return ['approved', 'rejected', 'draft']
      default: return []
    }
  }
}

const INITIAL_REPORTS: Report[] = [
  { id: 1, title: 'بيانات تسوية إشتراكات نت', category: 'إشتراكات نت', status: 'approved', totalAmount: '£4,750.00', createdBy: 'أحمد يحيى' },
  { id: 2, title: 'بيانات تسوية مشتريات متنوعة', category: 'مشتريات متنوعة', status: 'review', totalAmount: '£12,500.00', createdBy: 'أحمد يحيى' },
  { id: 3, title: 'بيانات تسوية عهدة', category: 'عهدة', status: 'rejected', totalAmount: '£25,000.00', createdBy: 'أحمد يحيى' },
  { id: 4, title: 'بيانات تسوية انتقالات', category: 'انتقالات', status: 'completed', totalAmount: '£3,200.00', createdBy: 'أحمد يحيى' },
  { id: 5, title: 'بيانات تسوية مشتريات متنوعة', category: 'مشتريات متنوعة', status: 'draft', totalAmount: '£980.00', createdBy: 'أحمد يحيى' },
  { id: 6, title: 'بيانات تسوية إشتراكات نت', category: 'إشتراكات نت', status: 'deleted', totalAmount: '£1,500.00', createdBy: 'أحمد يحيى' },
]

/* Cell Renderers */
function StatusRenderer({ value, data, context }: ICellRendererParams) {
  const [showMenu, setShowMenu] = useState(false)
  const cfg = STATUS_CONFIG[value as string]
  if (!cfg) return null
  const transitions = getStatusTransitions(context.userRole, value as string)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => transitions.length > 0 && setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}>
      <span className="status-chip" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '4px 14px', borderRadius: 20, minWidth: 90,
        fontSize: '.75rem', fontWeight: 700, whiteSpace: 'nowrap',
        background: cfg.bg, color: cfg.color,
        border: `1.5px solid ${cfg.border}`,
        cursor: transitions.length > 0 ? 'pointer' : 'default',
        lineHeight: '1.5', transition: 'all .15s ease',
        boxSizing: 'border-box',
      }} aria-haspopup={transitions.length > 0 ? 'true' : undefined}
         aria-expanded={showMenu ? 'true' : undefined}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
        {cfg.label}
        {transitions.length > 0 && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: -2, opacity: 0.5, transition: 'transform .2s', transform: showMenu ? 'rotate(180deg)' : 'none' }}>
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {showMenu && transitions.length > 0 && (
        <div className="status-dropdown" role="menu" aria-label="تغيير الحالة" style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 9999,
          background: '#fff', border: '1px solid #e8ecf2', borderRadius: 12,
          boxShadow: '0 10px 36px rgba(15,27,45,.16), 0 2px 8px rgba(15,27,45,.06)',
          overflow: 'hidden', minWidth: 150,
          animation: 'statusDropIn .18s ease-out',
        }}>
          <div style={{ padding: '6px 12px 4px', fontSize: '.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.04em', direction: 'rtl' }}>تغيير الحالة</div>
          {transitions.map(s => {
            const sc = STATUS_CONFIG[s]
            return (
              <div key={s} role="menuitem" tabIndex={0}
                onClick={(e) => { e.stopPropagation(); context.onStatusChange(data.id, s); setShowMenu(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); context.onStatusChange(data.id, s); setShowMenu(false) } }}
                style={{
                  padding: '8px 14px', fontSize: '.82rem', fontWeight: 600,
                  color: sc.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background .12s', direction: 'rtl',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = sc.bg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
                {sc.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DeleteRenderer({ data, context }: ICellRendererParams) {
  if (context.userRole !== 'employee') return null
  return (
    <button onClick={(e) => { e.stopPropagation(); context.onDeleteRequest(data.id) }}
      aria-label="حذف التقرير"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 7, border: 'none',
        background: 'transparent', color: '#ef4444', cursor: 'pointer',
        transition: 'background .15s'
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} title="حذف">
      <Trash2 size={13} />
    </button>
  )
}

export default function FinancialReportsView({ userRole, userName }: FinancialReportsViewProps) {
  const gridRef = useRef<AgGridReact>(null)
  const nextReportIdRef = useRef(100)
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchText, setSearchText] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [selectedCount, setSelectedCount] = useState(0)

  // Filter: admin cannot see "deleted" reports
  const visibleReports = useMemo(() => {
    if (userRole === 'admin') return reports.filter(r => r.status !== 'deleted')
    return reports
  }, [reports, userRole])

  const handleDeleteRequest = useCallback((id: number) => {
    setDeleteTarget(id)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deleteTarget !== null) {
      setReports(prev => prev.map(r => r.id === deleteTarget ? { ...r, status: 'deleted' } : r))
      setDeleteTarget(null)
    }
  }, [deleteTarget])

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  const onSelectionChanged = useCallback(() => {
    setSelectedCount(gridRef.current?.api?.getSelectedRows()?.length || 0)
  }, [])

  const handleBulkDelete = useCallback(() => {
    const selected = gridRef.current?.api?.getSelectedRows() as Report[] | undefined
    if (selected && selected.length > 0) {
      const ids = new Set(selected.map(r => r.id))
      setReports(prev => prev.map(r => ids.has(r.id) ? { ...r, status: 'deleted' } : r))
      gridRef.current?.api?.deselectAll()
      setSelectedCount(0)
    }
  }, [])

  const clearSelection = useCallback(() => {
    gridRef.current?.api?.deselectAll()
    setSelectedCount(0)
  }, [])

  const handleStatusChange = useCallback((id: number, newStatus: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }, [])

  const handleExport = () => {
    const selected = gridRef.current?.api?.getSelectedRows() as Report[] | undefined
    const dataToExport = selected && selected.length > 0 ? selected : visibleReports
    const headers = ['م', 'التصنيف', 'إجمالي المبلغ', 'الحالة']
    const rows = dataToExport.map((r, i) => [i + 1, r.category, r.totalAmount, STATUS_CONFIG[r.status]?.label ?? r.status])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `financial_reports_${new Date().toISOString().split('T')[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const handleAddReport = () => {
    const newReport: Report = {
      id: nextReportIdRef.current++,
      title: 'تقرير جديد',
      category: 'غير مصنف',
      status: 'draft',
      totalAmount: '£0.00',
      createdBy: userName,
    }
    setSelectedReport(newReport)
  }

  const onSearchChange = (val: string) => {
    setSearchText(val)
    gridRef.current?.api?.setGridOption('quickFilterText', val)
  }

  const colDefs = useMemo<ColDef<Report>[]>(() => [
    { headerName: 'التصنيف', field: 'category', flex: 1.2, sortable: true, filter: 'agTextColumnFilter', cellStyle: () => ({ fontWeight: '700', fontSize: '.88rem', display: 'flex', alignItems: 'center', color: '#1e293b' }) },
    { headerName: 'إجمالي المبلغ', field: 'totalAmount', flex: 1, sortable: true, cellStyle: () => ({ fontWeight: '700', color: '#0f172a', direction: 'ltr', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', fontSize: '.88rem', fontVariantNumeric: 'tabular-nums' }) },
    { headerName: 'الحالة', field: 'status', flex: 1, sortable: true, filter: 'agTextColumnFilter', cellRenderer: StatusRenderer, cellStyle: () => ({ display: 'flex', alignItems: 'center', overflow: 'visible' }) },
    ...(userRole === 'employee' ? [{ headerName: '', field: 'id' as const, width: 48, cellRenderer: DeleteRenderer, sortable: false, filter: false, resizable: false, cellStyle: () => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }) }] : []),
  ], [userRole])

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true, sortable: true, suppressMovable: false }), [])

  if (selectedReport) {
    return <ReportDetailView
      report={selectedReport}
      onBack={() => setSelectedReport(null)}
      userRole={userRole}
      userName={userName}
      onStatusChange={(newStatus: string) => {
        handleStatusChange(selectedReport.id, newStatus)
        setSelectedReport({ ...selectedReport, status: newStatus })
      }}
    />
  }

  return (
    <>
      <style>{`
        .frh-wrap{padding:28px 32px 60px;background:#f5f7fa;min-height:100vh;direction:rtl}
        @media(max-width:640px){.frh-wrap{padding:18px 14px 60px}}
        .frh-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:18px}
        .frh-title{font-size:1.6rem;font-weight:800;color:#0f1b2d;letter-spacing:-.02em}
        .frh-actions{display:flex;gap:10px;flex-wrap:wrap}
        .frh-btn-add{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:.875rem;font-weight:700;cursor:pointer;transition:all .17s;box-shadow:0 4px 14px rgba(220,38,38,0.28)}
        .frh-btn-add:hover{background:linear-gradient(135deg,#ef4444,#dc2626);transform:translateY(-1px);box-shadow:0 6px 18px rgba(220,38,38,0.38)}
        .frh-btn-add:focus-visible{outline:2px solid #dc2626;outline-offset:2px}
        .frh-btn-export{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:#fff;color:#16a34a;border:1.5px solid #bbf7d0;border-radius:12px;font-family:inherit;font-size:.875rem;font-weight:700;cursor:pointer;transition:all .17s}
        .frh-btn-export:hover{background:#f0fdf4;border-color:#86efac}
        .frh-btn-export:focus-visible{outline:2px solid #16a34a;outline-offset:2px}
        .frh-search-wrap{margin-bottom:16px;position:relative;max-width:400px}
        .frh-search-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none}
        .frh-search-input{width:100%;padding:10px 40px 10px 14px;border:1.5px solid #e2e8f0;border-radius:12px;font-family:inherit;font-size:.875rem;color:#334155;background:#fff;outline:none;direction:rtl;transition:border-color .15s,box-shadow .15s;box-sizing:border-box}
        .frh-search-input:focus{border-color:#dc2626;box-shadow:0 0 0 3px rgba(220,38,38,0.1)}
        .frh-search-input::placeholder{color:#94a3b8}
        .frh-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 2px 14px rgba(15,27,45,.06);overflow:visible;position:relative;z-index:1}
        @keyframes statusDropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
        .frh-card .ag-root-wrapper{border:none !important;border-radius:0;overflow:visible !important}
        .frh-card .ag-header{background:#fff !important;border-bottom:1.5px solid #eef2f8 !important}
        .frh-card .ag-header-cell{background:#fff !important}
        .frh-card .ag-header-cell-text{font-size:.82rem;font-weight:700;color:#94a3b8;letter-spacing:.01em}
        .frh-card .ag-row{border-bottom:1px solid #f1f5f9 !important;cursor:pointer;transition:background .14s;height:48px !important;position:relative}
        .frh-card .ag-row:hover{background:#f8fafd !important;z-index:100}
        .frh-card .ag-row-selected{background:#fef2f2 !important}
        .frh-card .ag-row-selected:hover{background:#fee2e2 !important}
        .frh-card .ag-cell{border:none !important;font-size:.85rem;overflow:visible !important;line-height:48px !important;padding-top:0 !important;padding-bottom:0 !important}
        .frh-card .ag-center-cols-viewport,.frh-card .ag-center-cols-container,.frh-card .ag-body-viewport,.frh-card .ag-root,.frh-card .ag-root-wrapper,.frh-card .ag-body,.frh-card .ag-center-cols-clipper{overflow:visible !important}
        .frh-card .ag-body-viewport{position:relative;z-index:1}
        .frh-card .ag-sort-ascending-icon,.frh-card .ag-sort-descending-icon{color:#dc2626}
        .frh-card .ag-paging-panel{border-top:1px solid #f1f5f9;font-size:.82rem;color:#64748b}
        .frh-card .ag-checkbox-input-wrapper.ag-checked::after{color:#dc2626}
        .frh-card .ag-selection-checkbox{display:flex;align-items:center;justify-content:center}
        .frh-card .ag-header-select-all{display:flex;align-items:center;justify-content:center}
        .frh-card .ag-selection-cell{padding:0 4px !important;min-width:32px;max-width:36px;display:flex;align-items:center;justify-content:center}
        .frh-card .ag-header-cell[col-id='ag-Grid-SelectionColumn']{padding:0 4px !important;min-width:32px;max-width:36px}
        @media(max-width:768px){
          .frh-card .ag-selection-cell{padding:0 2px !important;min-width:28px;max-width:32px}
          .frh-card .ag-header-cell[col-id='ag-Grid-SelectionColumn']{padding:0 2px !important;min-width:28px;max-width:32px}
          .frh-card .ag-cell{font-size:.8rem;padding-left:4px !important;padding-right:4px !important}
        }
        @media(max-width:480px){
          .frh-card .ag-selection-cell{padding:0 1px !important;min-width:24px;max-width:28px}
          .frh-card .ag-header-cell[col-id='ag-Grid-SelectionColumn']{padding:0 1px !important;min-width:24px;max-width:28px}
          .frh-card .ag-cell{font-size:.75rem;padding-left:2px !important;padding-right:2px !important}
        }
        .frh-role-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:8px;font-size:.75rem;font-weight:700;margin-right:12px}
        .del-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:delFadeIn .2s ease}
        @keyframes delFadeIn{from{opacity:0}to{opacity:1}}
        .del-modal{background:#fff;border-radius:20px;padding:32px 28px 24px;width:90%;max-width:360px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:delSlide .25s ease}
        @keyframes delSlide{from{opacity:0;transform:scale(.92) translateY(10px)}to{opacity:1;transform:none}}
        .del-modal-icon{width:56px;height:56px;border-radius:50%;background:#fef2f2;color:#ef4444;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
        .del-modal-title{font-size:1.1rem;font-weight:800;color:#1a1a2e;margin-bottom:8px}
        .del-modal-desc{font-size:.88rem;color:#64748b;margin-bottom:24px}
        .del-modal-btns{display:flex;gap:10px;justify-content:center}
        .del-modal-btn{padding:10px 24px;border-radius:12px;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s;border:none;font-family:inherit}
        .del-modal-btn-confirm{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;box-shadow:0 4px 14px rgba(239,68,68,.3)}
        .del-modal-btn-confirm:hover{background:linear-gradient(135deg,#f87171,#ef4444);transform:translateY(-1px)}
        .del-modal-btn-cancel{background:#f1f5f9;color:#475569;border:1.5px solid #e2e8f0}
        .del-modal-btn-cancel:hover{background:#e2e8f0}
        .frh-sel-bar{display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:10px 16px;background:linear-gradient(135deg,#fef2f2,#fff1f2);border:1.5px solid #fecaca;border-radius:14px;animation:delFadeIn .2s ease;flex-wrap:wrap}
        .frh-sel-count{font-size:.875rem;font-weight:700;color:#dc2626}
        .frh-sel-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;font-family:inherit;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .15s;border:none}
        .frh-sel-btn-export{background:#fff;color:#16a34a;border:1.5px solid #bbf7d0}
        .frh-sel-btn-export:hover{background:#f0fdf4}
        .frh-sel-btn-delete{background:#fff;color:#ef4444;border:1.5px solid #fecaca}
        .frh-sel-btn-delete:hover{background:#fef2f2}
        .frh-sel-btn-clear{background:transparent;color:#64748b;border:1px solid #e2e8f0}
        .frh-sel-btn-clear:hover{background:#f1f5f9}
      `}</style>

      <div className="frh-wrap">
        <div className="frh-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="frh-title">سجل التقارير المالية</h1>
            <span className="frh-role-badge" style={{ background: userRole === 'admin' ? '#fef2f2' : '#f0fdf4', color: userRole === 'admin' ? '#dc2626' : '#16a34a', border: `1px solid ${userRole === 'admin' ? '#fecaca' : '#bbf7d0'}` }}>
              {userRole === 'admin' ? 'الإدارة' : 'الموظف'}
            </span>
          </div>
          <div className="frh-actions">
            {userRole === 'employee' && (
              <button className="frh-btn-add" onClick={handleAddReport}>
                <Plus size={16} /> إضافة تقرير
              </button>
            )}
            <button className="frh-btn-export" onClick={handleExport}>
              <FileSpreadsheet size={16} /> تصدير بصيغة اكسل
            </button>
          </div>
        </div>

        <div className="frh-search-wrap">
          <span className="frh-search-icon"><Search size={16} /></span>
          <input className="frh-search-input" placeholder="بحث في التقارير..." value={searchText} onChange={e => onSearchChange(e.target.value)} aria-label="بحث في التقارير" />
        </div>

        {selectedCount > 0 && (
          <div className="frh-sel-bar">
            <span className="frh-sel-count">{selectedCount} تقرير محدد</span>
            <button className="frh-sel-btn frh-sel-btn-export" onClick={handleExport}>
              <FileSpreadsheet size={14} /> تصدير المحدد
            </button>
            {userRole === 'employee' && (
              <button className="frh-sel-btn frh-sel-btn-delete" onClick={handleBulkDelete}>
                <Trash2 size={14} /> حذف المحدد
              </button>
            )}
            <button className="frh-sel-btn frh-sel-btn-clear" onClick={clearSelection}>
              إلغاء التحديد
            </button>
          </div>
        )}

        <div className="frh-card">
          <div style={{ height: 450, width: '100%', direction: 'rtl' }}>
            <AgGridReact
              ref={gridRef}
              theme={customTheme}
              rowData={visibleReports}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: false }}
              onSelectionChanged={onSelectionChanged}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
              enableRtl={true}
              context={{ onDeleteRequest: handleDeleteRequest, onStatusChange: handleStatusChange, userRole }}
              cacheQuickFilter={true}
              onRowClicked={(e: RowClickedEvent<Report>) => { if (e.data) setSelectedReport(e.data) }}
              noRowsOverlayComponent={() => (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <FileText size={48} style={{ marginBottom: 12, opacity: .35 }} />
                  <p style={{ fontSize: '.9rem' }}>لا توجد تقارير حتى الآن</p>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget !== null && (
        <div className="del-modal-overlay" onClick={cancelDelete}>
          <div className="del-modal" onClick={e => e.stopPropagation()} role="alertdialog" aria-labelledby="del-title" aria-describedby="del-desc">
            <div className="del-modal-icon"><AlertTriangle size={24} /></div>
            <div className="del-modal-title" id="del-title">إخفاء التقرير</div>
            <div className="del-modal-desc" id="del-desc">سيتم إخفاء التقرير عن الإدارة ولكنه سيظل مرئياً لك. يمكنك استعادته لاحقاً.</div>
            <div className="del-modal-btns">
              <button className="del-modal-btn del-modal-btn-confirm" onClick={confirmDelete} autoFocus>نعم، إخفاء</button>
              <button className="del-modal-btn del-modal-btn-cancel" onClick={cancelDelete}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
