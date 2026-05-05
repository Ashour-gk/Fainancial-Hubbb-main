'use client'

import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'

interface LoginViewProps {
  onLogin: (userInfo: { name: string; role: string; initials: string }) => void
  onSwitchToSignup: () => void
}

const ACCOUNTS = [
  { email: 'admin@admin.com', password: 'admin123', name: 'مستر سويلم', role: 'admin', initials: 'سو', roleLabel: 'الإدارة' },
  { email: 'ahmed@admin.com', password: 'ahmed123', name: 'أحمد يحيى', role: 'employee', initials: 'أح', roleLabel: 'الموظف' },
]

export default function LoginView({ onLogin, onSwitchToSignup }: LoginViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('يرجى ملء جميع الحقول'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    const account = ACCOUNTS.find(a => a.email === email.trim().toLowerCase() && a.password === password)
    if (account) {
      onLogin({ name: account.name, role: account.role, initials: account.initials })
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }
  }

  return (
    <>
      <style>{`
        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#ffffff;direction:rtl;padding:20px;position:relative;overflow:hidden}
        .auth-page::before{content:'';position:absolute;top:-200px;right:-200px;width:500px;height:500px;background:radial-gradient(circle,rgba(220,38,38,0.06) 0%,transparent 70%);border-radius:50%;pointer-events:none}
        .auth-page::after{content:'';position:absolute;bottom:-200px;left:-200px;width:500px;height:500px;background:radial-gradient(circle,rgba(220,38,38,0.04) 0%,transparent 70%);border-radius:50%;pointer-events:none}
        .auth-card{width:100%;max-width:440px;background:#ffffff;border:1px solid #f0f0f0;border-radius:24px;padding:40px 36px;box-shadow:0 8px 40px rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.04);animation:authIn .5s cubic-bezier(.34,1.3,.64,1);position:relative;z-index:1}
        @keyframes authIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}
        @media(max-width:500px){.auth-card{padding:28px 20px;border:none;box-shadow:none}}
        .auth-logo-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:28px}
        .auth-logo{width:120px;height:120px;margin-bottom:14px;object-fit:contain;animation:logoPulse 3s ease-in-out infinite}
        @keyframes logoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        .auth-brand-name{font-size:1.6rem;font-weight:900;color:#1a1a1a;letter-spacing:-.02em}
        .auth-brand-sub{font-size:.85rem;color:#999;margin-top:2px;font-weight:500}
        .auth-title{font-size:1.25rem;font-weight:800;color:#1a1a1a;text-align:center;margin-bottom:6px}
        .auth-subtitle{font-size:.85rem;color:#999;text-align:center;margin-bottom:20px;font-weight:400}
        .auth-accounts-hint{background:#f8fafc;border:1px solid #e8edf4;border-radius:12px;padding:14px 16px;margin-bottom:20px;font-size:.78rem;direction:ltr}
        .auth-accounts-hint-title{font-size:.8rem;font-weight:700;color:#334155;margin-bottom:8px;text-align:center;direction:rtl}
        .auth-account-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9}
        .auth-account-row:last-child{border-bottom:none}
        .auth-account-role{font-weight:700;color:#dc2626;font-size:.78rem;direction:rtl}
        .auth-account-creds{font-size:.75rem;color:#64748b;font-family:monospace}
        .auth-field{margin-bottom:18px}
        .auth-label{display:block;font-size:.82rem;font-weight:700;color:#555;margin-bottom:7px}
        .auth-input-wrap{position:relative}
        .auth-input-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#ccc;pointer-events:none;z-index:2}
        .auth-input{width:100%;padding:12px 42px;background:#f9f9f9;border:1.5px solid #e8e8e8;border-radius:12px;color:#1a1a1a;font-family:inherit;font-size:.9rem;outline:none;direction:ltr;text-align:right;transition:border-color .2s,background .2s,box-shadow .2s;box-sizing:border-box}
        .auth-input::placeholder{color:#bbb;direction:rtl}
        .auth-input:focus{border-color:rgba(220,38,38,0.5);background:#fff;box-shadow:0 0 0 3px rgba(220,38,38,0.08)}
        .auth-pass-toggle{position:absolute;left:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#bbb;cursor:pointer;display:flex;align-items:center;transition:color .15s;z-index:2}
        .auth-pass-toggle:hover{color:#666}
        .auth-error{background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.15);border-radius:10px;padding:10px 14px;font-size:.82rem;color:#dc2626;margin-bottom:18px;text-align:center;font-weight:600}
        .auth-submit{width:100%;padding:13px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:.95rem;font-weight:800;cursor:pointer;transition:all .2s;box-shadow:0 4px 20px rgba(220,38,38,0.25);display:flex;align-items:center;justify-content:center;gap:8px;margin-top:8px}
        .auth-submit:hover:not(:disabled){background:linear-gradient(135deg,#ef4444,#dc2626);transform:translateY(-1px);box-shadow:0 6px 24px rgba(220,38,38,0.35)}
        .auth-submit:disabled{opacity:.6;cursor:not-allowed}
        .auth-spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:authSpin .7s linear infinite}
        @keyframes authSpin{to{transform:rotate(360deg)}}
        .auth-switch{text-align:center;margin-top:22px;font-size:.85rem;color:#999}
        .auth-switch-btn{background:none;border:none;color:#dc2626;font-weight:700;cursor:pointer;font-family:inherit;font-size:inherit;transition:color .15s;padding:0;margin-right:4px}
        .auth-switch-btn:hover{color:#ef4444}
        .auth-forgot{text-align:left;margin-bottom:20px}
        .auth-forgot-btn{background:none;border:none;color:#aaa;font-size:.8rem;font-family:inherit;cursor:pointer;transition:color .15s;padding:0}
        .auth-forgot-btn:hover{color:#dc2626}
      `}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo-wrap">
            <img src="/logo.png" alt="Financial Hub" className="auth-logo" />
            <div className="auth-brand-name">Financial Hub</div>
            <div className="auth-brand-sub">نظام التقارير المالية</div>
          </div>
          <div className="auth-title">تسجيل الدخول</div>
          <div className="auth-subtitle">أدخل بياناتك للوصول إلى لوحة التحكم</div>
          <div className="auth-accounts-hint">
            <div className="auth-accounts-hint-title">حسابات تجريبية</div>
            {ACCOUNTS.map(a => (
              <div key={a.email} className="auth-account-row">
                <span className="auth-account-role">{a.roleLabel} ({a.name})</span>
                <span className="auth-account-creds">{a.email} / {a.password}</span>
              </div>
            ))}
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">البريد الإلكتروني</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input className="auth-input" type="email" placeholder="example@financialhub.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label">كلمة المرور</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input className="auth-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><div className="auth-spinner" /> جاري تسجيل الدخول...</> : <><ArrowLeft size={16} /> تسجيل الدخول</>}
            </button>
          </form>
          <div className="auth-switch">ليس لديك حساب؟ <button className="auth-switch-btn" onClick={onSwitchToSignup}>إنشاء حساب جديد</button></div>
        </div>
      </div>
    </>
  )
}
