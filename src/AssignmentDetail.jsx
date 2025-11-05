
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './teacher-home.css'

export default function AssignmentDetail() {
  const navigate = useNavigate()

  const [showProfile, setShowProfile] = useState(false)
  const handleLogout = () => {
    localStorage.removeItem('role')
    setShowProfile(false)
    navigate('/login')
  }

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  return (
    <div className="th-root">
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => navigate('/teacher')} />
          <IconBtn title="Calendar" onClick={() => console.log('calendar')} />
          <IconBtn title="Library" onClick={() => console.log('library')} />
          <IconBtn title="Add" onClick={() => console.log('add')}>
            <span className="th-plus">＋</span>
          </IconBtn>
          <IconBtn title="Cart" onClick={() => console.log('shop')} />
        </div>
        <div className="th-sidebar-bottom">
          <IconBtn title="Settings" onClick={() => console.log('settings')} />
        </div>
      </aside>

      <main className="th-main th-main-rel">
    
        <div className="th-topbar" style={{ justifyContent: 'flex-end' }}>
          <button className="th-avatar" title="profile" onClick={() => setShowProfile(v => !v)}>
            🙂
          </button>
        </div>

        {showProfile && (
          <>
            <div className="th-profile-backdrop" onClick={() => setShowProfile(false)} />
            <div className="th-profile-pop">
              <div className="th-profile-title">Profile</div>
              <div className="th-profile-row">Role: Teacher</div>
              <button className="th-btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 18, margin: '6px 0 12px' }}>
          {[
            ['classroom', 'Classroom'],
            ['assignments', 'Assignments'],
            ['members', 'Members'],
            ['grades', 'Grades'],
            ['dashboard', 'Dashboard'],
          ].map(([key, label], i) => (
            <button
              key={key}
              style={{
                background: 'transparent',
                border: 0,
                padding: '8px 4px',
                fontWeight: 600,
                color: i === 0 ? '#1f2937' : '#2c3e50',
                borderBottom: `3px solid ${i === 0 ? '#ffffff' : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ===== หัว Assignment ===== */}
        <section className="th-card" style={{ padding: 16, borderRadius: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: 12 }}>
            {/* ด้านซ้าย: ชื่อ + ผู้สั่ง + คะแนน */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: '#E9F0FF',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 16,
                  }}
                >
                  📄
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Matrix</div>
                  <div style={{ fontSize: 12, color: '#6b7c93' }}>
                    Thanchanok Konsuag · 3 Oct. 2025, 23:59
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7c93', marginTop: 4 }}>10 points</div>
                </div>
              </div>

              {/* เส้นคั่น */}
              <div style={{ height: 1, background: 'rgba(0,0,0,.08)', margin: '12px 0' }} />

              {/* ไฟล์แนบ 2 กล่อง */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {/* PDF */}
                <div
                  className="th-card"
                  style={{
                    width: 220,
                    padding: 12,
                    borderRadius: 14,
                    boxShadow: 'none',
                    background: '#f8fbff',
                  }}
                >
                  <div
                    style={{
                      height: 64,
                      borderRadius: 12,
                      background: '#ffffff',
                      display: 'grid',
                      alignContent: 'center',
                      padding: '6px 10px',
                      gap: 2,
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#111827' }}>Matrix.pdf</div>
                    <div style={{ fontSize: 11, color: '#7A8BA6' }}>PDF</div>
                  </div>
                </div>

                {/* Video */}
                <div
                  className="th-card"
                  style={{
                    width: 220,
                    padding: 12,
                    borderRadius: 14,
                    boxShadow: 'none',
                    background: '#f8fbff',
                  }}
                >
                  <div
                    style={{
                      height: 64,
                      borderRadius: 12,
                      background: '#ffffff',
                      display: 'grid',
                      alignContent: 'center',
                      padding: '6px 10px',
                      gap: 2,
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#111827' }}>Matrix.mp4</div>
                    <div style={{ fontSize: 11, color: '#7A8BA6' }}>Video</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginTop: 16, color: '#6b7c93', fontSize: 14 }}>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Description</span>
                <span> ................................</span>
              </div>
            </div>

            {/* ด้านขวา: due & เมนู */}
            <div style={{ textAlign: 'right' }}>
              <button title="more" style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer' }}>
                ⋯
              </button>
              <div style={{ fontSize: 12, color: '#6b7c93', marginTop: 14 }}>
                <strong>Due</strong> 10 Oct. 2025, 23:59
              </div>
            </div>
          </div>
        </section>

        {/* ===== Comments ===== */}
        <section className="th-card" style={{ marginTop: 16, padding: 16, borderRadius: 16 }}>
          <div style={{ color: '#0f172a', fontWeight: 600, marginBottom: 10 }}>Class comments</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 28px',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 16,
                background: '#A3E887',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              🙂
            </div>
            <input className="th-input" placeholder="Write a comment..." />
            <button title="send" style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>
              ➤
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
