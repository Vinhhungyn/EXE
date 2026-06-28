'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const QUICK_MOODS = [
  { emoji: '😊', label: 'Vui', color: '#A8D5BA' },
  { emoji: '😌', label: 'Ổn', color: '#7C9EFF' },
  { emoji: '😔', label: 'Buồn', color: '#9BB8FF' },
  { emoji: '😰', label: 'Lo', color: '#F4A5C0' },
  { emoji: '😴', label: 'Mệt', color: '#b0b8d8' },
]

export default function MoodCheckInWidget() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const lastCheck = localStorage.getItem('rc_last_checkin')
    const today = new Date().toDateString()
    if (lastCheck !== today) {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSelect = (i: number) => {
    setSelected(i)
    setTimeout(() => {
      const entry = {
        date: new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        emoji: QUICK_MOODS[i].emoji,
        label: QUICK_MOODS[i].label,
        note: '',
        color: QUICK_MOODS[i].color,
      }
      const stored = localStorage.getItem('rc_mood_history')
      const history = stored ? JSON.parse(stored) : []
      localStorage.setItem('rc_mood_history', JSON.stringify([entry, ...history].slice(0, 30)))
      localStorage.setItem('rc_last_checkin', new Date().toDateString())
      setDone(true)
    }, 400)
  }

  if (!show) return null

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @keyframes popIn { from { transform: scale(0.8); opacity:0; } to { transform: scale(1); opacity:1; } }
      `}</style>
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: '100%', maxWidth: '360px', padding: '0 16px', animation: 'slideUp 0.4s ease' }}>
        <div style={{ background: 'white', borderRadius: '20px', border: '0.5px solid rgba(124,158,255,0.25)', boxShadow: '0 8px 40px rgba(124,158,255,0.18)', padding: '20px' }}>
          {!done ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Nunito', fontSize: '15px', fontWeight: 700, color: '#1a2340' }}>Hôm nay bạn thế nào? 🌿</span>
                <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', color: '#8fa0b8', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {QUICK_MOODS.map((m, i) => (
                  <button key={i} onClick={() => handleSelect(i)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px', borderRadius: '14px', border: `2px solid ${selected === i ? m.color : 'transparent'}`, background: selected === i ? `${m.color}22` : 'transparent', cursor: 'pointer', transition: 'all 0.18s' }}>
                    <span style={{ fontSize: '28px' }}>{m.emoji}</span>
                    <span style={{ fontSize: '10px', color: '#8fa0b8', fontWeight: 500 }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', animation: 'popIn 0.3s ease' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{selected !== null ? QUICK_MOODS[selected].emoji : '✅'}</div>
              <p style={{ fontFamily: 'Nunito', fontSize: '15px', fontWeight: 700, color: '#1a2340', marginBottom: '4px' }}>Đã ghi nhận! 💙</p>
              <p style={{ fontSize: '12px', color: '#8fa0b8', marginBottom: '12px' }}>Muốn chia sẻ thêm không?</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { router.push('/mood'); setShow(false) }}
                  style={{ flex: 1, padding: '8px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#7C9EFF,#9BB8FF)', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  📝 Ghi chú thêm
                </button>
                <button onClick={() => setShow(false)}
                  style={{ flex: 1, padding: '8px', borderRadius: '12px', border: '0.5px solid rgba(124,158,255,0.3)', background: 'transparent', color: '#8fa0b8', fontSize: '12px', cursor: 'pointer' }}>
                  Cảm ơn!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
