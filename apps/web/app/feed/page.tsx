'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const REACTIONS = ['❤️', '🤗', '💪', '😢', '✨']

type Story = {
  id: string
  text: string
  topic: string
  topicEmoji: string
  time: string
  reactions: Record<string, number>
  myReaction: string | null
}

const SAMPLE: Story[] = [
  { id: '1', text: 'Hôm nay thi rớt môn mà không dám nói với ba mẹ. Ngồi quán cà phê một mình mà muốn khóc quá.', topic: 'Học tập', topicEmoji: '📚', time: '3 phút trước', reactions: { '❤️': 12, '🤗': 8, '💪': 5, '😢': 14, '✨': 2 }, myReaction: null },
  { id: '2', text: 'Lần đầu tiên trong 6 tháng mình ngủ được 8 tiếng. Cảm giác sáng dậy không thấy lo lắng gì cả. Nhỏ thôi nhưng vui lắm.', topic: 'Sức khỏe', topicEmoji: '🌿', time: '12 phút trước', reactions: { '❤️': 34, '🤗': 21, '💪': 18, '😢': 1, '✨': 29 }, myReaction: null },
  { id: '3', text: 'Crush nhìn mình thêm 3 giây hôm nay. Tôi đang ổn.', topic: 'Tình yêu', topicEmoji: '💕', time: '28 phút trước', reactions: { '❤️': 67, '🤗': 12, '💪': 3, '😢': 2, '✨': 44 }, myReaction: null },
  { id: '4', text: 'Áp lực deadline dự án, sếp liên tục nhắn tin ngoài giờ. Không biết phải làm gì nữa. Ai đã từng như mình không?', topic: 'Công việc', topicEmoji: '💼', time: '45 phút trước', reactions: { '❤️': 23, '🤗': 31, '💪': 28, '😢': 19, '✨': 5 }, myReaction: null },
  { id: '5', text: 'Mình vừa nói chuyện được với mẹ sau 2 tháng cold war. Không giải quyết được gì nhưng ít nhất nói chuyện được rồi.', topic: 'Gia đình', topicEmoji: '🏠', time: '1 giờ trước', reactions: { '❤️': 45, '🤗': 38, '💪': 22, '😢': 8, '✨': 15 }, myReaction: null },
]

const TOPICS = ['Tất cả', '💕 Tình yêu', '📚 Học tập', '🏠 Gia đình', '💼 Công việc', '🌿 Sức khỏe', '💭 Khác']

export default function FeedPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>(SAMPLE)
  const [filter, setFilter] = useState('Tất cả')
  const [showWrite, setShowWrite] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTopic, setNewTopic] = useState('💭 Khác')
  const [posting, setPosting] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const dm = localStorage.getItem('rc_dark_mode')
    if (dm === '1') setDark(true)
  }, [])

  const handleReact = (storyId: string, reaction: string) => {
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s
      const already = s.myReaction
      const newReactions = { ...s.reactions }
      if (already) newReactions[already] = Math.max(0, (newReactions[already] || 1) - 1)
      if (already === reaction) return { ...s, reactions: newReactions, myReaction: null }
      newReactions[reaction] = (newReactions[reaction] || 0) + 1
      return { ...s, reactions: newReactions, myReaction: reaction }
    }))
  }

  const handlePost = async () => {
    if (!newText.trim()) return
    setPosting(true)
    await new Promise(r => setTimeout(r, 600))
    const story: Story = {
      id: Date.now().toString(),
      text: newText.trim(),
      topic: newTopic.replace(/^[^ ]+ /, ''),
      topicEmoji: newTopic.split(' ')[0],
      time: 'Vừa xong',
      reactions: { '❤️': 0, '🤗': 0, '💪': 0, '😢': 0, '✨': 0 },
      myReaction: null,
    }
    setStories(prev => [story, ...prev])
    setNewText('')
    setShowWrite(false)
    setPosting(false)
  }

  const filtered = filter === 'Tất cả' ? stories : stories.filter(s => filter.includes(s.topic))

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
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { from { transform:scale(0.9); opacity:0; } to { transform:scale(1); opacity:1; } }
        .react-btn:hover { transform: scale(1.15) !important; }
        .story-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 28px rgba(0,0,0,0.1) !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `0.5px solid ${border}`, background: dark ? 'rgba(15,22,35,0.9)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: sub, fontSize: '13px', cursor: 'pointer' }}>← Trang chủ</button>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: '16px', color: txt }}>🌊 Story Feed</span>
          <button onClick={() => { const nd = !dark; setDark(nd); localStorage.setItem('rc_dark_mode', nd ? '1' : '0') }}
            style={{ background: dark ? 'rgba(124,158,255,0.15)' : 'rgba(124,158,255,0.1)', border: `0.5px solid ${border}`, borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: dark ? '#9BB8FF' : '#5a7de8', cursor: 'pointer' }}>
            {dark ? '☀️' : '🌙'}
          </button>
        </nav>

        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '20px 16px 60px' }}>

          {/* Write button */}
          {!showWrite ? (
            <button onClick={() => setShowWrite(true)}
              style={{ width: '100%', padding: '14px 20px', borderRadius: '18px', border: `1.5px dashed ${border}`, background: card, color: sub, fontSize: '13px', cursor: 'pointer', textAlign: 'left', marginBottom: '16px', transition: 'all 0.18s' }}>
              ✏️ Chia sẻ điều gì đó ẩn danh...
            </button>
          ) : (
            <div style={{ background: card, border: `0.5px solid rgba(124,158,255,0.3)`, borderRadius: '18px', padding: '18px', marginBottom: '16px', animation: 'popIn 0.3s ease' }}>
              <textarea value={newText} onChange={e => setNewText(e.target.value)}
                placeholder="Chia sẻ điều bạn muốn nói... (ẩn danh hoàn toàn)" maxLength={300} autoFocus
                style={{ width: '100%', minHeight: '100px', background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: txt, resize: 'none', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '10px 0' }}>
                {TOPICS.filter(t => t !== 'Tất cả').map(t => (
                  <button key={t} onClick={() => setNewTopic(t)}
                    style={{ padding: '4px 10px', borderRadius: '20px', border: `1px solid ${newTopic === t ? '#7C9EFF' : border}`, background: newTopic === t ? 'rgba(124,158,255,0.15)' : 'transparent', color: newTopic === t ? '#7C9EFF' : sub, fontSize: '11px', cursor: 'pointer' }}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: sub }}>{newText.length}/300</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setShowWrite(false); setNewText('') }} style={{ padding: '8px 16px', borderRadius: '12px', border: `0.5px solid ${border}`, background: 'transparent', color: sub, fontSize: '12px', cursor: 'pointer' }}>Huỷ</button>
                  <button onClick={handlePost} disabled={!newText.trim() || posting}
                    style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', background: newText.trim() ? 'linear-gradient(135deg,#7C9EFF,#9BB8FF)' : 'rgba(124,158,255,0.2)', color: newText.trim() ? 'white' : sub, fontSize: '12px', fontWeight: 600, cursor: newText.trim() ? 'pointer' : 'not-allowed' }}>
                    {posting ? '...' : '📤 Đăng'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filter */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px', scrollbarWidth: 'none' }}>
            {TOPICS.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                style={{ padding: '6px 14px', borderRadius: '20px', border: `0.5px solid ${filter === t ? '#7C9EFF' : border}`, background: filter === t ? 'rgba(124,158,255,0.15)' : card, color: filter === t ? '#7C9EFF' : sub, fontSize: '12px', fontWeight: filter === t ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Stories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((s, i) => (
              <div key={s.id} className="story-card"
                style={{ background: card, border: `0.5px solid ${border}`, borderRadius: '18px', padding: '18px', transition: 'all 0.2s', animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', background: 'rgba(124,158,255,0.1)', color: '#7C9EFF', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>{s.topicEmoji} {s.topic}</span>
                  <span style={{ fontSize: '11px', color: sub, marginLeft: 'auto' }}>{s.time}</span>
                </div>
                <p style={{ fontSize: '14px', color: txt, lineHeight: 1.65, marginBottom: '14px' }}>{s.text}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {REACTIONS.map(r => (
                    <button key={r} className="react-btn" onClick={() => handleReact(s.id, r)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '20px', border: `1px solid ${s.myReaction === r ? '#7C9EFF' : border}`, background: s.myReaction === r ? 'rgba(124,158,255,0.12)' : 'transparent', fontSize: '12px', cursor: 'pointer', color: s.myReaction === r ? '#7C9EFF' : sub, transition: 'transform 0.15s', fontWeight: s.myReaction === r ? 600 : 400 }}>
                      <span>{r}</span>
                      {(s.reactions[r] || 0) > 0 && <span>{s.reactions[r]}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
