'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'

export default function ChatPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ displayName: string; token: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [finding, setFinding] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [matched, setMatched] = useState(false)
  const [matchedName, setMatchedName] = useState('')
  const socketRef = useRef<Socket | null>(null)
  const countdownRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const stored = localStorage.getItem('rc_session')
    if (stored) {
      setSession(JSON.parse(stored))
      setLoading(false)
      return
    }
    fetch('http://localhost:3001/api/v1/chat/session', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        localStorage.setItem('rc_session', JSON.stringify({
          displayName: data.displayName,
          token: data.token
        }))
        setSession({ displayName: data.displayName, token: data.token })
        setLoading(false)
      })
  }, [])

  const findMatch = () => {
    if (!session) return
    setFinding(true)
    setCountdown(0)

    const socket = io('http://localhost:3001', { transports: ['websocket'] })
    socketRef.current = socket

    socket.emit('match:find', { displayName: session.displayName })

    // Đếm thời gian chờ
    let secs = 0
    countdownRef.current = setInterval(() => {
      secs++
      setCountdown(secs)
    }, 1000)

    socket.on('match:waiting', () => console.log('Waiting...'))

    socket.on('match:found', ({ roomId, users }: { roomId: string; users: string[] }) => {
      clearInterval(countdownRef.current)
      const partner = users.find(u => u !== session.displayName) || 'Người lạ'
      setMatchedName(partner)
      setMatched(true)
      setFinding(false)

      // Chuyển trang sau 2s
      setTimeout(() => {
        router.push(`/chat/${roomId}`)
      }, 2000)
    })
  }

  const cancelFind = () => {
    clearInterval(countdownRef.current)
    socketRef.current?.emit('match:cancel')
    socketRef.current?.disconnect()
    setFinding(false)
    setCountdown(0)
  }

  if (loading) return (
    <div style={{minHeight:'100vh', background:'#F8F9FF', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#7C9EFF', fontSize:'14px'}}>Đang tạo danh tính ẩn danh...</div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FF', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px'}}>

      {/* Match success popup */}
      {matched && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, backdropFilter:'blur(4px)'}}>
          <div style={{background:'white', borderRadius:'24px', padding:'32px 28px', textAlign:'center', maxWidth:'320px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', animation:'popIn 0.3s ease'}}>
            <div style={{fontSize:'48px', marginBottom:'12px'}}>🎉</div>
            <h3 style={{fontFamily:'Nunito, sans-serif', fontSize:'20px', fontWeight:700, color:'#1a2340', marginBottom:'8px'}}>Đã tìm thấy!</h3>
            <p style={{fontSize:'14px', color:'#8fa0b8', marginBottom:'16px'}}>Kết nối với <strong style={{color:'#7C9EFF'}}>{matchedName}</strong></p>
            <div style={{display:'flex', gap:'4px', justifyContent:'center'}}>
              {[0,1,2].map(i => (
                <div key={i} style={{width:'8px', height:'8px', borderRadius:'50%', background:'#7C9EFF', animation:'bounce 1s ease infinite', animationDelay:`${i*0.2}s'`}} />
              ))}
            </div>
            <p style={{fontSize:'12px', color:'#8fa0b8', marginTop:'12px'}}>Đang vào phòng chat...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Card */}
      <div style={{background:'white', borderRadius:'24px', border:'0.5px solid rgba(124,158,255,0.2)', boxShadow:'0 4px 28px rgba(124,158,255,0.1)', padding:'32px 28px', width:'100%', maxWidth:'400px', textAlign:'center'}}>

        <div style={{fontSize:'40px', marginBottom:'12px'}}>🎭</div>
        <h2 style={{fontFamily:'Nunito, sans-serif', fontSize:'20px', fontWeight:700, color:'#1a2340', marginBottom:'4px'}}>
          Xin chào, <span style={{color:'#7C9EFF'}}>{session?.displayName}</span>
        </h2>
        <p style={{fontSize:'13px', color:'#8fa0b8', marginBottom:'28px'}}>Danh tính ẩn danh của bạn đã sẵn sàng</p>

        {!finding ? (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <button onClick={findMatch}
              style={{width:'100%', padding:'13px', borderRadius:'16px', border:'none', background:'linear-gradient(135deg,#7C9EFF,#9BB8FF)', color:'white', fontSize:'14px', fontWeight:600, cursor:'pointer', boxShadow:'0 4px 16px rgba(124,158,255,0.3)', transition:'all 0.2s'}}>
              💬 Tâm sự với người lạ
            </button>
            <button onClick={() => router.push('/ai')}
              style={{width:'100%', padding:'13px', borderRadius:'16px', border:'1px solid rgba(124,158,255,0.3)', background:'white', color:'#5a6889', fontSize:'14px', fontWeight:600, cursor:'pointer', transition:'all 0.2s'}}>
              🤖 Chat với AI 24/7
            </button>
            <button onClick={() => router.push('/onboarding')}
              style={{fontSize:'12px', color:'#8fa0b8', background:'none', border:'none', cursor:'pointer', marginTop:'4px'}}>
              ✏️ Đổi nickname / chủ đề
            </button>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'16px'}}>
            {/* Spinner */}
            <div style={{width:'56px', height:'56px', borderRadius:'50%', border:'3px solid rgba(124,158,255,0.2)', borderTop:'3px solid #7C9EFF', animation:'spin 1s linear infinite'}} />

            <div>
              <p style={{fontSize:'15px', fontWeight:600, color:'#1a2340', marginBottom:'4px'}}>Đang tìm người tâm sự...</p>
              <p style={{fontSize:'12px', color:'#8fa0b8'}}>Đã chờ {countdown} giây</p>
            </div>

            {/* Tips khi chờ */}
            <div style={{background:'rgba(124,158,255,0.06)', borderRadius:'14px', padding:'12px 16px', width:'100%'}}>
              <p style={{fontSize:'12px', color:'#7C9EFF', fontWeight:500}}>
                💡 {countdown < 10 ? 'Đang kết nối với người phù hợp...' : countdown < 30 ? 'Vẫn đang tìm, hãy kiên nhẫn nhé!' : 'Mở thêm tab khác để test nhanh hơn 😄'}
              </p>
            </div>

            <button onClick={cancelFind}
              style={{fontSize:'13px', color:'#ff6b6b', background:'rgba(255,107,107,0.08)', border:'none', cursor:'pointer', padding:'8px 20px', borderRadius:'20px'}}>
              Huỷ tìm kiếm
            </button>
          </div>
        )}
      </div>

      {/* Online indicator */}
      <div style={{marginTop:'16px', display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#8fa0b8'}}>
        <div style={{width:'6px', height:'6px', borderRadius:'50%', background:'#A8D5BA'}} />
        Đang có người online · Ẩn danh hoàn toàn
      </div>
    </div>
  )
}