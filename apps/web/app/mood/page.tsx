'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addTrustPoints } from '@/hooks/useTrustBadge'

const MOODS = [
  { emoji: '😊', label: 'Vui vẻ', color: '#A8D5BA', bg: 'rgba(168,213,186,0.15)' },
  { emoji: '😌', label: 'Bình thường', color: '#7C9EFF', bg: 'rgba(124,158,255,0.15)' },
  { emoji: '😔', label: 'Buồn', color: '#9BB8FF', bg: 'rgba(155,184,255,0.15)' },
  { emoji: '😰', label: 'Lo lắng', color: '#F4A5C0', bg: 'rgba(244,165,192,0.15)' },
  { emoji: '😡', label: 'Tức giận', color: '#ffab76', bg: 'rgba(255,171,118,0.15)' },
  { emoji: '😴', label: 'Mệt mỏi', color: '#b0b8d8', bg: 'rgba(176,184,216,0.15)' },
]

type MoodEntry = { date: string; emoji: string; label: string; note: string; color: string }

export default function MoodPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<MoodEntry[]>([])
  const [tab, setTab] = useState<'today' | 'history'>('today')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('rc_mood_history')
    if (stored) setHistory(JSON.parse(stored))
    const dm = localStorage.getItem('rc_dark_mode')
    if (dm === '1') setDark(true)
  }, [])

  const handleSave = () => {
    if (selected === null) return
    const entry: MoodEntry = {
      date: new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      emoji: MOODS[selected].emoji,
      label: MOODS[selected].label,
      note,
      color: MOODS[selected].color,
    }
    const updated = [entry, ...history].slice(0, 30)
    setHistory(updated)
    localStorage.setItem('rc_mood_history', JSON.stringify(updated))
    addTrustPoints('mood_checkin')
    setSaved(true)
  }

  const bg = dark ? '#0f1623' : '#F8F9FF'
  const card = dark ? 'rgba(255,255,255,0.04)' : 'white'
  const border = dark ? 'rgba(124,158,255,0.15)' : 'rgba(124,158,255,0.2)'
  const txt = dark ? 'rgba(255,255,255,0.85)' : '#1a2340'
  const sub = dark ? 'rgba(255,255,255,0.35)' : '#8fa0b8'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
      `}</style>
      <div style={{ minHeight: '100vh', background: bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s', padding: '0 0 48px' }}>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `0.5px solid ${border}`, background: dark ? 'rgba(15,22,35,0.9)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: sub, fontSize: '13px', cursor: 'pointer' }}>← Trang chủ</button>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: '16px', color: txt }}>🌙 Mood Tracker</span>
          <button onClick={() => { const nd = !dark; setDark(nd); localStorage.setItem('rc_dark_mode', nd ? '1' : '0') }}
            style={{ background: dark ? 'rgba(124,158,255,0.15)' : 'rgba(124,158,255,0.1)', border: `0.5px solid ${border}`, borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: dark ? '#9BB8FF' : '#5a7de8', cursor: 'pointer' }}>
            {dark ? '☀️ Sáng' : '🌙 Tối'}
          </button>
        </nav>

        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

          {/* Tab */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(124,158,255,0.06)', borderRadius: '16px', padding: '4px' }}>
            {(['today', 'history'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: '9px', borderRadius: '12px', border: 'none', background: tab === t ? (dark ? 'rgba(124,158,255,0.2)' : 'white') : 'transparent', color: tab === t ? '#7C9EFF' : sub, fontWeight: tab === t ? 600 : 400, fontSize: '13px', cursor: 'pointer', transition: 'all 0.18s' }}>
                {t === 'today' ? '😊 Hôm nay' : '📅 Lịch sử'}
              </button>
            ))}
          </div>

          {/* TODAY TAB */}
          {tab === 'today' && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              {!saved ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontFamily: 'Nunito', fontSize: '22px', fontWeight: 700, color: txt, marginBottom: '6px' }}>Hôm nay bạn thế nào?</h1>
                    <p style={{ fontSize: '13px', color: sub }}>Chọn cảm xúc gần nhất với bạn lúc này</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
                    {MOODS.map((m, i) => (
                      <button key={i} onClick={() => setSelected(i)}
                        style={{ padding: '18px 8px', borderRadius: '18px', border: `2px solid ${selected === i ? m.color : border}`, background: selected === i ? m.bg : card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.18s', transform: selected === i ? 'scale(1.05)' : 'scale(1)' }}>
                        <span style={{ fontSize: '32px' }}>{m.emoji}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: selected === i ? m.color : sub }}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ background: card, border: `0.5px solid ${border}`, borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: sub, marginBottom: '8px' }}>Ghi chú ngắn (tùy chọn)</p>
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Hôm nay mình cảm thấy..." maxLength={200}
                      style={{ width: '100%', minHeight: '80px', background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: txt, resize: 'none', fontFamily: "'DM Sans', sans-serif" }} />
                    <div style={{ fontSize: '11px', color: sub, textAlign: 'right' }}>{note.length}/200</div>
                  </div>
                  <button onClick={handleSave} disabled={selected === null}
                    style={{ width: '100%', padding: '13px', borderRadius: '16px', border: 'none', background: selected !== null ? 'linear-gradient(135deg,#7C9EFF,#9BB8FF)' : (dark ? 'rgba(255,255,255,0.06)' : '#e8eaf2'), color: selected !== null ? 'white' : sub, fontSize: '14px', fontWeight: 600, cursor: selected !== null ? 'pointer' : 'not-allowed', transition: 'all 0.18s' }}>
                    💾 Lưu cảm xúc hôm nay
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', animation: 'popIn 0.4s ease' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>{selected !== null ? MOODS[selected].emoji : '✅'}</div>
                  <h2 style={{ fontFamily: 'Nunito', fontSize: '22px', fontWeight: 700, color: txt, marginBottom: '8px' }}>Đã lưu rồi! 🎉</h2>
                  <p style={{ fontSize: '13px', color: sub, marginBottom: '24px' }}>Cảm ơn bạn đã check-in hôm nay</p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => router.push('/chat')} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg,#7C9EFF,#9BB8FF)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>💬 Tâm sự ngay</button>
                    <button onClick={() => setTab('history')} style={{ padding: '10px 20px', borderRadius: '20px', border: `0.5px solid ${border}`, background: card, color: sub, fontSize: '13px', cursor: 'pointer' }}>📅 Xem lịch sử</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {tab === 'history' && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: sub }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <p style={{ fontSize: '14px' }}>Chưa có lịch sử. Check-in ngay hôm nay!</p>
                  <button onClick={() => setTab('today')} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg,#7C9EFF,#9BB8FF)', color: 'white', fontSize: '13px', cursor: 'pointer' }}>Check-in ngay</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {history.map((h, i) => (
                    <div key={i} style={{ background: card, border: `0.5px solid ${border}`, borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${h.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>{h.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: h.color }}>{h.label}</span>
                          <span style={{ fontSize: '11px', color: sub }}>{h.date}</span>
                        </div>
                        {h.note && <p style={{ fontSize: '12px', color: sub, marginTop: '4px', lineHeight: 1.5 }}>{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
