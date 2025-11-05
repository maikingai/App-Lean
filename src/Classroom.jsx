import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './teacher-home.css'

export default function Classroom() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('classroom')

  const [showProfile, setShowProfile] = useState(false)
  const handleLogout = () => {
    localStorage.removeItem('role')
    setShowProfile(false)
    navigate('/login')
  }

  const [showMeet, setShowMeet] = useState(false)
  const [meetForm, setMeetForm] = useState({ topic: '', time: '' })
  const handleCreateMeet = (e) => {
    e?.preventDefault?.()
    const topic = meetForm.topic.trim() || 'Class Meet'
    const time  = meetForm.time.trim()  || 'Now'
    console.log('Create Meet:', { topic, time })
    setShowMeet(false)
    setMeetForm({ topic: '', time: '' })
  }

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  const copyCode = () => {
    navigator.clipboard?.writeText('KinkHaw88')
    alert('Copied: KinkHaw88')
  }

  const Post = ({ title, date, onClick }) => (
    <div
      className="th-card"
      onClick={onClick}
      style={{
        width: '97%',
        display: 'grid',
        gridTemplateColumns: '40px 1fr',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 14,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E9F0FF', display: 'grid', placeItems: 'center' }}>📘</div>
      <div>
        <div style={{ fontSize: 14, color: '#111827' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#7A8BA6', marginTop: 2 }}>{date}</div>
      </div>
    </div>
  )

  return (
    <div className="th-root">
      
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => navigate('/teacher')} />
          <IconBtn title="Calendar" onClick={() => console.log('calendar')} />
          <IconBtn title="Library" onClick={() => console.log('library')} />
          <IconBtn title="Add" onClick={() => console.log('add')}><span className="th-plus">＋</span></IconBtn>
        </div>
        <div className="th-sidebar-bottom">
          <IconBtn title="Settings" onClick={() => console.log('settings')} />
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
     
        <div className="th-topbar">
          <button
            className="th-avatar"
            title="profile"
            onClick={() => setShowProfile(v => !v)}
          >
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 18, margin: '6px 0 12px' }}>
          {[
            ['classroom', 'Classroom'],
            ['assignments', 'Assignments'],
            ['members', 'Members'],
            ['grades', 'Grades'],
            ['dashboard', 'Dashboard'],
          ].map(([key, label]) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  background: 'transparent',
                  border: 0,
                  padding: '8px 4px',
                  fontWeight: 600,
                  color: active ? '#1f2937' : '#2c3e50',
                  borderBottom: `3px solid ${active ? '#ffffff' : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Purple header — ยาวพอ ๆ กับการ์ดโพสต์ */}
        <section
          className="th-card"
          style={{
            width: '97%',
            background: '#B58CFF',
            color: '#fff',
            borderRadius: 14,
            padding: 22,
            height: 140,
            position: 'relative',
            boxShadow: 'none',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700 }}>Math</div>
          <div style={{ opacity: 0.9, marginTop: 6 }}>M4/1</div>
          <button
            title="edit"
            style={{
              position: 'absolute',
              right: 14,
              top: 14,
              width: 32,
              height: 32,
              display: 'grid',
              placeItems: 'center',
              background: '#cda8ff',
              border: 0,
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            ✏️
          </button>
        </section>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 18, alignItems: 'start', marginTop: 14 }}>
          {/* Left column */}
          <aside style={{ display: 'grid', gap: 14 }}>
            {/* Meet */}
            <div className="th-card" style={{ padding: 14, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E9F0FF', display: 'grid', placeItems: 'center' }}>🎥</div>
                  <div style={{ fontWeight: 600 }}>Meet</div>
                </div>
                <button
                  className="th-btn-save"
                  style={{ padding: '6px 12px' }}
                  onClick={() => setShowMeet(true)}
                >
                  create meet
                </button>
              </div>
            </div>

            {/* Class code */}
            <div className="th-card" style={{ padding: 14, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#7A8BA6', marginBottom: 8 }}>
                <span>Class code</span>
                <button onClick={copyCode} title="Copy" style={{ background: 'transparent', border: 0, fontSize: 18, cursor: 'pointer' }}>
                  📋
                </button>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>KinkHaw88</div>
            </div>
          </aside>

          {/* Right column */}
          <section style={{ display: 'grid', gap: 12 }}>
            {/* Post box */}
            <div
              className="th-card"
              style={{
                width: '97%',
                display: 'grid',
                gridTemplateColumns: '34px 1fr',
                alignItems: 'center',
                gap: 12,
                padding: '8px 10px',
                borderRadius: 14
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 16, background: '#A3E887', display: 'grid', placeItems: 'center' }}>🙂</div>
              <input
                className="th-input"
                placeholder="Thanchanok , post something to your class..."
                style={{ height: 36 }}
              />
            </div>

            {/* Post */}
            <Post
              title="Thanchanok Konsuag : New Assignment - Matrix"
              date="3 Oct."
              onClick={() => navigate('/assignment/42')}
            />
            <Post
              title="Thanchanok Konsuag : New Quiz - Matrix"
              date="26 Sep."
              onClick={() => navigate('/quiz/7')}
            />
            <Post
              title="Thanchanok Konsuag : Meeting Recording - 26 Sep 2025"
              date="26 Sep."
              onClick={() => navigate('/meeting/1')}   // ลิ้งไปหน้า Meeting
            />
            <Post
              title="Thanchanok Konsuag : New Material - Matrix"
              date="26 Sep."
              onClick={() => navigate('/material/3')}
            />
          </section>
        </div>
      </main>

      {/* ===== Create Meet ===== */}
      {showMeet && (
        <div className="th-modal-backdrop" onClick={() => setShowMeet(false)}>
          <form className="th-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreateMeet}>
            <div className="th-modal-title">Create Meet</div>
            <div className="th-modal-body">
              <input
                className="th-input"
                type="text"
                placeholder="Topic"
                value={meetForm.topic}
                onChange={(e)=>setMeetForm(v=>({...v, topic:e.target.value}))}
              />
              <input
                className="th-input"
                type="text"
                placeholder="Time (e.g. 2025-11-04 10:30)"
                value={meetForm.time}
                onChange={(e)=>setMeetForm(v=>({...v, time:e.target.value}))}
              />
            </div>
            <div className="th-modal-actions">
              <button type="button" className="th-btn-cancel" onClick={()=>setShowMeet(false)}>cancel</button>
              <button type="submit" className="th-btn-save">create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
