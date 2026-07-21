'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_URL } from '@/lib/config';

const TOPICS = [
  { id: 'love', emoji: '💕', label: 'Tình yêu' },
  { id: 'study', emoji: '📚', label: 'Học tập' },
  { id: 'family', emoji: '🏠', label: 'Gia đình' },
  { id: 'money', emoji: '💰', label: 'Tài chính' },
  { id: 'work', emoji: '💼', label: 'Công việc' },
  { id: 'health', emoji: '🌿', label: 'Sức khỏe' },
  { id: 'friend', emoji: '👫', label: 'Bạn bè' },
  { id: 'other', emoji: '💭', label: 'Khác' },
]

const JOBS = [
  '🎓 Sinh viên', '💻 IT / Lập trình', '🎨 Thiết kế / Sáng tạo',
  '📊 Kinh doanh', '🏥 Y tế', '🍳 Ẩm thực', '✏️ Giáo dục', '🔧 Kỹ thuật',
  '📱 Marketing', '🎵 Nghệ thuật', '⚖️ Luật', '🌍 Khác',
]

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'peer'

  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedJob, setSelectedJob] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id].slice(0, 3)
    )
  }

  const handleStart = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const res = await fetch(`${API_URL}/api/v1/chat/session`, {
        method: 'POST',
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const data = await res.json()
      const displayName = nickname.trim() || data.displayName
      sessionStorage.setItem('rc_session', JSON.stringify({
        displayName,
        token: data.token,
        topics: selectedTopics,
        job: selectedJob,
        mode
      }))
      if (mode === 'ai') {
        router.push('/ai')
      } else {
        router.push('/chat')
      }
    } catch (err: unknown) {
      setLoading(false)
      if (err instanceof Error && err.name === 'AbortError') {
        setErrorMsg('⚠️ Máy chủ đang khởi động, vui lòng thử lại sau vài giây!')
      } else {
        setErrorMsg('❌ Không kết nối được máy chủ, thử lại nhé!')
      }
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F8F9FF; }
      `}</style>

      <div style={{minHeight:'100vh', background:'#F8F9FF', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px'}}>

        {/* Logo */}
        <div style={{fontFamily:'Nunito', fontSize:'18px', fontWeight:700, background:'linear-gradient(120deg,#7C9EFF,#A8D5BA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'24px'}}>
          🌿 relax&chill
        </div>

        {/* Card */}
        <div style={{background:'white', borderRadius:'24px', border:'0.5px solid rgba(124,158,255,0.2)', boxShadow:'0 4px 28px rgba(124,158,255,0.1)', padding:'32px 28px', width:'100%', maxWidth:'440px'}}>

          {/* Progress */}
          <div style={{display:'flex', gap:'6px', marginBottom:'28px'}}>
            {[1,2,3].map(s => (
              <div key={s} style={{flex:1, height:'4px', borderRadius:'4px', background: s <= step ? 'linear-gradient(90deg,#7C9EFF,#9BB8FF)' : '#EEF0F8', transition:'all 0.3s'}} />
            ))}
          </div>

          {/* Step 1 — Nickname */}
          {step === 1 && (
            <div>
              <div style={{fontSize:'28px', marginBottom:'8px'}}>👋</div>
              <h2 style={{fontFamily:'Nunito', fontSize:'20px', fontWeight:700, color:'#1a2340', marginBottom:'6px'}}>Bạn muốn được gọi là gì?</h2>
              <p style={{fontSize:'13px', color:'#8fa0b8', marginBottom:'24px'}}>Để trống nếu muốn tên ngẫu nhiên</p>
              <input
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Nhập nickname... (vd: Mây, Gió, Sao)"
                maxLength={20}
                style={{width:'100%', padding:'12px 16px', borderRadius:'14px', border:'1px solid rgba(124,158,255,0.3)', background:'#F8F9FF', fontSize:'14px', color:'#2D3748', outline:'none', marginBottom:'20px'}}
              />
              <button onClick={() => setStep(2)}
                style={{width:'100%', padding:'12px', borderRadius:'14px', border:'none', background:'linear-gradient(135deg,#7C9EFF,#9BB8FF)', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer'}}>
                Tiếp theo →
              </button>
            </div>
          )}

          {/* Step 2 — Topics */}
          {step === 2 && (
            <div>
              <div style={{fontSize:'28px', marginBottom:'8px'}}>💬</div>
              <h2 style={{fontFamily:'Nunito', fontSize:'20px', fontWeight:700, color:'#1a2340', marginBottom:'6px'}}>Bạn muốn tâm sự về gì?</h2>
              <p style={{fontSize:'13px', color:'#8fa0b8', marginBottom:'20px'}}>Chọn tối đa 3 chủ đề</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                {TOPICS.map(t => (
                  <button key={t.id} onClick={() => toggleTopic(t.id)}
                    style={{padding:'10px 14px', borderRadius:'12px', border:`1.5px solid ${selectedTopics.includes(t.id) ? '#7C9EFF' : 'rgba(124,158,255,0.2)'}`, background: selectedTopics.includes(t.id) ? 'rgba(124,158,255,0.1)' : 'white', color: selectedTopics.includes(t.id) ? '#5a7de8' : '#5a6889', fontSize:'13px', fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.15s'}}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => setStep(1)}
                  style={{flex:1, padding:'12px', borderRadius:'14px', border:'1px solid rgba(124,158,255,0.3)', background:'white', color:'#5a6889', fontSize:'14px', cursor:'pointer'}}>
                  ← Quay lại
                </button>
                <button onClick={() => setStep(3)} disabled={selectedTopics.length === 0}
                  style={{flex:2, padding:'12px', borderRadius:'14px', border:'none', background: selectedTopics.length > 0 ? 'linear-gradient(135deg,#7C9EFF,#9BB8FF)' : '#e0e4f0', color: selectedTopics.length > 0 ? 'white' : '#9aa0b8', fontSize:'14px', fontWeight:600, cursor: selectedTopics.length > 0 ? 'pointer' : 'not-allowed'}}>
                  Tiếp theo →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Job */}
          {step === 3 && (
            <div>
              <div style={{fontSize:'28px', marginBottom:'8px'}}>🎯</div>
              <h2 style={{fontFamily:'Nunito', fontSize:'20px', fontWeight:700, color:'#1a2340', marginBottom:'6px'}}>Bạn đang làm gì?</h2>
              <p style={{fontSize:'13px', color:'#8fa0b8', marginBottom:'20px'}}>Để match với người có hoàn cảnh tương tự</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'20px'}}>
                {JOBS.map((job, i) => (
                  <button key={i} onClick={() => setSelectedJob(job)}
                    style={{padding:'9px 12px', borderRadius:'12px', border:`1.5px solid ${selectedJob === job ? '#7C9EFF' : 'rgba(124,158,255,0.2)'}`, background: selectedJob === job ? 'rgba(124,158,255,0.1)' : 'white', color: selectedJob === job ? '#5a7de8' : '#5a6889', fontSize:'12px', fontWeight:500, cursor:'pointer', textAlign:'left', transition:'all 0.15s'}}>
                    {job}
                  </button>
                ))}
              </div>

              {/* Error message */}
              {errorMsg && (
                <div style={{marginBottom:'12px', padding:'10px 14px', borderRadius:'12px', background:'#fff0f0', border:'1px solid #ffcccc', color:'#cc4444', fontSize:'13px'}}>
                  {errorMsg}
                </div>
              )}

              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => setStep(2)} disabled={loading}
                  style={{flex:1, padding:'12px', borderRadius:'14px', border:'1px solid rgba(124,158,255,0.3)', background:'white', color:'#5a6889', fontSize:'14px', cursor:'pointer'}}>
                  ← Quay lại
                </button>
                <button onClick={handleStart} disabled={loading}
                  style={{flex:2, padding:'12px', borderRadius:'14px', border:'none', background:'linear-gradient(135deg,#7C9EFF,#9BB8FF)', color:'white', fontSize:'14px', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1}}>
                  {loading ? '⏳ Đang kết nối...' : '🌿 Bắt đầu tâm sự'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip */}
        <button onClick={handleStart} disabled={loading} style={{marginTop:'16px', fontSize:'12px', color:'#8fa0b8', background:'none', border:'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1}}>
          Bỏ qua, dùng ngay →
        </button>
      </div>
    </>
  )
}
