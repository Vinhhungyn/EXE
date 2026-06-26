'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://exe-0kxy.onrender.com'

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chào! Mình là Chill 🌿 Hôm nay bạn thế nào, có muốn chia sẻ gì không?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 1): Promise<Response> => {
    try {
      const res = await fetch(url, options)
      if (!res.ok && retries > 0) {
        await new Promise(r => setTimeout(r, 3000)) // đợi 3s rồi retry
        return fetchWithRetry(url, options, retries - 1)
      }
      return res
    } catch (err) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 3000))
        return fetchWithRetry(url, options, retries - 1)
      }
      throw err
    }
  }
  
  const sendMessage = async () => {
    if (!input.trim() || loading) return
  
    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
  
    try {
      const res = await fetchWithRetry(`${BACKEND_URL}/api/v1/ai/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      }, 1) // thử lại 1 lần nếu fail
  
      if (!res.ok) throw new Error('Server error')
  
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, bạn có thể hỏi lại được không? Mãi Yêu🌿' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">🌿</div>
        <div>
        <p className="font-bold">Chill</p>
        <p className="text-xs text-green-100">Người bạn đồng hành • Luôn lắng nghe</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-green-500 text-white rounded-br-none'
                : 'bg-white text-gray-800 shadow rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white shadow px-4 py-2 rounded-2xl rounded-bl-none text-gray-400 text-sm">
              Dr. Chill đang nhập...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2 bg-white">
        <input
className="flex-1 border rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Chia sẻ cảm xúc của bạn..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 disabled:opacity-50"
        >
          Gửi
        </button>
      </div>
    </div>
  )
}