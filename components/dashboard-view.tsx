'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface DashboardViewProps { onAddClick: () => void }

const barData = [
  { name: 'يناير', amount: 42000 },
  { name: 'فبراير', amount: 38000 },
  { name: 'مارس', amount: 55000 },
  { name: 'أبريل', amount: 47000 },
  { name: 'مايو', amount: 61000 },
  { name: 'يونيو', amount: 41500 },
]

const pieData = [
  { name: 'مكتمل', value: 45, color: '#0d9488' },
  { name: 'معتمد', value: 30, color: '#16a34a' },
  { name: 'قيد المراجعة', value: 15, color: '#d97706' },
  { name: 'مرفوض', value: 7, color: '#e11d48' },
  { name: 'مسودة', value: 3, color: '#64748b' },
].filter(d => d.value > 0)

const totalReports = pieData.reduce((s, d) => s + d.value, 0)

const RADIAN = Math.PI / 180
function renderCustomLabel({ cx, cy, midAngle, outerRadius, percent, name }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string }) {
  if (percent < 0.02) return null
  const radius = outerRadius + 30
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#334155" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '0.8rem', fontFamily: 'Tajawal, Cairo, sans-serif', fontWeight: 600 }}>
      {name} {(percent * 100).toFixed(0)}%
    </text>
  )
}

function renderCenterLabel({ viewBox }: { viewBox?: { cx: number; cy: number } }) {
  if (!viewBox) return null
  const { cx, cy } = viewBox
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" style={{ fontSize: '1.5rem', fontWeight: 900, fill: '#0f1b2d', fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        {totalReports}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="central" style={{ fontSize: '0.72rem', fontWeight: 600, fill: '#94a3b8', fontFamily: 'Tajawal, Cairo, sans-serif' }}>
        إجمالي التقارير
      </text>
    </g>
  )
}

export default function DashboardView({ onAddClick }: DashboardViewProps) {
  const [pieSize, setPieSize] = useState({ inner: 55, outer: 85 })

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

  return (
    <>
      <style>{`
        .db2-wrap{min-height:100vh;background:#f5f7fa;direction:rtl;padding:24px 28px 40px}
        @media(max-width:768px){.db2-wrap{padding:16px 14px 40px}}
        .db2-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px}
        .db2-header-text h1{font-size:1.5rem;font-weight:800;color:#1a1a2e;margin:0 0 2px}
        @media(max-width:640px){.db2-header-text h1{font-size:1.2rem}}
        .db2-header-text p{font-size:.82rem;color:#94a3b8;margin:0;font-weight:500}
        .db2-refresh-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:#dc2626;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.85rem;font-weight:700;cursor:pointer;transition:background .18s,transform .15s,box-shadow .18s;box-shadow:0 4px 14px rgba(220,38,38,0.3);white-space:nowrap}
        .db2-refresh-btn:hover{background:#b91c1c;transform:translateY(-1px);box-shadow:0 6px 18px rgba(220,38,38,0.4)}
        .db2-summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        @media(max-width:640px){.db2-summary-grid{grid-template-columns:1fr}}
        .db2-summary-card{background:#fff;border:1px solid #e8edf4;border-radius:14px;padding:20px 22px;box-shadow:0 1px 6px rgba(15,27,45,0.06);transition:transform .18s,box-shadow .18s}
        .db2-summary-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(15,27,45,0.1)}
        .db2-summary-title{font-size:.84rem;font-weight:700;color:#64748b;margin-bottom:12px;text-align:right}
        .db2-summary-stats{display:flex;gap:24px;justify-content:flex-start;align-items:center;flex-wrap:wrap;direction:rtl}
        .db2-summary-stat{display:flex;flex-direction:column;align-items:flex-start;gap:3px}
        .db2-summary-stat-primary .db2-summary-value{font-size:1.6rem;font-weight:900;color:#0f1b2d;letter-spacing:-.03em;line-height:1}
        .db2-summary-stat-secondary .db2-summary-value{font-size:1.25rem;font-weight:800;color:#475569;line-height:1}
        @media(max-width:640px){.db2-summary-stat-primary .db2-summary-value{font-size:1.3rem}.db2-summary-stat-secondary .db2-summary-value{font-size:1rem}}
        .db2-summary-sub{font-size:.74rem;color:#94a3b8;font-weight:600;text-align:right}
        .db2-summary-divider{width:1px;background:#e8edf4;align-self:stretch;min-height:36px}
        .db2-charts-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:16px}
        @media(max-width:900px){.db2-charts-grid{grid-template-columns:1fr}}
        .db2-chart-card{background:#fff;border:1px solid #e8edf4;border-radius:14px;padding:20px;box-shadow:0 1px 6px rgba(15,27,45,0.06);overflow:visible}
        @media(max-width:640px){.db2-chart-card{padding:14px 10px}}
        .db2-chart-title{font-size:.88rem;font-weight:800;color:#1a1a2e;margin-bottom:14px;text-align:right}
      `}</style>

      <div className="db2-wrap">
        <div className="db2-header">
          <div className="db2-header-text">
            <h1>تحليل التقارير المالية</h1>
            <p>نظرة عامة على التقارير</p>
          </div>
          <button className="db2-refresh-btn" onClick={onAddClick}>
            <RefreshCw size={15} /> تحديث البيانات
          </button>
        </div>

        {/* Summary Cards */}
        <div className="db2-summary-grid">
          <div className="db2-summary-card">
            <div className="db2-summary-title">ملخص المصروفات</div>
            <div className="db2-summary-stats">
              <div className="db2-summary-stat db2-summary-stat-primary">
                <span className="db2-summary-value">£284,500.00</span>
                <span className="db2-summary-sub">إجمالي المبلغ</span>
              </div>
              <div className="db2-summary-divider" />
              <div className="db2-summary-stat db2-summary-stat-secondary">
                <span className="db2-summary-value">142</span>
                <span className="db2-summary-sub">إجمالي المصروفات</span>
              </div>
            </div>
          </div>
          <div className="db2-summary-card">
            <div className="db2-summary-title">بيانات العهدة</div>
            <div className="db2-summary-stats">
              <div className="db2-summary-stat db2-summary-stat-primary">
                <span className="db2-summary-value">£300,500.00</span>
                <span className="db2-summary-sub">إجمالي المبلغ</span>
              </div>
              <div className="db2-summary-divider" />
              <div className="db2-summary-stat db2-summary-stat-secondary">
                <span className="db2-summary-value">38</span>
                <span className="db2-summary-sub">إجمالي تقارير العهدة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="db2-charts-grid">
          {/* Bar Chart - Changed to brand blue, increased left margin */}
          <div className="db2-chart-card">
            <div className="db2-chart-title">المصروفات الشهرية</div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fill: '#475569', fontFamily: 'Tajawal, Cairo, sans-serif', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8', fontFamily: 'Tajawal, Cairo, sans-serif' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`}
                  width={48}
                  orientation="left"
                  tickMargin={6}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontFamily: 'Tajawal, Cairo, sans-serif', fontSize: '.88rem', direction: 'rtl', boxShadow: '0 4px 16px rgba(0,0,0,.1)', background: '#fff' }}
                  formatter={(value: number) => [`£${value.toLocaleString()}`, 'المبلغ']}
                  labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                  cursor={{ fill: 'rgba(220,38,38,0.06)' }}
                />
                <Bar dataKey="amount" fill="#dc2626" radius={[8, 8, 0, 0]} name="المبلغ (£)" barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Center KPI inside donut, clean legend */}
          <div className="db2-chart-card">
            <div className="db2-chart-title">توزيع حالات التقارير</div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={pieSize.inner}
                  outerRadius={pieSize.outer}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={renderCustomLabel}
                  labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                >
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="none" />))}
                </Pie>
                {/* Center label inside donut */}
                <Legend
                  wrapperStyle={{ fontSize: '.8rem', fontFamily: 'Tajawal, Cairo, sans-serif', direction: 'rtl', paddingTop: 16 }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span style={{ color: '#475569', fontWeight: 600, marginRight: 4, marginLeft: 8 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontFamily: 'Tajawal, Cairo, sans-serif', fontSize: '.88rem', boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}
                  formatter={(value: number) => [`${value}%`, 'النسبة']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  )
}
