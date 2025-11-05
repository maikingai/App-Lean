import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './teacher-home.css'

export default function PostMeeting() {
  const navigate = useNavigate()
  const { id } = useParams() 

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
        </div>
        <div className="th-sidebar-bottom">
          <IconBtn title="Settings" onClick={() => console.log('settings')} />
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        <div className="th-topbar">
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
              <button className="th-btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 18, margin: '6px 0 12px' }}>
          {['Classroom','Assignments','Members','Grades','Dashboard'].map((label, i) => (
            <button
              key={label}
              onClick={() => (i === 0 ? navigate('/classroom') : null)}
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

        <section
          className="th-card"
          style={{ width: '97%', background: 'transparent', boxShadow: 'none', padding: 0 }}
        >
          <div
            className="th-card"
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '40px 1fr auto',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 14
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: 14,
                display: 'grid', placeItems: 'center', background: '#E9F0FF'
              }}
            >
              🎥
            </div>

            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
                Meeting Recording  -  26 Sep. 2025 {id ? `(ID: ${id})` : ''}
              </div>
              <div style={{ fontSize: 12, color: '#7A8BA6', marginTop: 2 }}>
                Thanchanok Konsuag  ·  26 Sep. 2025, 12:00
              </div>
            </div>

            {/* ปุ่มจุดสามจุด (แค่ UI) */}
            <button
              title="more"
              style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer' }}
              onClick={() => console.log('more')}
            >
              ⋯
            </button>
          </div>

          {/* แถวขวา: Joined / Absent */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'flex-end' }}>
            <div
              className="th-card"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 12, width: 280
              }}
            >
              <span>Joined</span>
              <span>2 ▾</span>
            </div>
            <div
              className="th-card"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 12, width: 280
              }}
            >
              <span>Absent</span>
              <span>0 ▾</span>
            </div>
          </div>

          {/* เส้นคั่น */}
          <div style={{ height: 1, background: 'rgba(0,0,0,.08)', margin: '14px 0' }} />

          {/* การ์ดไฟล์วิดีโอ */}
          <div style={{ paddingLeft: 70 }}>
            <div
              className="th-card"
              style={{
                width: 170, padding: 12, borderRadius: 16,
                display: 'grid', gap: 6, textAlign: 'left'
              }}
            >
              <div
                style={{
                  height: 86, borderRadius: 14, background: '#eef4ff',
                  display: 'grid', placeItems: 'center', color: '#7A8BA6'
                }}
              >
                Matrix.mp4
              </div>
              <div style={{ fontSize: 12, color: '#7A8BA6' }}>Video</div>
            </div>
          </div>

          {/* Class comments */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 14, color: '#0f172a', marginBottom: 8, paddingLeft: 70 }}>
              Class comments
            </div>
            <div
              className="th-card"
              style={{
                width: '97%',
                display: 'grid',
                gridTemplateColumns: '34px 1fr 34px',
                alignItems: 'center',
                gap: 12,
                padding: '8px 10px',
                borderRadius: 14
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: 16,
                  background: '#A3E887', display: 'grid', placeItems: 'center'
                }}
              >
                🙂
              </div>
              <input className="th-input" placeholder="Write a comment..." style={{ height: 36 }} />
              <button title="send" style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer' }}>
                ➤
              </button>
            </div>
          </div>
        </section>

        {/* ปุ่มย้อนกลับ */}
        <div style={{ marginTop: 18 }}>
          <button
            className="th-btn-cancel"
            onClick={() => navigate('/classroom')}
            style={{ padding: '10px 16px', borderRadius: 12 }}
          >
            Back to Classroom
          </button>
        </div>
      </main>
    </div>
  )
}
