'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/config'

interface StatCard {
  icon: string
  label: string
  value: string
  change: string
  up: boolean
}

interface Report {
  id: string
  reporterName: string
  reportedName: string
  reason: string
  roomId: string
  createdAt: string
  status: 'pending' | 'resolved' | 'dismissed'
}

interface RecentUser {
  name: string
  joinedAt: string
  mode: string
}

interface UserModerationStatus {
  name: string
  status: 'normal' | 'warned' | 'banned'
  reason?: string
  adminNote?: string
  warnCount: number
  updatedAt: string
}

type ModerationModal = {
  open: boolean
  action: 'warn' | 'ban' | null
  userName: string
  reason: string
  adminNote: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'reports' | 'users'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatCard[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [userStatuses, setUserStatuses] = useState<Record<string, UserModerationStatus>>({})
  const [modal, setModal] = useState<ModerationModal>({
    open: false, action: null, userName: '', reason: '', adminNote: ''
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, reportsRes, moderationRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/analytics/overview`),
        fetch(`${API_URL}/api/v1/reports`),
        fetch(`${API_URL}/api/v1/moderation/users`),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        const s = data.stats
        setStats([
          { icon: '👥', label: 'Tổng người dùng', value: String(s.totalUsers), change: '+5% tuần này', up: true },
          { icon: '💬', label: 'Phiên chat hôm nay', value: String(s.chatSessionsToday), change: '+3% so với hôm qua', up: true },
          { icon: '🤖', label: 'Tin nhắn AI / ngày', value: String(s.aiMessagesToday), change: '+8% tuần này', up: true },
          { icon: '🚨', label: 'Báo cáo chờ xử lý', value: String(s.pendingReports || 0), change: '', up: false },
        ])
        setRecentUsers(data.recentUsers || [])
      }

      if (reportsRes.ok) {
        const data: Report[] = await reportsRes.json()
        setReports(data)
      }

      if (moderationRes.ok) {
        const data: UserModerationStatus[] = await moderationRes.json()
        const map: Record<string, UserModerationStatus> = {}
        data.forEach(u => { map[u.name] = u })
        setUserStatuses(map)
      }
    } catch (err) {
      console.error('Fetch dashboard data error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      })
      if (res.ok) {
        setReports(r => r.map(x => x.id === id ? { ...x, status: 'resolved' } : x))
        showToast('Đã xử lý báo cáo')
      }
    } catch (err) {
      console.error('Resolve report error:', err)
    }
  }

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      })
      if (res.ok) {
        setReports(r => r.map(x => x.id === id ? { ...x, status: 'dismissed' } : x))
        showToast('Đã bỏ qua báo cáo')
      }
    } catch (err) {
      console.error('Dismiss report error:', err)
    }
  }

  const openModal = (action: 'warn' | 'ban', userName: string) => {
    setModal({ open: true, action, userName, reason: '', adminNote: '' })
  }

  const closeModal = () => {
    setModal({ open: false, action: null, userName: '', reason: '', adminNote: '' })
  }

  const handleModeration = async () => {
    if (!modal.action || !modal.userName || !modal.reason.trim()) return
    setModalLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/moderation/users/${encodeURIComponent(modal.userName)}/${modal.action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: modal.reason, adminNote: modal.adminNote }),
      })
      if (res.ok) {
        const updated: UserModerationStatus = await res.json()
        setUserStatuses(prev => ({ ...prev, [modal.userName]: updated }))
        showToast(
          modal.action === 'warn'
            ? `Đã cảnh cáo ${modal.userName}`
            : `Đã khóa ${modal.userName}`,
          'success'
        )
        closeModal()
      } else {
        showToast('Có lỗi xảy ra, thử lại', 'error')
      }
    } catch (err) {
      console.error('Moderation error:', err)
      showToast('Lỗi kết nối server', 'error')
    } finally {
      setModalLoading(false)
    }
  }

  const handleUnban = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/moderation/users/${encodeURIComponent(name)}/unban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const updated: UserModerationStatus = await res.json()
        setUserStatuses(prev => ({ ...prev, [name]: updated }))
        showToast(`Đã mở khóa ${name}`)
      }
    } catch (err) {
      console.error('Unban error:', err)
    }
  }

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffMins < 1) return 'vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    return `${diffDays} ngày trước`
  }

  const getUserStatusBadge = (name: string) => {
    const s = userStatuses[name]
    if (!s || s.status === 'normal') return <span className="ad-badge normal">Bình thường</span>
    if (s.status === 'warned') return <span className="ad-badge warned" title={`Lý do: ${s.reason} · ${s.warnCount} lần`}>⚠️ Cảnh cáo ({s.warnCount})</span>
    if (s.status === 'banned') return <span className="ad-badge banned" title={`Lý do: ${s.reason}`}>🔴 Đã khóa</span>
    return null
  }

  const getUserActions = (name: string) => {
    const s = userStatuses[name]
    const status = s?.status || 'normal'
    return (
      <div className="ad-action-btns">
        {status !== 'banned' && (
          <button className="ad-action-btn warn" onClick={() => openModal('warn', name)}>⚠️ Cảnh cáo</button>
        )}
        {status !== 'banned' && (
          <button className="ad-action-btn ban" onClick={() => openModal('ban', name)}>🔴 Khóa</button>
        )}
        {status === 'banned' && (
          <button className="ad-action-btn unban" onClick={() => handleUnban(name)}>✅ Mở khóa</button>
        )}
      </div>
    )
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length

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
        .ad-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; cursor: default; }
        .ad-badge.pending { background: rgba(255,190,50,0.12); color: #ffbe32; }
        .ad-badge.resolved { background: rgba(168,213,186,0.12); color: #A8D5BA; }
        .ad-badge.dismissed { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); }
        .ad-badge.normal { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); }
        .ad-badge.warned { background: rgba(255,190,50,0.15); color: #ffbe32; }
        .ad-badge.banned { background: rgba(255,80,80,0.15); color: #ff6060; }
        .ad-action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
        .ad-action-btn { padding: 4px 10px; border-radius: 8px; border: none; font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .ad-action-btn.resolve { background: rgba(168,213,186,0.15); color: #A8D5BA; }
        .ad-action-btn.resolve:hover { background: rgba(168,213,186,0.25); }
        .ad-action-btn.dismiss { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); }
        .ad-action-btn.dismiss:hover { background: rgba(255,255,255,0.1); }
        .ad-action-btn.warn { background: rgba(255,190,50,0.12); color: #ffbe32; }
        .ad-action-btn.warn:hover { background: rgba(255,190,50,0.22); }
        .ad-action-btn.ban { background: rgba(255,80,80,0.12); color: #ff6060; }
        .ad-action-btn.ban:hover { background: rgba(255,80,80,0.22); }
        .ad-action-btn.unban { background: rgba(168,213,186,0.12); color: #A8D5BA; }
        .ad-action-btn.unban:hover { background: rgba(168,213,186,0.22); }
        .ad-tab-row { display: flex; gap: 6px; margin-bottom: 22px; }
        .ad-tab { padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; border: 0.5px solid rgba(124,158,255,0.2); background: transparent; color: rgba(255,255,255,0.4); transition: all 0.15s; }
        .ad-tab.active { background: rgba(124,158,255,0.15); color: white; border-color: rgba(124,158,255,0.4); }
        .ad-tab:hover:not(.active) { background: rgba(124,158,255,0.07); color: rgba(255,255,255,0.7); }
        .ad-pending-count { background: #ffbe32; color: #0f1623; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; margin-left: 4px; }
        .ad-loading { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); }
        /* Modal */
        .ad-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .ad-modal { background: #161e2e; border: 0.5px solid rgba(124,158,255,0.2); border-radius: 20px; padding: 28px; width: 420px; max-width: 90vw; }
        .ad-modal-title { font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .ad-modal-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 20px; }
        .ad-modal-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 6px; letter-spacing: 0.5px; }
        .ad-modal-input { width: 100%; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(124,158,255,0.2); border-radius: 10px; padding: 10px 14px; color: white; font-size: 13px; outline: none; margin-bottom: 14px; font-family: 'DM Sans', sans-serif; }
        .ad-modal-input:focus { border-color: rgba(124,158,255,0.5); }
        .ad-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
        .ad-modal-btn { padding: 9px 20px; border-radius: 10px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .ad-modal-btn.cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); }
        .ad-modal-btn.cancel:hover { background: rgba(255,255,255,0.1); }
        .ad-modal-btn.confirm-warn { background: rgba(255,190,50,0.2); color: #ffbe32; }
        .ad-modal-btn.confirm-warn:hover { background: rgba(255,190,50,0.3); }
        .ad-modal-btn.confirm-ban { background: rgba(255,80,80,0.2); color: #ff6060; }
        .ad-modal-btn.confirm-ban:hover { background: rgba(255,80,80,0.3); }
        .ad-modal-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        /* Toast */
        .ad-toast { position: fixed; bottom: 28px; right: 28px; z-index: 200; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 500; animation: slideUp 0.2s ease; }
        .ad-toast.success { background: rgba(168,213,186,0.15); border: 0.5px solid rgba(168,213,186,0.3); color: #A8D5BA; }
        .ad-toast.error { background: rgba(255,80,80,0.15); border: 0.5px solid rgba(255,80,80,0.3); color: #ff6060; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
          {([
            { id: 'overview', icon: '📊', label: 'Tổng quan' },
            { id: 'reports', icon: '🚨', label: 'Báo cáo' },
            { id: 'users', icon: '👥', label: 'Người dùng' },
          ] as const).map(item => (
            <button
              key={item.id}
              className={`ad-nav-item${tab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              {item.label}
              {item.id === 'reports' && pendingCount > 0 && (
                <span className="ad-pending-count">{pendingCount}</span>
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
              {tab === 'users' && '👥 Quản lý người dùng'}
            </h1>
            <p>Black Diamond Team · EXE101-Group04 · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Tab Bar */}
          <div className="ad-tab-row">
            {([
              { id: 'overview', label: '📊 Tổng quan' },
              { id: 'reports', label: '🚨 Báo cáo' },
              { id: 'users', label: '👥 Người dùng' },
            ] as const).map(t => (
              <button key={t.id} className={`ad-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === 'reports' && pendingCount > 0 && (
                  <span className="ad-pending-count">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {loading && !stats.length ? (
            <div className="ad-loading">⏳ Đang tải dữ liệu...</div>
          ) : (
            <>
              {/* Overview */}
              {tab === 'overview' && (
                <>
                  <div className="ad-stats">
                    {stats.map((s, i) => (
                      <div key={i} className="ad-stat-card">
                        <div className="ad-stat-top">
                          <span className="ad-stat-icon">{s.icon}</span>
                          {s.change && <span className={`ad-stat-badge ${s.up ? 'up' : 'down'}`}>{s.change}</span>}
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
                        <th>ID</th><th>Người báo cáo</th><th>Người bị báo</th><th>Lý do</th><th>Thời gian</th><th>Trạng thái</th><th>Hành động</th>
                      </tr></thead>
                      <tbody>
                        {reports.filter(r => r.status === 'pending').map(r => (
                          <tr key={r.id}>
                            <td style={{color:'rgba(124,158,255,0.7)',fontWeight:600}}>{r.id}</td>
                            <td style={{color:'rgba(255,255,255,0.5)'}}>{r.reporterName}</td>
                            <td style={{color:'#ffbe32',fontWeight:600}}>{r.reportedName}</td>
                            <td>{r.reason}</td>
                            <td style={{color:'rgba(255,255,255,0.35)'}}>{formatTime(r.createdAt)}</td>
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
                          <tr><td colSpan={7} style={{textAlign:'center',color:'rgba(255,255,255,0.2)',padding:'24px'}}>✅ Không có báo cáo nào chờ xử lý</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="ad-card">
                    <div className="ad-card-title">👥 Người dùng mới nhất</div>
                    <table className="ad-table">
                      <thead><tr><th>Nickname</th><th>Tham gia</th><th>Chế độ</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                      <tbody>
                        {recentUsers.map((u, i) => (
                          <tr key={i}>
                            <td style={{fontWeight:500}}>{u.name}</td>
                            <td style={{color:'rgba(255,255,255,0.35)'}}>{formatTime(u.joinedAt)}</td>
                            <td>{u.mode}</td>
                            <td>{getUserStatusBadge(u.name)}</td>
                            <td>{getUserActions(u.name)}</td>
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
                  <div className="ad-card-title">🚨 Tất cả báo cáo ({reports.length})</div>
                  <table className="ad-table">
                    <thead><tr>
                      <th>ID</th><th>Người báo cáo</th><th>Người bị báo</th><th>Lý do</th><th>Thời gian</th><th>Trạng thái</th><th>Hành động</th>
                    </tr></thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r.id}>
                          <td style={{color:'rgba(124,158,255,0.7)',fontWeight:600}}>{r.id}</td>
                          <td style={{color:'rgba(255,255,255,0.5)'}}>{r.reporterName}</td>
                          <td style={{color:'#ffbe32',fontWeight:600}}>{r.reportedName}</td>
                          <td>{r.reason}</td>
                          <td style={{color:'rgba(255,255,255,0.35)'}}>{formatTime(r.createdAt)}</td>
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
                  <div className="ad-card-title">👥 Quản lý người dùng ({recentUsers.length})</div>
                  <table className="ad-table">
                    <thead><tr>
                      <th>Nickname</th><th>Tham gia</th><th>Chế độ</th><th>Trạng thái</th><th>Vi phạm</th><th>Hành động</th>
                    </tr></thead>
                    <tbody>
                      {recentUsers.map((u, i) => {
                        const s = userStatuses[u.name]
                        return (
                          <tr key={i}>
                            <td style={{fontWeight:500}}>{u.name}</td>
                            <td style={{color:'rgba(255,255,255,0.35)'}}>{formatTime(u.joinedAt)}</td>
                            <td>{u.mode}</td>
                            <td>{getUserStatusBadge(u.name)}</td>
                            <td style={{color: s?.warnCount ? '#ffbe32' : 'rgba(255,255,255,0.2)'}}>
                              {s?.warnCount ? `${s.warnCount} lần` : '—'}
                            </td>
                            <td>{getUserActions(u.name)}</td>
                          </tr>
                        )
                      })}
                      {recentUsers.length === 0 && (
                        <tr><td colSpan={6} style={{textAlign:'center',color:'rgba(255,255,255,0.2)',padding:'24px'}}>Chưa có người dùng nào</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal Cảnh cáo / Khóa */}
      {modal.open && (
        <div className="ad-modal-overlay" onClick={closeModal}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-title">
              {modal.action === 'warn' ? '⚠️ Cảnh cáo người dùng' : '🔴 Khóa người dùng'}
            </div>
            <div className="ad-modal-sub">Đối tượng: <strong style={{color:'#ffbe32'}}>{modal.userName}</strong></div>
            <div className="ad-modal-label">LÝ DO *</div>
            <input
              className="ad-modal-input"
              placeholder={modal.action === 'warn' ? 'VD: Ngôn ngữ xúc phạm, quấy rối...' : 'VD: Hành vi toxic liên tục, spam...'}
              value={modal.reason}
              onChange={e => setModal(m => ({ ...m, reason: e.target.value }))}
              autoFocus
            />
            <div className="ad-modal-label">GHI CHÚ ADMIN (không bắt buộc)</div>
            <input
              className="ad-modal-input"
              placeholder="Ghi chú nội bộ..."
              value={modal.adminNote}
              onChange={e => setModal(m => ({ ...m, adminNote: e.target.value }))}
            />
            <div className="ad-modal-actions">
              <button className="ad-modal-btn cancel" onClick={closeModal}>Hủy</button>
              <button
                className={`ad-modal-btn ${modal.action === 'warn' ? 'confirm-warn' : 'confirm-ban'}`}
                onClick={handleModeration}
                disabled={!modal.reason.trim() || modalLoading}
              >
                {modalLoading ? 'Đang xử lý...' : modal.action === 'warn' ? '⚠️ Xác nhận cảnh cáo' : '🔴 Xác nhận khóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`ad-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  )
}
