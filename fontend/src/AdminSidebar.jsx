import { useNavigate } from 'react-router-dom'

export default function AdminSidebar() {
  const navigate = useNavigate()

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  return (
    <aside className="th-sidebar">
      <div className="th-sidebar-top">
        <IconBtn title="Dashboard" onClick={() => navigate('/admin')}>🏠</IconBtn>
        <IconBtn title="Users" onClick={() => navigate('/admin/users')}>👥</IconBtn>
        <IconBtn title="Classes" onClick={() => navigate('/admin/classes')}>🏫</IconBtn>
        <IconBtn title="Announcements" onClick={() => navigate('/admin/announcements')}>📢</IconBtn>
      </div>
      <div className="th-sidebar-bottom">
        <IconBtn title="Settings" onClick={() => navigate('/settings')}>⚙️</IconBtn>
      </div>
    </aside>
  )
}
