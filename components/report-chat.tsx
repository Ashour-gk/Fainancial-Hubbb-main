'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle } from 'lucide-react'

interface ChatMessage {
  id: number; sender: string; role: 'admin' | 'employee'; text: string; time: string
}

interface ReportChatProps {
  userName: string; userRole: 'admin' | 'employee'
  canChat: boolean
}

export default function ReportChat({ userName, userRole, canChat }: ReportChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'أحمد يحيى', role: 'employee', text: 'تم رفع التقرير للمراجعة', time: '10:30 ص' },
    { id: 2, sender: 'مستر سويلم', role: 'admin', text: 'يرجى مراجعة بند المصروفات الثالث', time: '11:15 ص' },
  ])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    if (!input.trim() || !canChat) return
    const now = new Date()
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: Date.now(), sender: userName, role: userRole, text: input.trim(), time }])
    setInput('')
  }

  return (
    <>
      <style>{`
        .rc-section{background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 2px 14px rgba(15,27,45,.06);margin-bottom:18px;overflow:hidden}
        .rc-hd{display:flex;align-items:center;gap:10px;padding:18px 24px 14px;border-bottom:1px solid #f1f5f9}
        .rc-hd-ico{width:36px;height:36px;border-radius:10px;background:#fef2f2;color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .rc-hd-title{font-size:1rem;font-weight:700;color:#0f1b2d}
        .rc-hd-sub{font-size:.78rem;color:#94a3b8;margin-top:1px}
        .rc-body{padding:16px 20px;max-height:350px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#fafbfc}
        .rc-msg{display:flex;flex-direction:column;max-width:75%;animation:rcIn .2s ease}
        @keyframes rcIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .rc-msg-emp{align-self:flex-end}
        .rc-msg-adm{align-self:flex-start}
        .rc-bubble{padding:10px 16px;border-radius:14px;font-size:.875rem;line-height:1.6;word-break:break-word}
        .rc-msg-emp .rc-bubble{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border-bottom-right-radius:4px}
        .rc-msg-adm .rc-bubble{background:#fff;color:#334155;border:1px solid #e2e8f0;border-bottom-left-radius:4px}
        .rc-meta{display:flex;align-items:center;gap:6px;margin-top:3px;padding:0 4px}
        .rc-sender{font-size:.72rem;font-weight:700;color:#64748b}
        .rc-time{font-size:.68rem;color:#94a3b8}
        .rc-msg-emp .rc-meta{flex-direction:row-reverse}
        .rc-input-wrap{display:flex;align-items:center;gap:10px;padding:14px 20px;border-top:1px solid #f1f5f9;background:#fff}
        .rc-input{flex:1;padding:10px 16px;border:1.5px solid #e2e8f0;border-radius:12px;font-family:inherit;font-size:.875rem;color:#334155;outline:none;direction:rtl;transition:border-color .15s,box-shadow .15s;background:#f8fafc}
        .rc-input:focus{border-color:#dc2626;box-shadow:0 0 0 3px rgba(220,38,38,.08);background:#fff}
        .rc-input::placeholder{color:#94a3b8}
        .rc-input:disabled{opacity:.5;cursor:not-allowed}
        .rc-send{width:40px;height:40px;border-radius:12px;border:none;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0}
        .rc-send:hover:not(:disabled){background:linear-gradient(135deg,#ef4444,#dc2626);transform:scale(1.05)}
        .rc-send:disabled{opacity:.4;cursor:not-allowed}
        .rc-empty{text-align:center;padding:30px;color:#94a3b8;font-size:.85rem}
        .rc-body::-webkit-scrollbar{width:4px}
        .rc-body::-webkit-scrollbar-track{background:transparent}
        .rc-body::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}
      `}</style>
      <div className="rc-section">
        <div className="rc-hd">
          <div className="rc-hd-ico"><MessageCircle size={18} /></div>
          <div><div className="rc-hd-title">المحادثة والملاحظات</div><div className="rc-hd-sub">التواصل بين الموظف والإدارة</div></div>
        </div>
        <div className="rc-body">
          {messages.length === 0 && <div className="rc-empty">لا توجد رسائل بعد</div>}
          {messages.map(m => (
            <div key={m.id} className={`rc-msg ${m.role === 'employee' ? 'rc-msg-emp' : 'rc-msg-adm'}`}>
              <div className="rc-bubble">{m.text}</div>
              <div className="rc-meta"><span className="rc-sender">{m.sender}</span><span className="rc-time">{m.time}</span></div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="rc-input-wrap">
          <input className="rc-input" placeholder={canChat ? 'اكتب ملاحظة...' : 'لا يمكنك إرسال رسائل في هذه الحالة'} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} disabled={!canChat} />
          <button className="rc-send" onClick={send} disabled={!canChat || !input.trim()}><Send size={16} /></button>
        </div>
      </div>
    </>
  )
}
