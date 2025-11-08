import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TeacherSidebar() {
  const navigate = useNavigate()

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  return (
    <aside className="th-sidebar">
      <div className="th-sidebar-top">
        <IconBtn title="Home" onClick={() => navigate('/teacher')}>🏠</IconBtn>
        <IconBtn title="Calendar" onClick={() => navigate('/calendar')}>🗓️</IconBtn>
        <IconBtn title="Quiz" onClick={() => navigate('/quiz')}>❓</IconBtn>
        <IconBtn title="Assignment Review" onClick={() => navigate('/assignments/review')}>📝</IconBtn>
      </div>
      <div className="th-sidebar-bottom">
        <IconBtn title="Settings" onClick={() => navigate('/settings')}>⚙️</IconBtn>
      </div>
    </aside>
  )
}
