'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .rc-root { font-family: 'DM Sans', sans-serif; color: #2D3748; background: #F8F9FF; min-height: 100vh; overflow-x: hidden; }
        .rc-nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 28px; background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); border-bottom: 0.5px solid rgba(124,158,255,0.18); position: sticky; top: 0; z-index: 10; }
        .rc-logo { font-family: 'Nunito', sans-serif; font-size: 20px; font-weight: 700; background: linear-gradient(120deg, #7C9EFF, #A8D5BA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .rc-nav-links { display: flex; gap: 8px; }
        .rc-nav-btn { padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; border: 0.5px solid rgba(124,158,255,0.35); cursor: pointer; color: #5a6889; background: transparent; transition: all 0.18s; }
        .rc-nav-btn:hover { background: rgba(124,158,255,0.1); }
        .rc-nav-btn.primary { background: linear-gradient(135deg, #7C9EFF, #9BB8FF); color: white; border-color: transparent; }
        .rc-nav-btn.primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .rc-hero { padding: 64px 28px 52px; text-align: center; position: relative; overflow: hidden; }
        .rc-hero-bg { position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse 60% 50% at 20% 30%, rgba(124,158,255,0.13) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 80% 70%, rgba(168,213,186,0.13) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 55% 15%, rgba(244,165,192,0.1) 0%, transparent 70%); }
        .rc-hero-content { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; }
        .rc-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(124,158,255,0.12); color: #5a7de8; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; border: 0.5px solid rgba(124,158,255,0.3); margin-bottom: 20px; }
        .rc-hero h1 { font-family: 'Nunito', sans-serif; font-size: 38px; font-weight: 700; line-height: 1.2; color: #1a2340; margin-bottom: 14px; letter-spacing: -0.5px; }
        .rc-hero h1 span { background: linear-gradient(120deg, #7C9EFF, #A8D5BA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .rc-hero p { font-size: 15px; color: #5a6889; line-height: 1.7; margin-bottom: 28px; }
        .rc-hero-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .rc-btn-lg { padding: 11px 26px; border-radius: 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.18s; border: none; font-family: 'DM Sans', sans-serif; }
        .rc-btn-lg.main { background: linear-gradient(135deg, #7C9EFF, #9BB8FF); color: white; box-shadow: 0 4px 18px rgba(124,158,255,0.3); }
        .rc-btn-lg.main:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,158,255,0.38); }
        .rc-btn-lg.sec { background: white; color: #5a6889; border: 0.5px solid rgba(124,158,255,0.3) !important; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
        .rc-btn-lg.sec:hover { background: rgba(124,158,255,0.06); }
        .rc-stats { display: flex; gap: 1px; justify-content: center; background: rgba(124,158,255,0.12); border-radius: 16px; margin: 36px auto 0; max-width: 420px; overflow: hidden; }
        .rc-stat { flex: 1; background: white; padding: 14px 10px; text-align: center; }
        .rc-stat:first-child { border-radius: 15px 0 0 15px; }
        .rc-stat:last-child { border-radius: 0 15px 15px 0; }
        .rc-stat-num { font-family: 'Nunito', sans-serif; font-size: 22px; font-weight: 700; background: linear-gradient(120deg, #7C9EFF, #A8D5BA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .rc-stat-lbl { font-size: 11px; color: #8fa0b8; margin-top: 2px; }
        .rc-section { padding: 48px 28px; max-width: 680px; margin: 0 auto; }
        .rc-section-title { font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 700; color: #1a2340; text-align: center; margin-bottom: 8px; }
        .rc-section-sub { font-size: 14px; color: #8fa0b8; text-align: center; margin-bottom: 32px; }
        .rc-features { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rc-feature-card { background: white; border-radius: 16px; border: 0.5px solid rgba(124,158,255,0.18); padding: 20px; transition: all 0.2s; box-shadow: 0 2px 14px rgba(0,0,0,0.04); }
        .rc-feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
        .rc-feature-icon { width: 42px; height: 42px; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .rc-feature-card h3 { font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 700; color: #1a2340; margin-bottom: 6px; }
        .rc-feature-card p { font-size: 12.5px; color: #6b7a9a; line-height: 1.6; }
        .rc-chat-demo { background: white; border-radius: 20px; border: 0.5px solid rgba(124,158,255,0.2); box-shadow: 0 4px 28px rgba(124,158,255,0.1); overflow: hidden; max-width: 400px; margin: 0 auto; }
        .rc-chat-header { padding: 14px 18px; background: linear-gradient(135deg, rgba(124,158,255,0.1), rgba(168,213,186,0.1)); border-bottom: 0.5px solid rgba(124,158,255,0.15); display: flex; align-items: center; gap: 10px; }
        .rc-chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #7C9EFF, #A8D5BA); display: flex; align-items: center; justify-content: center; font-size: 16px; color: white; }
        .rc-chat-info h4 { font-size: 13px; font-weight: 600; color: #1a2340; }
        .rc-chat-info span { font-size: 11px; color: #A8D5BA; font-weight: 500; }
        .rc-chat-dot { width: 8px; height: 8px; background: #A8D5BA; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }
        .rc-chat-messages { padding: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 200px; }
        .rc-msg { max-width: 78%; }
        .rc-msg.ai { align-self: flex-start; }
        .rc-msg.user { align-self: flex-end; }
        .rc-msg-bubble { padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.5; }
        .rc-msg.ai .rc-msg-bubble { background: #F0F4FF; color: #3a4a6b; border-bottom-left-radius: 4px; }
        .rc-msg.user .rc-msg-bubble { background: linear-gradient(135deg, #7C9EFF, #9BB8FF); color: white; border-bottom-right-radius: 4px; }
        .rc-msg-time { font-size: 10px; color: #aab4c8; margin-top: 3px; padding: 0 4px; }
        .rc-msg.user .rc-msg-time { text-align: right; }
        .rc-typing { display: flex; gap: 4px; align-items: center; padding: 8px 14px; }
        .rc-typing span { width: 6px; height: 6px; background: #b0c0e8; border-radius: 50%; animation: bounce 1.2s ease infinite; }
        .rc-typing span:nth-child(2) { animation-delay: 0.2s; }
        .rc-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
        .rc-chat-input-row { padding: 10px 14px; border-top: 0.5px solid rgba(124,158,255,0.12); display: flex; align-items: center; gap: 8px; }
        .rc-chat-input { flex: 1; padding: 8px 14px; border-radius: 20px; font-size: 13px; border: 0.5px solid rgba(124,158,255,0.25); background: #F8F9FF; color: #3a4a6b; outline: none; }
        .rc-chat-send { width: 34px; height: 34px; border-radius: 50%; border: none; background: linear-gradient(135deg, #7C9EFF, #9BB8FF); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; transition: all 0.15s; }
        .rc-chat-send:hover { transform: scale(1.08); }
        .rc-steps { display: flex; flex-direction: column; gap: 14px; }
        .rc-step { display: flex; gap: 14px; align-items: flex-start; background: white; border-radius: 14px; padding: 16px 18px; border: 0.5px solid rgba(124,158,255,0.15); box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
        .rc-step-num { min-width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #7C9EFF, #A8D5BA); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; }
        .rc-step-content h4 { font-size: 14px; font-weight: 600; color: #1a2340; margin-bottom: 4px; }
        .rc-step-content p { font-size: 12.5px; color: #6b7a9a; line-height: 1.5; }
        .rc-pricing { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rc-plan { background: white; border-radius: 18px; padding: 22px; border: 0.5px solid rgba(124,158,255,0.2); box-shadow: 0 2px 14px rgba(0,0,0,0.04); }
        .rc-plan.featured { border: 1.5px solid rgba(124,158,255,0.5); box-shadow: 0 6px 24px rgba(124,158,255,0.15); position: relative; }
        .rc-plan-badge { position: absolute; top: -11px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #7C9EFF, #9BB8FF); color: white; padding: 3px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .rc-plan-name { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 700; color: #1a2340; margin-bottom: 4px; }
        .rc-plan-price { margin: 10px 0 14px; }
        .rc-plan-price .price { font-size: 26px; font-weight: 700; color: #7C9EFF; }
        .rc-plan-price .period { font-size: 12px; color: #8fa0b8; margin-left: 2px; }
        .rc-plan-items { list-style: none; display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .rc-plan-items li { font-size: 12.5px; color: #4a5a78; display: flex; align-items: center; gap: 7px; }
        .rc-plan-items li::before { content: "✓"; color: #A8D5BA; font-weight: 700; font-size: 13px; }
        .rc-plan-btn { width: 100%; padding: 9px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.18s; }
        .rc-plan-btn.main { background: linear-gradient(135deg, #7C9EFF, #9BB8FF); color: white; }
        .rc-plan-btn.sec { background: #F0F4FF; color: #5a7de8; }
        .rc-plan-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .rc-footer { padding: 28px; text-align: center; border-top: 0.5px solid rgba(124,158,255,0.15); color: #8fa0b8; font-size: 12px; }
        .rc-footer strong { color: #7C9EFF; }
      `}</style>

      <div className="rc-root">
        <nav className="rc-nav">
        <div className="rc-logo" style={{display:'flex', alignItems:'center', gap:'8px'}}>
  <img src="/logo.png" alt="logo" style={{height:'32px', width:'32px', borderRadius:'10px'}} />
  relax&chill
</div>
          <div className="rc-nav-links">
            <button className="rc-nav-btn" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Tính năng</button>
            <button className="rc-nav-btn" onClick={() => document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>Cách dùng</button>
            <button className="rc-nav-btn primary" onClick={() => router.push('/onboarding')}>Dùng miễn phí ↗</button>
          </div>
        </nav>

        <section className="rc-hero">
          <div className="rc-hero-bg"></div>
          <div className="rc-hero-content">
            <div className="rc-badge">🛡️ Hoàn toàn ẩn danh · Không cần đăng ký</div>
            <h1>Một chỗ để <span>thở</span>,<br/>không ai biết là bạn</h1>
            <p>Tâm sự với người lạ tốt bụng hoặc AI lắng nghe 24/7 — không phán xét, không lưu danh tính, hoàn toàn riêng tư.</p>
            <div className="rc-hero-btns">
              <button className="rc-btn-lg main" onClick={() => router.push('/onboarding')}>💬 Tâm sự ngay</button>
              <button className="rc-btn-lg sec" onClick={() => router.push('/onboarding?mode=ai')}>🤖 Chat với AI</button>
            </div>
            <div className="rc-stats">
              <div className="rc-stat"><div className="rc-stat-num">81%</div><div className="rc-stat-lbl">thường xuyên stress</div></div>
              <div className="rc-stat"><div className="rc-stat-num">68%</div><div className="rc-stat-lbl">ngại chia sẻ với người quen</div></div>
              <div className="rc-stat"><div className="rc-stat-num">60%</div><div className="rc-stat-lbl">muốn không gian ẩn danh</div></div>
            </div>
          </div>
        </section>

        <section className="rc-section" id="features">
          <h2 className="rc-section-title">Tất cả những gì bạn cần</h2>
          <p className="rc-section-sub">Thiết kế đơn giản, an toàn, và dễ dùng cho Gen Z Việt Nam</p>
          <div className="rc-features">
            {[
              { icon: '🎭', bg: 'rgba(124,158,255,0.12)', title: 'Chat ẩn danh hoàn toàn', desc: 'Không email, không SĐT. Hệ thống tự tạo danh tính ngẫu nhiên như "Mây#4821" để bảo vệ bạn.' },
              { icon: '🤖', bg: 'rgba(168,213,186,0.15)', title: 'AI lắng nghe 24/7', desc: 'Trợ lý AI được huấn luyện phản hồi nhẹ nhàng, không phán xét, luôn sẵn sàng bất kể giờ nào.' },
              { icon: '🔐', bg: 'rgba(244,165,192,0.15)', title: 'Bảo mật cấp cao', desc: 'Mã hóa end-to-end, không lưu IP, tin nhắn tự xóa sau khi kết thúc phiên chat.' },
              { icon: '🌱', bg: 'rgba(255,220,100,0.15)', title: 'Cộng đồng an toàn', desc: 'Hệ thống báo cáo thông minh và kiểm duyệt nội dung để môi trường luôn lành mạnh.' },
            ].map((f, i) => (
              <div key={i} className="rc-feature-card">
                <div className="rc-feature-icon" style={{background: f.bg}}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rc-section">
          <h2 className="rc-section-title">Cảm giác thật sự thế nào?</h2>
          <p className="rc-section-sub">Một cuộc trò chuyện thực với AI hỗ trợ cảm xúc</p>
          <div className="rc-chat-demo">
            <div className="rc-chat-header">
              <div className="rc-chat-avatar">🤖</div>
              <div className="rc-chat-info">
                <h4>Trợ lý cảm xúc</h4>
                <span><span className="rc-chat-dot"></span>Đang hoạt động</span>
              </div>
            </div>
            <div className="rc-chat-messages">
              <div className="rc-msg ai"><div className="rc-msg-bubble">Xin chào 🌿 Mình ở đây lắng nghe bạn. Hôm nay bạn đang cảm thấy thế nào?</div><div className="rc-msg-time">Bây giờ</div></div>
              <div className="rc-msg user"><div className="rc-msg-bubble">Mình cảm thấy áp lực quá, thi cử sắp đến mà chẳng học được gì...</div><div className="rc-msg-time">Vừa xong</div></div>
              <div className="rc-msg ai"><div className="rc-msg-bubble">Mình hiểu cảm giác đó, ngột ngạt lắm đúng không 💙 Bạn không phải một mình đâu.</div><div className="rc-msg-time">Bây giờ</div></div>
              <div className="rc-msg ai"><div className="rc-msg-bubble" style={{background:'#F0FAFF'}}><div className="rc-typing"><span></span><span></span><span></span></div></div></div>
            </div>
            <div className="rc-chat-input-row">
              <input className="rc-chat-input" placeholder="Nhập gì đó để chia sẻ..." readOnly />
              <button className="rc-chat-send" onClick={() => router.push('/onboarding')}>➤</button>
            </div>
          </div>
        </section>

        <section className="rc-section" id="how">
          <h2 className="rc-section-title">Dùng đơn giản như thế này</h2>
          <p className="rc-section-sub">3 bước, không cần đăng ký gì cả</p>
          <div className="rc-steps">
            {[
              { num: '1', title: 'Đặt nickname & chọn chủ đề', desc: 'Chọn nickname ẩn danh và chủ đề bạn muốn tâm sự — tình yêu, học tập, gia đình...' },
              { num: '2', title: 'Match với người phù hợp', desc: 'Hệ thống tự tìm người có cùng chủ đề để trò chuyện.' },
              { num: '3', title: 'Chia sẻ, được lắng nghe, cảm thấy nhẹ hơn', desc: 'Khi kết thúc, tin nhắn tự xóa. Không ai biết bạn là ai.' },
            ].map((s, i) => (
              <div key={i} className="rc-step">
                <div className="rc-step-num">{s.num}</div>
                <div className="rc-step-content"><h4>{s.title}</h4><p>{s.desc}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rc-section">
          <h2 className="rc-section-title">Miễn phí để bắt đầu</h2>
          <p className="rc-section-sub">Không cần thẻ ngân hàng, không cần cam kết</p>
          <div className="rc-pricing">
            <div className="rc-plan">
              <div className="rc-plan-name">🌱 Free</div>
              <div className="rc-plan-price"><span className="price">0đ</span><span className="period"> mãi mãi</span></div>
              <ul className="rc-plan-items">
                {['Chat ẩn danh với người dùng','AI chatbot cơ bản','30 tin nhắn AI / giờ','Bảo mật & ẩn danh'].map((item,i) => <li key={i}>{item}</li>)}
              </ul>
              <button className="rc-plan-btn sec" onClick={() => router.push('/onboarding')}>Bắt đầu miễn phí</button>
            </div>
            <div className="rc-plan featured">
              <div className="rc-plan-badge">✨ Phổ biến nhất</div>
              <div className="rc-plan-name">🌸 Premium</div>
              <div className="rc-plan-price"><span className="price">50k</span><span className="period">/tháng</span></div>
              <ul className="rc-plan-items">
                {['Tất cả tính năng Free','AI nâng cao (GPT-4)','100 tin nhắn AI / giờ','Không quảng cáo','Mood tracking'].map((item,i) => <li key={i}>{item}</li>)}
              </ul>
              <button className="rc-plan-btn main">Nâng cấp Premium ↗</button>
            </div>
          </div>
        </section>

        <footer className="rc-footer">
          <div style={{marginBottom:'8px'}}><strong><img src="/logo.png" alt="Relax&Chill" style={{height:'36px', width:'36px', borderRadius:'10px', marginRight:'8px'}} />
          relax&chill</strong> — Không gian an toàn cho Gen Z Việt Nam</div>
          <div>Được xây dựng bởi <strong>Black Diamond Team</strong> · EXE101-Group04 · FPTU Cần Thơ 2026</div>
          <div style={{marginTop:'6px',fontSize:'11px',opacity:0.7}}>HealthTech · Mental Wellness · Anonymous Platform</div>
        </footer>


  
      </div>
    </>
  )
}