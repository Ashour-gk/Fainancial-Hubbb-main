'use client'

import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Shield, ShieldCheck } from 'lucide-react'

interface SignupViewProps {
  onSignup: () => void
  onSwitchToLogin: () => void
}

export default function SignupView({ onSignup, onSwitchToLogin }: SignupViewProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) { setError('يرجى ملء جميع الحقول'); return }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    // After signup, navigate to login page (not auto-login)
    onSignup()
  }

  return (
    <>
      <style>{`
        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#ffffff;direction:rtl;padding:20px;position:relative;overflow:hidden}
        .auth-page::before{content:'';position:absolute;top:-200px;right:-200px;width:500px;height:500px;background:radial-gradient(circle,rgba(220,38,38,0.06) 0%,transparent 70%);border-radius:50%;pointer-events:none}
        .auth-page::after{content:'';position:absolute;bottom:-200px;left:-200px;width:500px;height:500px;background:radial-gradient(circle,rgba(220,38,38,0.04) 0%,transparent 70%);border-radius:50%;pointer-events:none}
        .auth-card{width:100%;max-width:480px;background:#ffffff;border:1px solid #f0f0f0;border-radius:24px;padding:36px 32px;box-shadow:0 8px 40px rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.04);animation:authIn .5s cubic-bezier(.34,1.3,.64,1);position:relative;z-index:1}
        @keyframes authIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}
        @media(max-width:500px){.auth-card{padding:24px 18px;border:none;box-shadow:none}}
        .auth-logo-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:22px}
        .auth-logo{width:72px;height:72px;margin-bottom:10px;object-fit:contain;animation:logoPulse 3s ease-in-out infinite}
        @keyframes logoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        .auth-brand-name{font-size:1.4rem;font-weight:900;color:#1a1a1a}
        .auth-brand-sub{font-size:.78rem;color:#999;margin-top:2px;font-weight:500}
        .auth-title{font-size:1.15rem;font-weight:800;color:#1a1a1a;text-align:center;margin-bottom:4px}
        .auth-subtitle{font-size:.82rem;color:#999;text-align:center;margin-bottom:22px;font-weight:400}
        .auth-field{margin-bottom:14px}
        .auth-label{display:block;font-size:.8rem;font-weight:700;color:#555;margin-bottom:6px}
        .auth-input-wrap{position:relative}
        .auth-input-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#ccc;pointer-events:none;z-index:2}
        .auth-input{width:100%;padding:11px 42px;background:#f9f9f9;border:1.5px solid #e8e8e8;border-radius:12px;color:#1a1a1a;font-family:inherit;font-size:.88rem;outline:none;direction:rtl;transition:border-color .2s,background .2s,box-shadow .2s;box-sizing:border-box}
        .auth-input::placeholder{color:#bbb}
        .auth-input:focus{border-color:rgba(220,38,38,0.5);background:#fff;box-shadow:0 0 0 3px rgba(220,38,38,0.08)}
        .auth-pass-toggle{position:absolute;left:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#bbb;cursor:pointer;display:flex;align-items:center;transition:color .15s;z-index:2}
        .auth-pass-toggle:hover{color:#666}
        .auth-error{background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.15);border-radius:10px;padding:10px 14px;font-size:.82rem;color:#dc2626;margin-bottom:14px;text-align:center;font-weight:600}
        .auth-role-label{display:block;font-size:.82rem;font-weight:700;color:#555;margin-bottom:10px}
        .auth-roles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
        .auth-role-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;border:2px solid #eee;border-radius:14px;background:#fafafa;cursor:pointer;transition:all .2s;text-align:center}
        .auth-role-card:hover{border-color:rgba(220,38,38,0.25);background:rgba(220,38,38,0.02)}
        .auth-role-card.selected{border-color:#dc2626;background:rgba(220,38,38,0.04);box-shadow:0 0 20px rgba(220,38,38,0.08)}
        .auth-role-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center}
        .auth-role-name{font-size:.88rem;font-weight:700;color:#1a1a1a}
        .auth-role-desc{font-size:.72rem;color:#999}
        .auth-role-check{position:absolute;top:8px;left:8px;width:20px;height:20px;border-radius:50%;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .auth-role-card.selected .auth-role-check{border-color:#dc2626;background:#dc2626}
        .auth-submit{width:100%;padding:13px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:.95rem;font-weight:800;cursor:pointer;transition:all .2s;box-shadow:0 4px 20px rgba(220,38,38,0.25);display:flex;align-items:center;justify-content:center;gap:8px}
        .auth-submit:hover:not(:disabled){background:linear-gradient(135deg,#ef4444,#dc2626);transform:translateY(-1px);box-shadow:0 6px 24px rgba(220,38,38,0.35)}
        .auth-submit:disabled{opacity:.6;cursor:not-allowed}
        .auth-spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:authSpin .7s linear infinite}
        @keyframes authSpin{to{transform:rotate(360deg)}}
        .auth-switch{text-align:center;margin-top:18px;font-size:.85rem;color:#999}
        .auth-switch-btn{background:none;border:none;color:#dc2626;font-weight:700;cursor:pointer;font-family:inherit;font-size:inherit;transition:color .15s;padding:0;margin-right:4px}
        .auth-switch-btn:hover{color:#ef4444}
      `}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo-wrap">
            <img src="/logo.png" alt="Financial Hub" className="auth-logo" />
            <div className="auth-brand-name">Financial Hub</div>
            <div className="auth-brand-sub">نظام التقارير المالية</div>
          </div>
          <div className="auth-title">إنشاء حساب جديد</div>
          <div className="auth-subtitle">أنشئ حسابك للبدء في إدارة التقارير المالية</div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">الاسم الكامل</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><User size={16} /></span>
                <input className="auth-input" placeholder="أدخل اسمك الكامل" value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label">البريد الإلكتروني</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Mail size={16} /></span>
                <input className="auth-input" type="email" placeholder="example@financialhub.com" value={email} onChange={e => setEmail(e.target.value)} />
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
            <div className="auth-field">
              <label className="auth-label">تأكيد كلمة المرور</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><Lock size={16} /></span>
                <input className="auth-input" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
            </div>
            <label className="auth-role-label">اختر الدور</label>
            <div className="auth-roles">
              <div className={`auth-role-card${role === 'admin' ? ' selected' : ''}`} onClick={() => setRole('admin')}>
                <div className="auth-role-check">{role === 'admin' && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5 L4 7 L8 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                <div className="auth-role-icon" style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}><Shield size={22} /></div>
                <div className="auth-role-name">مدير النظام</div>
                <div className="auth-role-desc">إدارة التقارير والمستخدمين</div>
              </div>
              <div className={`auth-role-card${role === 'superadmin' ? ' selected' : ''}`} onClick={() => setRole('superadmin')}>
                <div className="auth-role-check">{role === 'superadmin' && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5 L4 7 L8 3" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
                <div className="auth-role-icon" style={{ background: 'rgba(234,179,8,0.1)', color: '#d97706' }}><ShieldCheck size={22} /></div>
                <div className="auth-role-name">المسؤول الأعلى</div>
                <div className="auth-role-desc">صلاحيات كاملة للنظام</div>
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><div className="auth-spinner" /> جاري إنشاء الحساب...</> : <><UserPlus size={16} /> إنشاء الحساب</>}
            </button>
          </form>
          <div className="auth-switch">لديك حساب بالفعل؟ <button className="auth-switch-btn" onClick={onSwitchToLogin}>تسجيل الدخول</button></div>
        </div>
      </div>
    </>
  )
}
