import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

const SYSTEM_PROMPT = `Bạn là một chuyên gia tâm lý trị liệu tên là "Dr. Chill" — thân thiện, 
lắng nghe sâu sắc và không phán xét. Bạn nói chuyện bằng tiếng Việt, nhẹ nhàng và ấm áp.
Nhiệm vụ của bạn là:
- Lắng nghe và đồng cảm với cảm xúc của người dùng
- Đặt câu hỏi mở để hiểu sâu hơn vấn đề
- Gợi ý các kỹ thuật thư giãn, mindfulness phù hợp
- KHÔNG chẩn đoán bệnh, KHÔNG thay thế bác sĩ thật
- Nếu người dùng có dấu hiệu nguy hiểm, hướng dẫn gọi đường dây hỗ trợ tâm lý`

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const chatWithAI = async (messages: Message[]): Promise<string> => {
  const response = await client.chat.completions.create({
    model: 'gemini-2.0-flash',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ],
    max_tokens: 1000,
    temperature: 0.8
  })

  return response.choices[0].message.content || 'Xin lỗi, tôi không thể trả lời lúc này.'
}