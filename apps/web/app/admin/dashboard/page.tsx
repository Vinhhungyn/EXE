'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATS = [
  { icon: '👥', label: 'Tổng người dùng', value: '1,284', change: '+12% tuần này', up: true },
  { icon: '💬', label: 'Phiên chat hôm nay', value: '342', change: '+8% so với hôm qua', up: true },
  { icon: '🤖', label: 'Tin nhắn AI / ngày', value: '9,471', change: '+23% tuần này', up: true },
  { icon: '🚨', label: 'Báo cáo chờ xử lý', value: '7', change: '-3 so với hôm qua', up: false },
]

const REPORTS = [
  { id: '#R-081', user: 'Mây#4821', reason: 'Ngôn từ không phù hợp', time: '10 phút trước', status: 'pending' },
  { id: '#R-080', user: 'Gió#2930', reason: 'Spam tin nhắn', time: '32 phút trước', status: 'pending' },
  { id: '#R-079', user: 'Sao#1102', reason: 'Quấy rối người dùng', time: '1 giờ trước', status: 'resolved' },
  { id: '#R-078', user: 'Nắng#7741', reason: 'Nội dung nhạy cảm', time: '2 giờ trước', status: 'resolved' },
  { id: '#R-077', user: 'Mưa#5512', reason: 'Tài khoản giả mạo', time: '3 giờ trước', status: 'dismissed' },
]

const RECENT_USERS = [
  { name: 'Mây#4821', joined: '5 phút trước', mode: 'AI Chat', premium: false },
  { name: 'Sao#3301', joined: '12 phút trước', mode: 'Người dùng', premium: true },
  { name: 'Gió#9921', joined: '18 phút trước', mode: 'AI Chat', premium: false },
  { name: 'Nắng#0044', joined: '25 phút trước', mode: 'Người dùng', premium: true },
  { name: 'Mưa#6612', joined: '31 phút trước', mode: 'AI Chat', premium: false },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'reports' | 'users'>('overview')
  const [reports, setReports] = useState(REPORTS)

  const handleResolve = (id: string) => {
    setReports(r => r.map(x => x.id === id ? { ...x, status: 'resolved' } : x))
  }
  const handleDismiss = (id: string) => {
    setReports(r => r.map(x => x.id === id ? { ...x, status: 'dismissed' } : x))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1623; }
        .ad-root { min-height: 100vh; background: #0f1623; font-family: 'DM Sans', sans-serif; color: white; display: flex; }
        .ad-sidebar { width: 220px; min-height: 100vh; background: rgba(255,255,255,0.03); border-right: 0.5px solid rgba(124,158,255,0.12); padding: 24px 16px; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
        .ad-sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 8px 12px; margin-bottom: 20px; }
        .ad-sidebar-icon { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #7C9EFF, #A8D5BA); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .ad-sidebar-name { font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 700; color: white; }
        .ad-sidebar-role { font-size: 10px; color: rgba(124,158,255,0.7); letter-spacing: 1px; text-transform: uppercase; }
        .ad-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; font-size: 13.5px; cursor: pointer; transition: all 0.15s; color: rgba(255,255,255,0.5); border: none; background: transparent; width: 100%; text-align: left; }
        .ad-nav-item:hover { background: rgba(124,158,255,0.08); color: rgba(255,255,255,0.85); }
        .ad-nav-item.active { background: rgba(124,158,255,0.15); color: white; font-weight: 600; }
        .ad-nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .ad-sidebar-bottom { margin-top: auto; }
        .ad-logout { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; font-size: 13px; cursor: pointer; color: rgba(255,100,100,0.6); border: none; background: transparent; width: 100%; transition: all 0.15s; }
        .ad-logout:hover { background: rgba(255,100,100,0.08); color: rgba(255,100,100,0.9); }
        .ad-main { flex: 1; padding: 28px 32px; overflow-y: auto; }
        .ad-header { margin-bottom: 28px; }
        .ad-header h1 { font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 700; color: white; }
        .ad-header p { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .ad-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .ad-stat-card { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(124,158,255,0.15); border-radius: 16px; padding: 18px 20px; }
        .ad-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .ad-stat-icon { font-size: 20px; }
        .ad-stat-badge { font-size: 10px; padding: 3px 8px; border-radius: 20px; font-weight: 500; }
        .ad-stat-badge.up { background: rgba(168,213,186,0.15); color: #A8D5BA; }
        .ad-stat-badge.down { background: rgba(255,100,100,0.12); color: #ff8080; }
        .ad-stat-val { font-family: 'Nunito', sans-serif; font-size: 28px; font-weight: 700; color: white; }
        .ad-stat-lbl { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; }
        .ad-card { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(124,158,255,0.15); border-radius: 18px; padding: 22px 24px; margin-bottom: 20px; }
        .ad-card-title { font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 700; color: white; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
        .ad-table { width: 100%; border-collapse: collapse; }
        .ad-table th { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.8px; padding: 0 12px 12px; text-align: left; font-weight: 500; }
        .ad-table td { padding: 12px; border-top: 0.5px solid rgba(255,255,255,0.05); font-size: 13px; color: rgba(255,255,255,0.75); }
        .ad-table tr:hover td { background: rgba(124,158,255,0.04); }
        .ad-badge { display: inline-flex; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .ad-badge.pending { background: rgba(255,190,50,0.12); color: #ffbe32; }
        .ad-badge.resolved { background: rgba(168,213,186,0.12); color: #A8D5BA; }
        .ad-badge.dismissed { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); }
        .ad-badge.premium { background: rgba(255,190,50,0.12); color: #ffbe32; }
        .ad-badge.free { background: rgba(124,158,255,0.1); color: rgba(124,158,255,0.8); }
        .ad-action-btns { display: flex; gap: 6px; }
        .ad-action-btn { padding: 4px 10px; border-radius: 8px; border: none; font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .ad-action-btn.resolve { background: rgba(168,213,186,0.15); color: #A8D5BA; }
        .ad-action-btn.resolve:hover { background: rgba(168,213,186,0.25); }
        .ad-action-btn.dismiss { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); }
        .ad-action-btn.dismiss:hover { background: rgba(255,255,255,0.1); }
        .ad-tab-row { display: flex; gap: 6px; margin-bottom: 22px; }
        .ad-tab { padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; border: 0.5px solid rgba(124,158,255,0.2); background: transparent; color: rgba(255,255,255,0.4); transition: all 0.15s; }
        .ad-tab.active { background: rgba(124,158,255,0.15); color: white; border-color: rgba(124,158,255,0.4); }
        .ad-tab:hover:not(.active) { background: rgba(124,158,255,0.07); color: rgba(255,255,255,0.7); }
        .ad-pending-count { background: #ffbe32; color: #0f1623; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; margin-left: 4px; }
      `}</style>
      <div className="ad-root">
        {/* Sidebar */}
        <aside className="ad-sidebar">
          <div className="ad-sidebar-logo">
            <div className="ad-sidebar-icon">🛡️</div>
            <div>
              <div className="ad-sidebar-name">relax&chill</div>
              <div className="ad-sidebar-role">Admin</div>
            </div>
          </div>
          {[
            { id: 'overview', icon: '📊', label: 'Tổng quan' },
            { id: 'reports', icon: '🚨', label: 'Báo cáo' },
            { id: 'users', icon: '👥', label: 'Người dùng' },
          ].map(item => (
            <button
              key={item.id}
              className={`ad-nav-item${tab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id as any)}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              {item.label}
              {item.id === 'reports' && reports.filter(r => r.status === 'pending').length > 0 && (
                <span className="ad-pending-count">{reports.filter(r => r.status === 'pending').length}</span>
              )}
            </button>
          ))}
          <div className="ad-sidebar-bottom">
            <button className="ad-logout" onClick={() => router.push('/admin')}>
              <span>🚪</span> Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="ad-main">
          <div className="ad-header">
            <h1>
              {tab === 'overview' && '📊 Tổng quan hệ thống'}
              {tab === 'reports' && '🚨 Quản lý báo cáo'}
              {tab === 'users' && '👥 Người dùng gần đây'}
            </h1>
            <p>Black Diamond Team · EXE101-Group04 · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Tab Bar */}
          <div className="ad-tab-row">
            {[
              { id: 'overview', label: '📊 Tổng quan' },
              { id: 'reports', label: '🚨 Báo cáo' },
              { id: 'users', label: '👥 Người dùng' },
            ].map(t => (
              <button key={t.id} className={`ad-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id as any)}>
                {t.label}
                {t.id === 'reports' && reports.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ad-pending-count">{reports.filter(r => r.status === 'pending').length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <>
              <div className="ad-stats">
                {STATS.map((s, i) => (
                  <div key={i} className="ad-stat-card">
                    <div className="ad-stat-top">
                      <span className="ad-stat-icon">{s.icon}</span>
                      <span className={`ad-stat-badge ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                    </div>
                    <div className="ad-stat-val">{s.value}</div>
                    <div className="ad-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="ad-card">
                <div className="ad-card-title">🚨 Báo cáo chờ xử lý</div>
                <table className="ad-table">
                  <thead><tr>
                    <th>ID</th><th>Người dùng</th><th>Lý do</th><th>Thời gian</th><th>Trạng thái</th><th>Hành động</th>
                  </tr></thead>
                  <tbody>
                    {reports.filter(r => r.status === 'pending').map(r => (
                      <tr key={r.id}>
                        <td style={{color:'rgba(124,158,255,0.7)',fontWeight:600}}>{r.id}</td>
                        <td>{r.user}</td>
                        <td>{r.reason}</td>
                        <td style={{color:'rgba(255,255,255,0.35)'}}>{r.time}</td>
                        <td><span className="ad-badge pending">Chờ xử lý</span></td>
                        <td>
                          <div className="ad-action-btns">
                            <button className="ad-action-btn resolve" onClick={() => handleResolve(r.id)}>✓ Xử lý</button>
                            <button className="ad-action-btn dismiss" onClick={() => handleDismiss(r.id)}>✕ Bỏ qua</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reports.filter(r => r.status === 'pending').length === 0 && (
                      <tr><td colSpan={6} style={{textAlign:'center',color:'rgba(255,255,255,0.2)',padding:'24px'}}>✅ Không có báo cáo nào chờ xử lý</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="ad-card">
                <div className="ad-card-title">👥 Người dùng mới nhất</div>
                <table className="ad-table">
                  <thead><tr><th>Nickname</th><th>Tham gia</th><th>Chế độ</th><th>Gói</th></tr></thead>
                  <tbody>
                    {RECENT_USERS.map((u, i) => (
                      <tr key={i}>
                        <td style={{fontWeight:500}}>{u.name}</td>
                        <td style={{color:'rgba(255,255,255,0.35)'}}>{u.joined}</td>
                        <td>{u.mode}</td>
                        <td><span className={`ad-badge ${u.premium ? 'premium' : 'free'}`}>{u.premium ? '🌸 Premium' : '🌱 Free'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Reports Tab */}
          {tab === 'reports' && (
            <div className="ad-card">
              <div className="ad-card-title">🚨 Tất cả báo cáo</div>
              <table className="ad-table">
                <thead><tr>
                  <th>ID</th><th>Người dùng</th><th>Lý do</th><th>Thời gian</th><th>Trạng thái</th><th>Hành động</th>
                </tr></thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id}>
                      <td style={{color:'rgba(124,158,255,0.7)',fontWeight:600}}>{r.id}</td>
                      <td>{r.user}</td>
                      <td>{r.reason}</td>
                      <td style={{color:'rgba(255,255,255,0.35)'}}>{r.time}</td>
                      <td>
                        <span className={`ad-badge ${r.status}`}>
                          {r.status === 'pending' ? 'Chờ xử lý' : r.status === 'resolved' ? 'Đã xử lý' : 'Đã bỏ qua'}
                        </span>
                      </td>
                      <td>
                        {r.status === 'pending' && (
                          <div className="ad-action-btns">
                            <button className="ad-action-btn resolve" onClick={() => handleResolve(r.id)}>✓ Xử lý</button>
                            <button className="ad-action-btn dismiss" onClick={() => handleDismiss(r.id)}>✕ Bỏ qua</button>
                          </div>
                        )}
                        {r.status !== 'pending' && <span style={{fontSize:'12px',color:'rgba(255,255,255,0.2)'}}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="ad-card">
              <div className="ad-card-title">👥 Người dùng gần đây</div>
              <table className="ad-table">
                <thead><tr><th>Nickname</th><th>Tham gia</th><th>Chế độ</th><th>Gói</th></tr></thead>
                <tbody>
                  {RECENT_USERS.map((u, i) => (
                    <tr key={i}>
                      <td style={{fontWeight:500}}>{u.name}</td>
                      <td style={{color:'rgba(255,255,255,0.35)'}}>{u.joined}</td>
                      <td>{u.mode}</td>
                      <td><span className={`ad-badge ${u.premium ? 'premium' : 'free'}`}>{u.premium ? '🌸 Premium' : '🌱 Free'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
