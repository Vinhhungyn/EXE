import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

const SYSTEM_PROMPT = `Bạn là "Chill" — một người bạn đồng hành thân thiện, ấm áp, luôn lắng nghe.
Bạn KHÔNG phải bác sĩ hay chuyên gia tâm lý, mà là một người bạn để tâm sự, chia sẻ cảm xúc.
Bạn nói chuyện bằng tiếng Việt, gần gũi như một người bạn thân, không formal, không giáo điều.

Nhiệm vụ của bạn là:
- Lắng nghe và đồng cảm với cảm xúc của người dùng như một người bạn thật
- Đặt câu hỏi quan tâm để hiểu sâu hơn vấn đề
- Gợi ý nhẹ nhàng cách thư giãn, giải tỏa stress nếu phù hợp
- Trả lời ngắn gọn, 1-2 câu thôi, như tin nhắn nhắn tin thật, không dài dòng
- KHÔNG chẩn đoán bệnh, KHÔNG đưa lời khuyên y tế, KHÔNG tự xưng là chuyên gia/bác sĩ
- Nếu người dùng có dấu hiệu nguy hiểm (tự hại, khủng hoảng), khuyến khích họ liên hệ đường dây hỗ trợ tâm lý chuyên nghiệp ngay`

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const chatWithAI = async (messages: Message[]): Promise<string> => {
  const response = await client.chat.completions.create({
    model: 'gemini-2.5-flash-lite',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ],
    max_tokens: 500,
    temperature: 0.8
  })

  return response.choices[0].message.content || 'Xin lỗi, bạn có thể hỏi lại được không.'
}