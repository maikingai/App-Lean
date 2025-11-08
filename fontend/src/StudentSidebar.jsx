import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StudentSidebar() {
  const navigate = useNavigate()

  const cartCount = (() => {
    try {
      const arr = JSON.parse(localStorage.getItem('student_cart_v1') || '[]')
      return Array.isArray(arr) ? arr.length : 0
    } catch { return 0 }
  })()

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  return (
    <aside className="th-sidebar">
      <div className="th-sidebar-top">
        <IconBtn title="Home" onClick={() => navigate('/student')}>🏠</IconBtn>
        <IconBtn title="Calendar" onClick={() => navigate('/student/calendar')}>🗓️</IconBtn>
        <IconBtn title="Quiz" onClick={() => navigate('/student/quiz')}>❓</IconBtn>
        <IconBtn title="To‑Do" onClick={() => navigate('/assign-student')}>📝</IconBtn>
        <IconBtn title="Cart" onClick={() => navigate('/store')}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
            🛒{cartCount > 0 ? (
              <span style={{
                fontSize:12, fontWeight:800, padding:'0 6px',
                borderRadius:999, background:'#efefef', lineHeight:'18px'
              }}>{cartCount}</span>
            ) : null}
          </span>
        </IconBtn>
      </div>
      <div className="th-sidebar-bottom">
        <IconBtn title="Settings" onClick={() => navigate('/settings')}>⚙️</IconBtn>
      </div>
    </aside>
  )
}
