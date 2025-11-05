// src/TeacherHome.jsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './teacher-home.css'

export default function TeacherHome() {
  const navigate = useNavigate()

  const C = useMemo(() => ({
    ring: '0 0 0 3px rgba(15,176,160,.22)',
  }), [])

  // ====== STATE ======
  const [classes, setClasses] = useState([
    { id: 1, name: 'Math', section: 'M4/1' },
    { id: 2, name: 'Math', section: 'M4/2' },
    { id: 3, name: 'Math', section: 'M4/3' },
    { id: 4, name: 'Math', section: 'M4/4' },
  ])
  const [modal, setModal] = useState({ open: false, id: null, name: '', section: '' })

  // โปรไฟล์ / logout
  const [showProfile, setShowProfile] = useState(false)
  const handleLogout = () => {
    localStorage.removeItem('role')
    setShowProfile(false)
    navigate('/login')
  }

  // เมนู Add + โมดัล Create/Join
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showCreate, setShowCreate]   = useState(false)
  const [showJoin, setShowJoin]       = useState(false)
  const [createForm, setCreateForm]   = useState({ name: '', room: '' })
  const [joinCode, setJoinCode]       = useState('')

  // ====== ACTIONS ======
  const openEdit  = (item) => setModal({ open: true, id: item.id, name: item.name, section: item.section })
  const closeEdit = () => setModal({ open: false, id: null, name: '', section: '' })
  const saveEdit  = () => {
    setClasses(prev => prev.map(c => (c.id === modal.id ? { ...c, name: modal.name.trim(), section: modal.section.trim() } : c)))
    closeEdit()
  }
  const deleteClass = (id) => setClasses(prev => prev.filter(c => c.id !== id))

  // คลิกการ์ด → ไปหน้า classroom ตรง ๆ
  const goClass = () => navigate('/classroom')

  // Create class → เพิ่มการ์ดใหม่ (ไม่ย้ายหน้า)
  const handleCreate = (e) => {
    e?.preventDefault?.()
    const nextId = classes.length ? Math.max(...classes.map(c => c.id)) + 1 : 1
    const name = createForm.name.trim() || 'New Class'
    const room = createForm.room.trim() || `Room ${nextId}`
    setClasses(prev => [...prev, { id: nextId, name, section: room }])
    setShowCreate(false)
    setCreateForm({ name: '', room: '' })
    setShowAddMenu(false)
  }

  // Join class → พาไปหน้า classroom
  const handleJoin = (e) => {
    e?.preventDefault?.()
    setShowJoin(false)
    setJoinCode('')
    setShowAddMenu(false)
    navigate('/classroom')
  }

  // ปุ่มไอคอน
  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  return (
    <div className="th-root th-root-rel">
      {/* ===== Sidebar ===== */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => console.log('home')} />
          <IconBtn title="Calendar" onClick={() => console.log('calendar')} />
          <IconBtn title="Library" onClick={() => console.log('library')} />

          {/* ปุ่ม + → เมนู Create/Join */}
          <div className="th-add-wrap">
            <IconBtn title="Add" onClick={() => setShowAddMenu(v => !v)}>
              <span className="th-plus">＋</span>
            </IconBtn>

            {showAddMenu && (
              <>
                <div className="th-add-pop" role="menu">
                  <button
                    className="th-add-item"
                    onClick={() => { setShowCreate(true) }}
                  >
                    Create class
                  </button>
                  <button
                    className="th-add-item"
                    onClick={() => { setShowJoin(true) }}
                  >
                    Join class
                  </button>
                </div>
                <div className="th-add-backdrop" onClick={() => setShowAddMenu(false)} />
              </>
            )}
          </div>
        </div>

        <div className="th-sidebar-bottom">
          <IconBtn title="Settings" onClick={() => console.log('settings')} />
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        {/* top-right: avatar */}
        <div className="th-topbar">
          <button className="th-avatar" title="profile" onClick={() => setShowProfile(v => !v)}>🙂</button>
        </div>

        {/* Profile popover */}
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

        {/* Cards */}
        <div className="th-card-grid">
          {classes.map(item => (
            <div key={item.id} className="th-card">
              <div className="th-card-head">{item.name}</div>
              <div
                className="th-card-body"
                role="button"
                onClick={goClass}
                title="เข้าเรียน"
              >
                {/* คลิกการ์ดแล้วไป classroom */}
                <span className="th-section">{item.section}</span>
              </div>
              <div className="th-card-foot">
                <div className="th-card-actions">
                  <IconBtn title="report"   onClick={() => console.log('report', item.id)} />
                  <IconBtn title="analytics" onClick={() => console.log('analytics', item.id)} />
                  <IconBtn title="edit"      onClick={() => openEdit(item)}><span className="th-more">⋮</span></IconBtn>
                </div>
                <button className="th-delete" title="Delete class" onClick={() => deleteClass(item.id)}>ⓧ</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ===== Modal: Edit Card ===== */}
      {modal.open && (
        <div className="th-modal-backdrop" onClick={closeEdit}>
          <div className="th-modal" onClick={(e) => e.stopPropagation()}>
            <div className="th-modal-title">Edit Class</div>
            <div className="th-modal-body">
              <input
                className="th-input"
                type="text"
                value={modal.name}
                onChange={(e) => setModal(v => ({ ...v, name: e.target.value }))}
                placeholder="Class name"
                onFocus={(e) => (e.target.style.boxShadow = C.ring)}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
              <input
                className="th-input"
                type="text"
                value={modal.section}
                onChange={(e) => setModal(v => ({ ...v, section: e.target.value }))}
                placeholder="Section"
                onFocus={(e) => (e.target.style.boxShadow = C.ring)}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            </div>
            <div className="th-modal-actions">
              <button className="th-btn-cancel" onClick={closeEdit}>cancel</button>
              <button className="th-btn-save" onClick={saveEdit}>save</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Modal: Create Class ===== */}
      {showCreate && (
        <div className="th-modal-backdrop" onClick={() => setShowCreate(false)}>
          <form className="th-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <div className="th-modal-title">Create Class</div>
            <div className="th-modal-body">
              <input
                className="th-input"
                type="text"
                placeholder="Class name"
                value={createForm.name}
                onChange={(e)=>setCreateForm(v=>({...v, name:e.target.value}))}
                onFocus={(e)=>(e.target.style.boxShadow=C.ring)}
                onBlur={(e)=>(e.target.style.boxShadow='none')}
              />
              <input
                className="th-input"
                type="text"
                placeholder="Room"
                value={createForm.room}
                onChange={(e)=>setCreateForm(v=>({...v, room:e.target.value}))}
                onFocus={(e)=>(e.target.style.boxShadow=C.ring)}
                onBlur={(e)=>(e.target.style.boxShadow='none')}
              />
            </div>
            <div className="th-modal-actions">
              <button type="button" className="th-btn-cancel" onClick={()=>setShowCreate(false)}>cancel</button>
              <button type="submit" className="th-btn-save">create</button>
            </div>
          </form>
        </div>
      )}

      {/* ===== Join Class ===== */}
      {showJoin && (
        <div className="th-modal-backdrop" onClick={() => setShowJoin(false)}>
          <form className="th-modal th-modal-sm" onClick={(e) => e.stopPropagation()} onSubmit={handleJoin}>
            <div className="th-modal-title">Join Class</div>
            <div className="th-modal-body">
              <input
                className="th-input"
                type="text"
                placeholder="Enter class code"
                value={joinCode}
                onChange={(e)=>setJoinCode(e.target.value)}
                onFocus={(e)=>(e.target.style.boxShadow=C.ring)}
                onBlur={(e)=>(e.target.style.boxShadow='none')}
              />
            </div>
            <div className="th-modal-actions">
              <button type="button" className="th-btn-cancel" onClick={()=>setShowJoin(false)}>cancel</button>
              <button type="submit" className="th-btn-save">Join</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
