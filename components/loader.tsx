'use client'

import { useState, useEffect, memo } from 'react'

interface LoaderProps {
  onFinish: () => void
  userName: string
  duration?: number
}

const Loader = memo(function Loader({ onFinish, userName, duration = 3000 }: LoaderProps) {
  const [phase, setPhase] = useState<'breathing' | 'fadeout'>('breathing')

  useEffect(() => {
    const breathTimer = setTimeout(() => setPhase('fadeout'), duration)
    return () => clearTimeout(breathTimer)
  }, [duration])

  useEffect(() => {
    if (phase === 'fadeout') {
      const exitTimer = setTimeout(onFinish, 800)
      return () => clearTimeout(exitTimer)
    }
  }, [phase, onFinish])

  return (
    <div
      className="loader-screen"
      style={{
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <style>{`
        .loader-screen {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          overflow: hidden;
          will-change: opacity;
        }

        /* Soft ambient glows — GPU accelerated */
        .loader-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform, opacity;
        }

        .loader-glow--primary {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(220,38,38,0.07) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: glowPulse 3s ease-in-out infinite;
        }

        .loader-glow--secondary {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(220,38,38,0.03) 0%, transparent 65%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: glowPulse 3s ease-in-out infinite 0.8s;
        }

        @keyframes glowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
        }

        /* Center content */
        .loader-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          animation: contentIn 0.8s ease-out both;
          will-change: transform, opacity;
        }

        @keyframes contentIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Hello text — breathing */
        .loader-hello {
          font-family: 'Tajawal', 'Segoe UI', sans-serif;
          font-size: 3.8rem;
          font-weight: 300;
          color: #1a1a1a;
          letter-spacing: 0.06em;
          animation: helloBreathe 3s ease-in-out infinite;
          will-change: transform, opacity;
          user-select: none;
          text-align: center;
          line-height: 1.3;
        }

        .loader-hello span {
          display: block;
          font-size: 1.6rem;
          font-weight: 500;
          color: #dc2626;
          letter-spacing: 0.02em;
          margin-top: 4px;
        }

        @keyframes helloBreathe {
          0%, 100% {
            opacity: 0.55;
            transform: scale(0.97);
          }
          50% {
            opacity: 1;
            transform: scale(1.03);
          }
        }

        /* Thin accent line */
        .loader-line {
          width: 50px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #dc2626, transparent);
          border-radius: 2px;
          animation: linePulse 3s ease-in-out infinite;
          will-change: width, opacity;
        }

        @keyframes linePulse {
          0%, 100% { width: 35px; opacity: 0.3; }
          50% { width: 70px; opacity: 0.7; }
        }

        /* Windows-style dots */
        .loader-dots {
          display: flex;
          gap: 7px;
        }

        .loader-wdot {
          width: 4px;
          height: 4px;
          background: #e0e0e0;
          border-radius: 50%;
          animation: wdot 1.8s ease-in-out infinite;
          will-change: transform, opacity, background-color;
        }

        .loader-wdot:nth-child(1) { animation-delay: 0s; }
        .loader-wdot:nth-child(2) { animation-delay: 0.15s; }
        .loader-wdot:nth-child(3) { animation-delay: 0.3s; }
        .loader-wdot:nth-child(4) { animation-delay: 0.45s; }
        .loader-wdot:nth-child(5) { animation-delay: 0.6s; }

        @keyframes wdot {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
            background: #d4d4d4;
          }
          30% {
            opacity: 1;
            transform: scale(1.5);
            background: #dc2626;
          }
        }

        /* Subtle ring */
        .loader-ring {
          position: absolute;
          width: 280px;
          height: 280px;
          border: 1px solid rgba(220, 38, 38, 0.06);
          border-radius: 50%;
          animation: ringPulse 3s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .loader-ring--outer {
          width: 340px;
          height: 340px;
          border-color: rgba(220, 38, 38, 0.03);
          animation-delay: 0.5s;
        }

        @keyframes ringPulse {
          0%, 100% { transform: scale(0.96); opacity: 0.3; }
          50% { transform: scale(1.04); opacity: 0.6; }
        }
      `}</style>

      {/* Ambient glow */}
      <div className="loader-glow loader-glow--primary" />
      <div className="loader-glow loader-glow--secondary" />

      {/* Decorative rings */}
      <div className="loader-ring" />
      <div className="loader-ring loader-ring--outer" />

      {/* Center content */}
      <div className="loader-content">
        <div className="loader-hello">
          Hello
          <span>{userName}</span>
        </div>
        <div className="loader-line" />
        <div className="loader-dots">
          <div className="loader-wdot" />
          <div className="loader-wdot" />
          <div className="loader-wdot" />
          <div className="loader-wdot" />
          <div className="loader-wdot" />
        </div>
      </div>
    </div>
  )
})

export default Loader
