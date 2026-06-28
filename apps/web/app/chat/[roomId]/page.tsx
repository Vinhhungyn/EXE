'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { API_URL } from '@/lib/config'
import { useVoiceRecorder, blobToBase64 } from '@/hooks/useVoiceRecorder'

interface Message {
  id: string
  message: string
  displayName: string
  timestamp: string
  isSelf: boolean
  type?: 'text' | 'voice'
  audioData?: string | null
  duration?: number | null
}

const REACTION_EMOJIS = ['❤️', '😂', '😢', '😮', '👍', '🙏']

const CHECKIN_OPTIONS = [
  { key: 'lighter', emoji: '😊', label: 'Nhẹ hơn' },
  { key: 'same', emoji: '😐', label: 'Bình thường' },
  { key: 'still_hard', emoji: '😔', label: 'Vẫn khó' },
] as const

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

function VoiceBubble({ audioData, duration, isSelf, theme }: { audioData: string; duration: number | null; isSelf: boolean; theme: ThemeKey }) {
  const t = THEMES[theme]
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
      <audio
        ref={audioRef}
        src={audioData}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0) }}
        onTimeUpdate={e => {
          const el = e.currentTarget
          if (el.duration) setProgress(el.currentTime / el.duration)
        }}
      />
      <button
        onClick={toggle}
        style={{
          width: '30px', height: '30px', borderRadius: '50%', border: 'none', flexShrink: 0,
          background: isSelf ? 'rgba(255,255,255,0.25)' : t.send,
          color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
        }}>
        {playing ? '⏸' : '▶'}
      </button>
      <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: isSelf ? 'rgba(255,255,255,0.3)' : 'rgba(124,158,255,0.2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: isSelf ? 'white' : t.send, transition: 'width 0.1s linear' }} />
      </div>
      <span style={{ fontSize: '11px', opacity: 0.85, flexShrink: 0 }}>🎙️ {duration ? `${Math.ceil(duration / 1000)}s` : ''}</span>
    </div>
  )
}

function ReactionPicker({ theme, onPick, onClose }: { theme: ThemeKey; onPick: (emoji: string) => void; onClose: () => void }) {
  const t = THEMES[theme]
  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: 'absolute', bottom: '100%', marginBottom: '6px', left: 0,
        display: 'flex', gap: '4px', padding: '6px 8px', borderRadius: '20px',
        background: theme === 'cool' ? '#1A1D27' : 'white',
        border: `0.5px solid ${t.border}`, boxShadow: '0 6px 18px rgba(0,0,0,0.15)', zIndex: 5,
      }}>
      {REACTION_EMOJIS.map(e => (
        <button key={e} onClick={() => onPick(e)}
          style={{ background: 'none', border: 'none', fontSize: '17px', cursor: 'pointer', padding: '2px', borderRadius: '8px', transition: 'transform 0.1s' }}
          onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.3)')}
          onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}>
          {e}
        </button>
      ))}
    </div>
  )
}

function CheckinModal({ theme, onPick, onSkip }: { theme: ThemeKey; onPick: (key: typeof CHECKIN_OPTIONS[number]['key']) => void; onSkip: () => void }) {
  const t = THEMES[theme]
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px',
    }}>
      <div style={{
        width: '100%', maxWidth: '360px', background: theme === 'cool' ? '#1A1D27' : 'white',
        borderRadius: '24px', padding: '28px 24px', textAlign: 'center',
        border: `0.5px solid ${t.border}`, animation: 'popIn 0.25s ease',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌿</div>
        <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: '18px', fontWeight: 700, color: theme === 'cool' ? '#E2E8F0' : '#1a2340', marginBottom: '6px' }}>
          Bạn cảm thấy thế nào sau cuộc trò chuyện?
        </h2>
        <p style={{ fontSize: '12px', color: t.dot, marginBottom: '20px' }}>Chia sẻ giúp mình hiểu bạn hơn</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CHECKIN_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => onPick(opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '16px', border: `0.5px solid ${t.border}`,
                background: theme === 'cool' ? 'rgba(255,255,255,0.04)' : '#F8F9FF',
                color: theme === 'cool' ? '#C4C9E2' : '#1a2340', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
              <span style={{ fontSize: '22px' }}>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={onSkip} style={{ marginTop: '16px', background: 'none', border: 'none', color: t.dot, fontSize: '12px', cursor: 'pointer' }}>
          Bỏ qua
        </button>
      </div>
      <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  )
}

type CheckinEntry = {
  date: string
  key: typeof CHECKIN_OPTIONS[number]['key']
  label: string
  emoji: string
}

export default function ChatRoomPage() {
  const { roomId } = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [partnerLeft, setPartnerLeft] = useState(false)
  const [typing, setTyping] = useState(false)
  const [theme, setTheme] = useState<ThemeKey>('soft')
  const [showThemes, setShowThemes] = useState(false)
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [reactions, setReactions] = useState<Record<string, { emoji: string; displayName: string }[]>>({})
  const [showCheckin, setShowCheckin] = useState(false)
  const socketRef = useRef<Socket | null>(null) 
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<NodeJS.Timeout | undefined>(undefined)

  const {
    isRecording, isProcessing, elapsedMs, maxDurationMs, error: recError,
    startRecording, stopRecording, cancelRecording,
  } = useVoiceRecorder()

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

    socket.on('chat:reaction', ({ messageId, emoji, displayName }: { messageId: string; emoji: string; displayName: string }) => {
      setReactions(prev => {
        const existing = prev[messageId] ?? []
        // Mỗi người chỉ giữ 1 reaction gần nhất trên 1 message
        const withoutThisUser = existing.filter(r => r.displayName !== displayName)
        return { ...prev, [messageId]: [...withoutThisUser, { emoji, displayName }] }
      })
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
      displayName: session.displayName,
      type: 'text',
    })
    setInput('')
  }

  const handleTyping = () => {
    socketRef.current?.emit('chat:typing', { roomId, displayName: session.displayName })
  }

  const leaveRoom = () => {
    socketRef.current?.emit('chat:leave', { roomId })
    // Chỉ hỏi checkin nếu đã thực sự trò chuyện (có ít nhất 1 tin nhắn)
    if (messages.length > 0) {
      setShowCheckin(true)
    } else {
      router.push('/chat')
    }
  }

  const finishLeaving = (key?: typeof CHECKIN_OPTIONS[number]['key']) => {
    if (key) {
      const opt = CHECKIN_OPTIONS.find(o => o.key === key)!
      const entry: CheckinEntry = {
        date: new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        key: opt.key,
        label: opt.label,
        emoji: opt.emoji,
      }
      try {
        const stored = JSON.parse(localStorage.getItem('rc_checkin_history') || '[]')
        const updated = [entry, ...stored].slice(0, 50)
        localStorage.setItem('rc_checkin_history', JSON.stringify(updated))
      } catch {
        localStorage.setItem('rc_checkin_history', JSON.stringify([entry]))
      }
    }
    setShowCheckin(false)
    router.push('/chat')
  }

  const handleMicDown = () => {
    startRecording()
  }

  const handleMicUp = async () => {
    if (!isRecording) return
    const result = await stopRecording()
    if (!result || !socketRef.current) return
    const audioData = await blobToBase64(result.blob)
    socketRef.current.emit('chat:message', {
      roomId,
      message: '🎙️ Voice note',
      displayName: session.displayName,
      type: 'voice',
      audioData,
      duration: result.durationMs,
    })
  }

  const handleReact = (messageId: string, emoji: string) => {
    socketRef.current?.emit('chat:reaction', { roomId, messageId, emoji, displayName: session.displayName })
    setReactions(prev => {
      const existing = prev[messageId] ?? []
      const withoutMe = existing.filter(r => r.displayName !== session.displayName)
      return { ...prev, [messageId]: [...withoutMe, { emoji, displayName: session.displayName }] }
    })
    setPickerFor(null)
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
          {messages.map(msg => {
            const msgReactions = reactions[msg.id] ?? []
            return (
              <div key={msg.id} style={{display:'flex', flexDirection:'column', alignItems: msg.isSelf ? 'flex-end' : 'flex-start', gap:'3px'}}>
                <div
                  style={{position:'relative', display:'flex', alignItems:'center', gap:'4px', flexDirection: msg.isSelf ? 'row-reverse' : 'row'}}
                  onMouseEnter={() => {}}
                >
                  <div style={{maxWidth:'320px', padding: msg.type === 'voice' ? '10px 12px' : '10px 14px', borderRadius:'18px', fontSize:'13px', lineHeight:1.5, background: msg.isSelf ? t.msgSelf : t.msgOther, color: msg.isSelf ? 'white' : t.msgOtherColor, borderBottomRightRadius: msg.isSelf ? '4px' : '18px', borderBottomLeftRadius: msg.isSelf ? '18px' : '4px'}}>
                    {msg.type === 'voice' && msg.audioData ? (
                      <VoiceBubble audioData={msg.audioData} duration={msg.duration ?? null} isSelf={msg.isSelf} theme={theme} />
                    ) : (
                      msg.message
                    )}
                  </div>
                  <button
                    onClick={() => setPickerFor(pickerFor === msg.id ? null : msg.id)}
                    style={{
                      width: '22px', height: '22px', borderRadius: '50%', border: `0.5px solid ${t.border}`,
                      background: theme === 'cool' ? '#1A1D27' : 'white', color: t.dot, fontSize: '11px',
                      cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0.7,
                    }}
                    title="Thêm reaction">
                    +
                  </button>
                  {pickerFor === msg.id && (
                    <ReactionPicker theme={theme} onPick={emoji => handleReact(msg.id, emoji)} onClose={() => setPickerFor(null)} />
                  )}
                </div>
                {msgReactions.length > 0 && (
                  <div style={{display:'flex', gap:'3px', flexWrap:'wrap', maxWidth:'200px'}}>
                    {msgReactions.map((r, i) => (
                      <span key={i} title={r.displayName}
                        style={{fontSize:'12px', background: theme === 'cool' ? 'rgba(255,255,255,0.06)' : 'rgba(124,158,255,0.08)', borderRadius:'10px', padding:'2px 6px', border:`0.5px solid ${t.border}`}}>
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
          {recError && (
            <div style={{fontSize:'11px', color:'#ef4444', textAlign:'center'}}>{recError}</div>
          )}

          {isRecording ? (
            /* Recording UI */
            <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 12px', borderRadius:'20px', background: theme === 'cool' ? '#252836' : '#FEF2F2'}}>
              <span style={{width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444', flexShrink:0, animation:'pulse 1s ease infinite'}} />
              <div style={{flex:1, height:'4px', borderRadius:'4px', background:'rgba(239,68,68,0.2)', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${Math.min(100, (elapsedMs / maxDurationMs) * 100)}%`, background:'#ef4444', transition:'width 0.1s linear'}} />
              </div>
              <span style={{fontSize:'12px', color:'#ef4444', fontWeight:600, flexShrink:0}}>{Math.ceil(elapsedMs / 1000)}s / 30s</span>
              <button onClick={cancelRecording} style={{background:'none', border:'none', color:'#ef4444', fontSize:'12px', cursor:'pointer', flexShrink:0}}>Hủy</button>
              <button onClick={handleMicUp}
                style={{width:'32px', height:'32px', borderRadius:'50%', border:'none', background:'#ef4444', color:'white', cursor:'pointer', flexShrink:0, fontSize:'13px'}}>
                ✓
              </button>
            </div>
          ) : isProcessing ? (
            <div style={{textAlign:'center', fontSize:'12px', color:t.dot, padding:'8px'}}>🎚️ Đang đổi giọng ẩn danh...</div>
          ) : (
            <>
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
                <button onClick={handleMicDown} title="Ghi voice note ẩn danh (giữ tối đa 30s)"
                  style={{width:'38px', height:'38px', borderRadius:'50%', border:`0.5px solid ${t.border}`, background:'transparent', color: theme === 'cool' ? '#C4C9E2' : '#5a6889', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', flexShrink:0}}>
                  🎙️
                </button>
                <input
                  value={input}
                  onChange={e => { setInput(e.target.value); handleTyping() }}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Nhập tin nhắn..."
                  style={{flex:1, padding:'10px 16px', borderRadius:'20px', border:`0.5px solid ${t.border}`, background:t.input, fontSize:'13px', color: theme === 'cool' ? '#c0c8e8' : '#2D3748', outline:'none', transition:'all 0.3s'}}
                />
                <button onClick={sendMessage} disabled={!input.trim()}
                  style={{width:'38px', height:'38px', borderRadius:'50%', border:'none', background: input.trim() ? t.send : '#e0e4f0', color:'white', cursor: input.trim() ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', transition:'all 0.2s', flexShrink:0}}>
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showCheckin && (
        <CheckinModal theme={theme} onPick={key => finishLeaving(key)} onSkip={() => finishLeaving()} />
      )}

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}
