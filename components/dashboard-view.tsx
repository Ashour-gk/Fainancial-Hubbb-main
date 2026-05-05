'use client'

import { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardViewProps { onAddClick: () => void; userName?: string }

const ALL_REPORTS = [
  { id: 1, category: 'إشتراكات نت', status: 'approved', amount: 4750, month: 1, year: 2024, type: 'expense' },
  { id: 2, category: 'مشتريات متنوعة', status: 'review', amount: 12500, month: 2, year: 2024, type: 'expense' },
  { id: 3, category: 'عهدة', status: 'rejected', amount: 25000, month: 1, year: 2024, type: 'custody' },
  { id: 4, category: 'انتقالات', status: 'completed', amount: 3200, month: 12, year: 2023, type: 'expense' },
  { id: 5, category: 'مشتريات متنوعة', status: 'draft', amount: 980, month: 2, year: 2024, type: 'expense' },
  { id: 6, category: 'إشتراكات نت', status: 'deleted', amount: 1500, month: 2, year: 2024, type: 'expense' },
  { id: 7, category: 'انتقالات', status: 'approved', amount: 5400, month: 3, year: 2024, type: 'expense' },
  { id: 8, category: 'مشتريات متنوعة', status: 'completed', amount: 18200, month: 3, year: 2024, type: 'expense' },
  { id: 9, category: 'عهدة', status: 'approved', amount: 32000, month: 4, year: 2024, type: 'custody' },
  { id: 10, category: 'إشتراكات نت', status: 'review', amount: 3900, month: 4, year: 2024, type: 'expense' },
  { id: 11, category: 'انتقالات', status: 'completed', amount: 7100, month: 5, year: 2024, type: 'expense' },
  { id: 12, category: 'مشتريات متنوعة', status: 'approved', amount: 9400, month: 5, year: 2024, type: 'expense' },
  { id: 13, category: 'عهدة', status: 'completed', amount: 41000, month: 6, year: 2024, type: 'custody' },
  { id: 14, category: 'إشتراكات نت', status: 'completed', amount: 2800, month: 6, year: 2024, type: 'expense' },
  { id: 15, category: 'مشتريات متنوعة', status: 'rejected', amount: 5500, month: 3, year: 2023, type: 'expense' },
  { id: 16, category: 'انتقالات', status: 'draft', amount: 1800, month: 5, year: 2023, type: 'expense' },
  { id: 17, category: 'عهدة', status: 'review', amount: 28000, month: 8, year: 2023, type: 'custody' },
  { id: 18, category: 'إشتراكات نت', status: 'approved', amount: 3100, month: 9, year: 2023, type: 'expense' },
]

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const CATEGORIES = ['الكل', 'إشتراكات نت', 'مشتريات متنوعة', 'عهدة', 'انتقالات']
const YEARS = ['الكل', '2024', '2023']
const STATUSES = [
  { value: 'all', label: 'الكل' },
  { value: 'approved', label: 'معتمد', color: '#16a34a' },
  { value: 'completed', label: 'مكتمل', color: '#0d9488' },
  { value: 'review', label: 'قيد المراجعة', color: '#d97706' },
  { value: 'rejected', label: 'مرفوض', color: '#e11d48' },
  { value: 'draft', label: 'مسودة', color: '#64748b' },
  { value: 'deleted', label: 'محذوف', color: '#9ca3af' },
]
const STATUS_COLORS: Record<string, string> = {
  approved: '#16a34a', completed: '#0d9488', review: '#d97706',
  rejected: '#e11d48', draft: '#64748b', deleted: '#9ca3af',
}

// Custom legend renderer for pie chart — shows color dot, name, and percentage
function PieLegend({ data, total }: { data: { name: string; value: number; color: string }[]; total: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 4px 0', direction: 'rtl' }}>
      {data.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '.82rem', fontWeight: 600, color: '#334155', fontFamily: 'Tajawal, Cairo, sans-serif' }}>{entry.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '.78rem', color: '#94a3b8', fontWeight: 500, fontFamily: 'Tajawal, Cairo, sans-serif' }}>{entry.value} تقارير</span>
            <span style={{ fontSize: '.8rem', fontWeight: 800, color: entry.color, minWidth: 36, textAlign: 'left', fontFamily: 'Tajawal, Cairo, sans-serif' }}>{total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardView({ onAddClick, userName }: DashboardViewProps) {
  const [pieSize, setPieSize] = useState({ inner: 55, outer: 85 })
  const [selectedYear, setSelectedYear] = useState('الكل')
  const [selectedCategory, setSelectedCategory] = useState('الكل')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 500) setPieSize({ inner: 40, outer: 65 })
      else if (w < 768) setPieSize({ inner: 48, outer: 75 })
      else setPieSize({ inner: 55, outer: 85 })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Build active filters as objects so each can be individually removed
  const activeFilters = useMemo(() => {
    const f: { key: string; label: string }[] = []
    if (selectedYear !== 'الكل') f.push({ key: 'year', label: `السنة: ${selectedYear}` })
    if (selectedCategory !== 'الكل') f.push({ key: 'category', label: `الفئة: ${selectedCategory}` })
    if (selectedStatus !== 'all') f.push({ key: 'status', label: `الحالة: ${STATUSES.find(s => s.value === selectedStatus)?.label}` })
    return f
  }, [selectedYear, selectedCategory, selectedStatus])

  const removeFilter = (key: string) => {
    if (key === 'year') setSelectedYear('الكل')
    if (key === 'category') setSelectedCategory('الكل')
    if (key === 'status') setSelectedStatus('all')
  }

  const filteredReports = useMemo(() => {
    return ALL_REPORTS.filter(r => {
      if (selectedYear !== 'الكل' && r.year !== parseInt(selectedYear)) return false
      if (selectedCategory !== 'الكل' && r.category !== selectedCategory) return false
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false
      return true
    })
  }, [selectedYear, selectedCategory, selectedStatus])

  const totalAmount = filteredReports.reduce((s, r) => s + r.amount, 0)
  const expenseReports = filteredReports.filter(r => r.type === 'expense')
  const custodyReports = filteredReports.filter(r => r.type === 'custody')
  const expenseTotal = expenseReports.reduce((s, r) => s + r.amount, 0)
  const custodyTotal = custodyReports.reduce((s, r) => s + r.amount, 0)

  const barData = useMemo(() => {
    return MONTHS.map((name, i) => {
      const monthReports = filteredReports.filter(r => r.month === i + 1)
      return { name, amount: monthReports.reduce((s, r) => s + r.amount, 0) }
    }).filter(d => d.amount > 0)
  }, [filteredReports])

  const pieData = useMemo(() => {
    const groups: Record<string, number> = {}
    filteredReports.forEach(r => { groups[r.status] = (groups[r.status] || 0) + 1 })
    return Object.entries(groups).map(([status, value]) => ({
      name: STATUSES.find(s => s.value === status)?.label || status,
      value,
      color: STATUS_COLORS[status] || '#94a3b8',
    })).filter(d => d.value > 0)
  }, [filteredReports])

  const resetFilters = () => { setSelectedYear('الكل'); setSelectedCategory('الكل'); setSelectedStatus('all') }

  return (
    <>
      <style>{`
        .db-wrap{min-height:100vh;background:#f5f7fa;direction:rtl;padding:0 0 48px}
        /* Welcome Banner */
        .db-welcome{background:linear-gradient(135deg,#dc2626 0%,#b91c1c 60%,#991b1b 100%);padding:28px 32px;margin-bottom:0;position:relative;overflow:hidden}
        .db-welcome::before{content:'';position:absolute;top:-40px;left:-40px;width:200px;height:200px;background:rgba(255,255,255,0.05);border-radius:50%;pointer-events:none}
        .db-welcome::after{content:'';position:absolute;bottom:-60px;right:10%;width:280px;height:280px;background:rgba(255,255,255,0.04);border-radius:50%;pointer-events:none}
        .db-welcome-title{font-size:1.55rem;font-weight:900;color:#fff;margin:0 0 6px;line-height:1.2}
        @media(max-width:640px){.db-welcome-title{font-size:1.2rem}}
        .db-welcome-sub{font-size:.875rem;color:rgba(255,255,255,0.82);margin:0;font-weight:400}
        /* Content area */
        .db-content{padding:24px 28px 0}
        @media(max-width:768px){.db-content{padding:16px 14px 0}}
        /* Section title */
        .db-section-title{font-size:1.15rem;font-weight:800;color:#1a1a2e;margin:0 0 16px}
        /* Filter Card */
        .db-filter-card{background:#fff;border:1px solid #e8edf4;border-radius:16px;padding:20px 24px;margin-bottom:14px;box-shadow:0 2px 12px rgba(15,27,45,.06)}
        .db-filter-row{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end}
        .db-filter-group{display:flex;flex-direction:column;gap:5px;min-width:140px;flex:1}
        .db-filter-label{font-size:.72rem;font-weight:700;color:#64748b;letter-spacing:.06em;text-transform:uppercase}
        .db-filter-select{padding:9px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:.875rem;color:#334155;background:#fff;outline:none;cursor:pointer;direction:rtl;transition:border-color .15s,box-shadow .15s;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:left 12px center;padding-left:34px}
        .db-filter-select:focus{border-color:#dc2626;box-shadow:0 0 0 3px rgba(220,38,38,.1)}
        .db-filter-actions{display:flex;align-items:flex-end;padding-bottom:1px}
        .db-reset-btn{padding:9px 20px;border-radius:10px;background:#1e293b;color:#fff;font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;border:none;transition:all .15s;white-space:nowrap;box-shadow:0 2px 8px rgba(30,41,59,.2)}
        .db-reset-btn:hover{background:#0f172a;transform:translateY(-1px)}
        /* Active Filters */
        .db-active-filters-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 24px 14px;background:#fff;border-left:1px solid #e8edf4;border-right:1px solid #e8edf4;border-bottom:1px solid #e8edf4;border-radius:0 0 16px 16px;margin-top:-14px;margin-bottom:14px}
        .db-active-filters-label{font-size:.82rem;font-weight:700;color:#334155;white-space:nowrap}
        .db-active-filters-chips{display:flex;gap:7px;flex-wrap:wrap;flex:1}
        .db-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px 4px 8px;background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;border-radius:20px;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .15s;user-select:none}
        .db-chip:hover{background:#ede9fe;border-color:#c4b5fd}
        .db-chip-x{display:flex;align-items:center;opacity:.7;transition:opacity .15s}
        .db-chip:hover .db-chip-x{opacity:1}
        .db-clear-all{font-size:.8rem;font-weight:700;color:#dc2626;cursor:pointer;background:none;border:none;font-family:inherit;white-space:nowrap;padding:0;transition:opacity .15s}
        .db-clear-all:hover{opacity:.75;text-decoration:underline}
        /* Stats cards */
        .db-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
        @media(max-width:900px){.db-stats-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:500px){.db-stats-grid{grid-template-columns:1fr}}
        .db-stat-card{background:#fff;border:1px solid #e8edf4;border-radius:14px;padding:20px 22px;box-shadow:0 1px 6px rgba(15,27,45,.06);transition:transform .18s,box-shadow .18s;text-align:right}
        .db-stat-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(15,27,45,.1)}
        .db-stat-label{font-size:.78rem;font-weight:700;color:#94a3b8;margin-bottom:8px}
        .db-stat-value{font-size:1.65rem;font-weight:900;line-height:1;letter-spacing:-.02em}
        .db-stat-value.red{color:#dc2626}
        .db-stat-value.green{color:#16a34a}
        .db-stat-value.blue{color:#2563eb}
        .db-stat-value.dark{color:#1a1a2e}
        .db-stat-sub{font-size:.72rem;color:#94a3b8;margin-top:5px;font-weight:500}
        /* Results */
        .db-results-note{font-size:.78rem;color:#94a3b8;font-weight:600;margin-bottom:14px;text-align:right}
        .db-results-note span{color:#dc2626;font-weight:800}
        /* Charts */
        .db-charts-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:16px}
        @media(max-width:900px){.db-charts-grid{grid-template-columns:1fr}}
        .db-chart-card{background:#fff;border:1px solid #e8edf4;border-radius:14px;padding:20px;box-shadow:0 1px 6px rgba(15,27,45,.06);overflow:visible}
        @media(max-width:640px){.db-chart-card{padding:14px 10px}}
        .db-chart-title{font-size:.88rem;font-weight:800;color:#1a1a2e;margin-bottom:14px;text-align:right}
        .db-empty-chart{display:flex;flex-direction:column;align-items:center;justify-content:center;height:280px;color:#94a3b8;font-size:.88rem;font-weight:500;gap:10px}
        .db-empty-chart svg{opacity:.3}
      `}</style>

      <div className="db-wrap">
        {/* Welcome Banner */}
        <div className="db-welcome">
          <div className="db-welcome-title">مرحباً، {userName || 'مستخدم'}!</div>
          <div className="db-welcome-sub">هنا نظرة عامة على لوحة التقارير المالية وأداء النظام.</div>
        </div>

        <div className="db-content">
          <div className="db-section-title">لوحة التقارير المالية</div>

          {/* Filter Card — always visible */}
          <div className="db-filter-card">
            <div className="db-filter-row">
              <div className="db-filter-group">
                <label className="db-filter-label">السنة</label>
                <select className="db-filter-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="db-filter-group">
                <label className="db-filter-label">الفئة</label>
                <select className="db-filter-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="db-filter-group">
                <label className="db-filter-label">الحالة</label>
                <select className="db-filter-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="db-filter-actions">
                <button className="db-reset-btn" onClick={resetFilters}>إعادة تعيين الفلاتر</button>
              </div>
            </div>
          </div>

          {/* Active Filters Row */}
          {activeFilters.length > 0 && (
            <div className="db-active-filters-row">
              <span className="db-active-filters-label">الفلاتر النشطة:</span>
              <div className="db-active-filters-chips">
                {activeFilters.map(f => (
                  <span key={f.key} className="db-chip" onClick={() => removeFilter(f.key)}>
                    {f.label}
                    <span className="db-chip-x"><X size={11} /></span>
                  </span>
                ))}
              </div>
              <button className="db-clear-all" onClick={resetFilters}>مسح الكل</button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="db-stats-grid">
            <div className="db-stat-card">
              <div className="db-stat-label">إجمالي التقارير</div>
              <div className="db-stat-value dark">{filteredReports.length}</div>
              <div className="db-stat-sub">تقرير في النظام</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-label">تقارير المصروفات</div>
              <div className="db-stat-value red">{expenseReports.length}</div>
              <div className="db-stat-sub">£{expenseTotal.toLocaleString()}</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-label">تقارير العهدة</div>
              <div className="db-stat-value blue">{custodyReports.length}</div>
              <div className="db-stat-sub">£{custodyTotal.toLocaleString()}</div>
            </div>
            <div className="db-stat-card">
              <div className="db-stat-label">إجمالي المبلغ</div>
              <div className="db-stat-value green" style={{ fontSize: '1.2rem' }}>£{totalAmount.toLocaleString()}</div>
              <div className="db-stat-sub">جميع التقارير المفلترة</div>
            </div>
          </div>

          {/* Results note */}
          <p className="db-results-note">
            إجمالي النتائج: <span>{filteredReports.length}</span> تقرير — إجمالي المبلغ: <span>£{totalAmount.toLocaleString()}</span>
          </p>

          {/* Charts */}
          <div className="db-charts-grid">
            <div className="db-chart-card">
              <div className="db-chart-title">المصروفات الشهرية</div>
              {barData.length === 0 ? (
                <div className="db-empty-chart">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17V13M12 17V9M16 17V11"/></svg>
                  لا توجد بيانات للفلاتر المحددة
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontFamily: 'Tajawal, Cairo, sans-serif', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Tajawal, Cairo, sans-serif' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} width={60} orientation="left" tickMargin={16} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontFamily: 'Tajawal, Cairo, sans-serif', fontSize: '.88rem', direction: 'rtl', boxShadow: '0 4px 16px rgba(0,0,0,.1)', background: '#fff' }} formatter={(value: number) => [`£${value.toLocaleString()}`, 'المبلغ']} labelStyle={{ fontWeight: 700, marginBottom: 4 }} cursor={{ fill: 'rgba(220,38,38,0.06)' }} />
                    <Bar dataKey="amount" fill="#dc2626" radius={[8, 8, 0, 0]} name="المبلغ (£)" barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="db-chart-card">
              <div className="db-chart-title">توزيع حالات التقارير</div>
              {pieData.length === 0 ? (
                <div className="db-empty-chart">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 6.36 15.36"/></svg>
                  لا توجد بيانات للفلاتر المحددة
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={pieSize.inner}
                        outerRadius={pieSize.outer}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={false}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontFamily: 'Tajawal, Cairo, sans-serif', fontSize: '.88rem', boxShadow: '0 4px 16px rgba(0,0,0,.1)', direction: 'rtl' }}
                        formatter={(value: number, name: string) => [`${value} تقارير`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <PieLegend data={pieData} total={pieData.reduce((s, d) => s + d.value, 0)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
