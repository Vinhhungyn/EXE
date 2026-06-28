'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Hardcode demo — thay bằng API auth sau
    await new Promise(r => setTimeout(r, 800))
    if (username === 'admin' && password === 'blackdiamond2026') {
      router.push('/admin/dashboard')
    } else {
      setError('Sai tài khoản hoặc mật khẩu')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1623; }
        .al-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f1623; font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden; }
        .al-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 20% 30%, rgba(124,158,255,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 80% 70%, rgba(168,213,186,0.06) 0%, transparent 70%); pointer-events: none; }
        .al-card { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(124,158,255,0.2); border-radius: 24px; padding: 40px 36px; width: 100%; max-width: 380px; backdrop-filter: blur(12px); position: relative; z-index: 1; }
        .al-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; justify-content: center; }
        .al-logo-icon { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #7C9EFF, #A8D5BA); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .al-logo-text { font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 700; color: white; }
        .al-logo-sub { font-size: 11px; color: rgba(124,158,255,0.8); font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; }
        .al-title { font-family: 'Nunito', sans-serif; font-size: 22px; font-weight: 700; color: white; text-align: center; margin-bottom: 6px; }
        .al-sub { font-size: 13px; color: rgba(255,255,255,0.4); text-align: center; margin-bottom: 28px; }
        .al-form { display: flex; flex-direction: column; gap: 14px; }
        .al-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 6px; display: block; font-weight: 500; letter-spacing: 0.5px; }
        .al-input { width: 100%; padding: 11px 16px; border-radius: 12px; background: rgba(255,255,255,0.06); border: 0.5px solid rgba(124,158,255,0.2); color: white; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.18s; }
        .al-input:focus { border-color: rgba(124,158,255,0.6); background: rgba(124,158,255,0.08); }
        .al-input::placeholder { color: rgba(255,255,255,0.2); }
        .al-btn { width: 100%; padding: 12px; border-radius: 14px; border: none; background: linear-gradient(135deg, #7C9EFF, #9BB8FF); color: white; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.18s; margin-top: 6px; }
        .al-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .al-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .al-error { background: rgba(255,100,100,0.1); border: 0.5px solid rgba(255,100,100,0.3); color: #ff8080; padding: 10px 14px; border-radius: 10px; font-size: 13px; text-align: center; }
        .al-back { text-align: center; margin-top: 18px; }
        .al-back a { font-size: 12px; color: rgba(124,158,255,0.6); text-decoration: none; transition: color 0.15s; cursor: pointer; }
        .al-back a:hover { color: rgba(124,158,255,1); }
        .al-shield { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; }
        .al-shield span { font-size: 11px; color: rgba(255,255,255,0.2); }
      `}</style>
      <div className="al-root">
        <div className="al-bg" />
        <div className="al-card">
          <div className="al-logo">
            <div className="al-logo-icon">🛡️</div>
            <div>
              <div className="al-logo-text">relax&chill</div>
              <div className="al-logo-sub">Admin Portal</div>
            </div>
          </div>
          <div className="al-title">Đăng nhập quản trị</div>
          <div className="al-sub">Chỉ dành cho Black Diamond Team</div>
          <form className="al-form" onSubmit={handleLogin}>
            <div>
              <label className="al-label">TÀI KHOẢN</label>
              <input className="al-input" type="text" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
            </div>
            <div>
              <label className="al-label">MẬT KHẨU</label>
              <input className="al-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            {error && <div className="al-error">⚠️ {error}</div>}
            <button className="al-btn" type="submit" disabled={loading}>
              {loading ? 'Đang xác thực...' : '🔐 Đăng nhập'}
            </button>
          </form>
          <div className="al-back">
            <a onClick={() => router.push('/')}>← Quay về trang chủ</a>
          </div>
          <div className="al-shield">
            <span>🔒 Secured · Black Diamond Team · EXE101-Group04</span>
          </div>
        </div>
      </div>
    </>
  )
}
