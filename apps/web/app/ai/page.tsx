import AIChatbot from '@/components/ai/AIChatbot'

export default function AIPage() {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-green-700 mb-6">🌿 Dr. Chill — Chuyên gia Tâm lý AI</h1>
      <AIChatbot />
      <p className="text-xs text-gray-400 mt-4">Chill là AI hỗ trợ tâm sự, không thay thế chuyên gia tâm lý. Nếu cần hỗ trợ khẩn cấp: 1800 599 920</p>
    </div>
  )
}