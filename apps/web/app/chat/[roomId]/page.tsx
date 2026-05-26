'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { API_URL } from '@/lib/config'
import { useSocket } from '@/hooks/useSocket'

interface Message {
  id: string
  message: string
  displayName: string
  timestamp: string
  isSelf: boolean
}

const THEMES = {
  soft: {
    name: '🌿 Nhẹ nhàng',
    bg: '#F8F9FF',
    card: 'white',
    header: 'linear-gradient(135deg, rgba(124,158,255,0.1), rgba(168,213,186,0.1))',
    msgSelf: 'linear-gradient(135deg, #7C9EFF, #9BB8FF)',
    msgOther: '#F0F4FF',
    msgOtherColor: '#3a4a6b',
    input: '#F8F9FF',
    border: 'rgba(124,158,255,0.2)',
    send: 'linear-gradient(135deg, #7C9EFF, #9BB8FF)',
    dot: '#A8D5BA',
  },
  love: {
    name: '💕 Tình yêu',
    bg: '#FFF5F7',
    card: 'white',
    header: 'linear-gradient(135deg, rgba(255,182,193,0.2), rgba(255,105,135,0.08))',
    msgSelf: 'linear-gradient(135deg, #FF6B8A, #FF8FA3)',
    msgOther: '#FFF0F3',
    msgOtherColor: '#8B3A52',
    input: '#FFF5F7',
    border: 'rgba(255,107,138,0.2)',
    send: 'linear-gradient(135deg, #FF6B8A, #FF8FA3)',
    dot: '#FF8FA3',
  },
  cool: {
    name: '🌙 Cool',
    bg: '#0F1117',
    card: '#1A1D27',
    header: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
    msgSelf: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    msgOther: '#252836',
    msgOtherColor: '#C4C9E2',
    input: '#252836',
    border: 'rgba(99,102,241,0.3)',
    send: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    dot: '#8B5CF6',
  },
}

type ThemeKey = keyof typeof THEMES

export default function ChatRoomPage() {
  const { roomId } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [partnerLeft, setPartnerLeft] = useState(false)
  const [typing, setTyping] = useState(false)
  const [theme, setTheme] = useState<ThemeKey>('soft')
  const [showThemes, setShowThemes] = useState(false)
  const socketRef = useRef<Socket | null>(null) 
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  const session = typeof window !== 'undefined'
  ? JSON.parse(sessionStorage.getItem('rc_session') || '{}')
    : {}

  const t = THEMES[theme]

  useEffect(() => {
    const socket = io(API_URL, { 
      transports: ['polling', 'websocket'] 
    })
    socketRef.current = socket
    socket.emit('join:room', { roomId })

    socket.on('chat:message', (msg: Message) => {
      const isSelf = msg.displayName === session.displayName
      setMessages(prev => [...prev, { ...msg, isSelf }])
    })

    socket.on('chat:typing', () => {
      setTyping(true)
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setTyping(false), 2000)
    })

    socket.on('chat:partner_left', () => setPartnerLeft(true))

    return () => { socket.disconnect() }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return
    socketRef.current.emit('chat:message', {
      roomId,
      message: input.trim(),
      displayName: session.displayName
    })
    setInput('')
  }

  const handleTyping = () => {
    socketRef.current?.emit('chat:typing', { roomId, displayName: session.displayName })
  }

  const leaveRoom = () => {
    socketRef.current?.emit('chat:leave', { roomId })
    router.push('/chat')
  }

  return (
    <div style={{minHeight:'100vh', background:t.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'16px', transition:'all 0.3s'}}>
      <div style={{width:'100%', maxWidth:'480px', background:t.card, borderRadius:'24px', border:`0.5px solid ${t.border}`, boxShadow:'0 4px 28px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', height:'88vh', transition:'all 0.3s'}}>

        {/* Header */}
        <div style={{padding:'14px 18px', background:t.header, borderBottom:`0.5px solid ${t.border}`, borderRadius:'24px 24px 0 0', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <div style={{width:'36px', height:'36px', borderRadius:'50%', background:t.send, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px'}}>🎭</div>
            <div>
              <div style={{fontSize:'13px', fontWeight:600, color: theme === 'cool' ? '#E2E8F0' : '#1a2340'}}>Phòng ẩn danh</div>
              <div style={{fontSize:'11px', color:t.dot, display:'flex', alignItems:'center', gap:'4px'}}>
                <span style={{width:'6px', height:'6px', background:t.dot, borderRadius:'50%', display:'inline-block'}}></span>
                Đang kết nối
              </div>
            </div>
          </div>
          <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
            {/* Theme picker */}
            <div style={{position:'relative'}}>
              <button onClick={() => setShowThemes(!showThemes)}
                style={{padding:'6px 12px', borderRadius:'20px', border:`0.5px solid ${t.border}`, background:'transparent', color: theme === 'cool' ? '#C4C9E2' : '#5a6889', fontSize:'12px', cursor:'pointer'}}>
                🎨 Nền
              </button>
              {showThemes && (
                <div style={{position:'absolute', right:0, top:'36px', background: theme === 'cool' ? '#1A1D27' : 'white', borderRadius:'14px', border:`0.5px solid ${t.border}`, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', padding:'8px', zIndex:10, display:'flex', flexDirection:'column', gap:'4px', minWidth:'140px'}}>
                  {(Object.keys(THEMES) as ThemeKey[]).map(k => (
                    <button key={k} onClick={() => { setTheme(k); setShowThemes(false) }}
                      style={{padding:'8px 12px', borderRadius:'10px', border:'none', background: theme === k ? t.send : 'transparent', color: theme === 'cool' ? '#C4C9E2' : '#5a6889', fontSize:'12px', cursor:'pointer', textAlign:'left', fontWeight: theme === k ? 600 : 400}}>
                      {THEMES[k].name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={leaveRoom}
              style={{padding:'6px 12px', borderRadius:'20px', border:'none', background:'transparent', color:'#ef4444', fontSize:'12px', cursor:'pointer'}}>
              Rời phòng
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px'}}>
          {messages.length === 0 && (
            <div style={{textAlign:'center', color: theme === 'cool' ? '#6B7280' : '#8fa0b8', fontSize:'13px', marginTop:'40px'}}>
              Bắt đầu cuộc trò chuyện 🌿
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} style={{display:'flex', justifyContent: msg.isSelf ? 'flex-end' : 'flex-start'}}>
              <div style={{maxWidth:'75%', padding:'10px 14px', borderRadius:'18px', fontSize:'13px', lineHeight:1.5, background: msg.isSelf ? t.msgSelf : t.msgOther, color: msg.isSelf ? 'white' : t.msgOtherColor, borderBottomRightRadius: msg.isSelf ? '4px' : '18px', borderBottomLeftRadius: msg.isSelf ? '18px' : '4px'}}>
                {msg.message}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{display:'flex', justifyContent:'flex-start'}}>
              <div style={{background:t.msgOther, padding:'10px 14px', borderRadius:'18px', borderBottomLeftRadius:'4px', display:'flex', gap:'4px', alignItems:'center'}}>
                {[0,1,2].map(i => (
                  <div key={i} style={{width:'6px', height:'6px', background:t.dot, borderRadius:'50%', animation:'bounce 1.2s ease infinite', animationDelay:`${i*0.2}s`}} />
                ))}
              </div>
            </div>
          )}
          {partnerLeft && (
            <div style={{textAlign:'center', color:'#ef4444', background:'#FEF2F2', borderRadius:'12px', padding:'8px 16px', fontSize:'12px'}}>
              Người kia đã rời phòng 👋
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{padding:'12px 16px', borderTop:`0.5px solid ${t.border}`, display:'flex', flexDirection:'column', gap:'8px'}}>
          {/* Emoji bar */}
          <div style={{display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'4px'}}>
            {['😊','😢','😅','🥺','❤️','💙','🌿','✨','😭','🤗','😤','💪','🙏','😴','🫂','👋'].map(emoji => (
              <button key={emoji} onClick={() => setInput(prev => prev + emoji)}
                style={{fontSize:'18px', background:'none', border:'none', cursor:'pointer', padding:'2px 4px', borderRadius:'8px', flexShrink:0, transition:'transform 0.1s'}}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.3)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                {emoji}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); handleTyping() }}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Nhập tin nhắn..."
              style={{flex:1, padding:'10px 16px', borderRadius:'20px', border:`0.5px solid ${t.border}`, background:t.input, fontSize:'13px', color: theme === 'cool' ? '#c0c8e8' : '#2D3748', outline:'none', transition:'all 0.3s'}}
            />
            <button onClick={sendMessage} disabled={!input.trim()}
              style={{width:'38px', height:'38px', borderRadius:'50%', border:'none', background: input.trim() ? t.send : '#e0e4f0', color:'white', cursor: input.trim() ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', transition:'all 0.2s'}}>
              ➤
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
      `}</style>
    </div>
  )
}