// TeacherHome.jsx
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './teacher-home.css'

export default function TeacherHome() {
  const navigate = useNavigate()

  const C = useMemo(() => ({
    ring: '0 0 0 3px rgba(15,176,160,.22)',
  }), [])

  /* =========================
   *  LocalStorage helpers
   * ========================= */
  const LS_CLASSES_KEY = 'classes_v1'
  const LS_ACTIVE_KEY  = 'activeClassId'

  // seed เริ่มต้น (ใช้กรณีไม่มีใน localStorage)
  const SEED = [
    { id: 1, name: 'Math', section: 'M4/1' },
    { id: 2, name: 'Math', section: 'M4/2' },
    { id: 3, name: 'Math', section: 'M4/3' },
    { id: 4, name: 'Math', section: 'M4/4' },
  ]

  // สร้างพื้นที่ mock ของแต่ละคลาสไว้ให้ Classroom ใช้ต่อ (รองรับ backend ทีหลัง)
  function ensureClassroomStore(classId, name = 'New Class', section = '') {
    const key = `classroom_${classId}`
    if (!localStorage.getItem(key)) {
      const payload = {
        id: classId,
        name,
        section,
        // mock ข้อมูลตัวอย่าง (โพสต์/ประกาศ/งาน) — Classroom ค่อยอ่านไปใช้
        posts: [
          {
            id: `seed_${Date.now()}`,
            type: 'assignment',
            title: `${name} : New Assignment - Matrix`,
            dateLabel: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            detail: 'แบบฝึกหัด Matrix ชุดที่ 1',
            section,
            dueDate: '',
            dueTime: '',
            point: 10,
            coin: 10,
            youtubeUrl: '',
            otherLink: '',
            files: []
          }
        ]
      }
      localStorage.setItem(key, JSON.stringify(payload))
    }
  }

  /* =========================
   *  STATE (โหลด/เซฟถาวร)
   * ========================= */
  const [classes, setClasses] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_CLASSES_KEY) || 'null')
      if (Array.isArray(saved) && saved.length) return saved
    } catch {}
    // ถ้ายังไม่เคยมี ให้ seed + เตรียม store ให้แต่ละ class
    SEED.forEach(c => ensureClassroomStore(c.id, c.name, c.section))
    return SEED
  })

  // บันทึกทุกครั้งที่เปลี่ยน
  useEffect(() => {
    localStorage.setItem(LS_CLASSES_KEY, JSON.stringify(classes))
  }, [classes])

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

  /* =========================
   *  ACTIONS
   * ========================= */
  const openEdit  = (item) => setModal({ open: true, id: item.id, name: item.name, section: item.section })
  const closeEdit = () => setModal({ open: false, id: null, name: '', section: '' })
  const saveEdit  = () => {
    setClasses(prev => prev.map(c => (c.id === modal.id ? { ...c, name: modal.name.trim(), section: modal.section.trim() } : c)))
    // อัปเดต store ของ classroom ด้วย
    try {
      const key = `classroom_${modal.id}`
      const data = JSON.parse(localStorage.getItem(key) || 'null')
      if (data) {
        data.name = modal.name.trim()
        data.section = modal.section.trim()
        localStorage.setItem(key, JSON.stringify(data))
      }
    } catch {}
    closeEdit()
  }

  // ลบ class + ลบ store classroom_<id> + ถ้าเป็น active ให้เคลียร์
  const deleteClass = (id) => {
    setClasses(prev => prev.filter(c => c.id !== id))
    localStorage.removeItem(`classroom_${id}`)
    const active = localStorage.getItem(LS_ACTIVE_KEY)
    if (String(active) === String(id)) localStorage.removeItem(LS_ACTIVE_KEY)
  }

  // ไปหน้า classroom พร้อม remember active class id
  const goClass = (id) => {
    localStorage.setItem(LS_ACTIVE_KEY, String(id))
    navigate('/classroom')
  }

  // Create class → เพิ่มการ์ดใหม่ (ถาวร) + เตรียม store สำหรับ Classroom
  const handleCreate = (e) => {
    e?.preventDefault?.()
    const nextId = classes.length ? Math.max(...classes.map(c => c.id)) + 1 : 1
    const name = createForm.name.trim() || 'New Class'
    const room = createForm.room.trim() || `Room ${nextId}`
    const newClass = { id: nextId, name, section: room }
    setClasses(prev => [...prev, newClass])
    ensureClassroomStore(nextId, name, room) // ✅ สร้างพื้นที่ข้อมูลของคลาสใหม่นี้
    setShowCreate(false)
    setCreateForm({ name: '', room: '' })
    setShowAddMenu(false)
  }

  // Join class → demo
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
      {/* ===== Sidebar (ใส่ไอคอน) ===== */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => navigate('/teacher')}>🏠</IconBtn>
          <IconBtn title="Calendar" onClick={() => navigate('/calendar')}>🗓️</IconBtn>
          <IconBtn title="Quiz" onClick={() => navigate('/quiz')}>❓</IconBtn>
          <IconBtn title="Assignment Review" onClick={() => navigate('/assignments/review')}>📝</IconBtn>
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
          {/* การ์ด Add */}
          <div className="th-card th-card-add" onClick={() => setShowAddMenu(v => !v)} role="button" title="Add class"
            style={{ display:'grid', placeItems:'center', position:'relative' }}>
            <div style={{ fontSize: 42, lineHeight: 1, opacity:.9 }}>＋</div>

            {/* เมนู Create/Join บนการ์ด */}
            {showAddMenu && (
              <>
                <div style={{
                  position:'absolute',
                  bottom:12, left:12, right:12,
                  background:'#fff',
                  borderRadius:12,
                  boxShadow:'0 12px 30px rgba(2,8,23,.15)',
                  overflow:'hidden',
                  zIndex:5
                }}
                onClick={e => e.stopPropagation()}>
                  <button className="th-add-item" style={{width:'100%'}} onClick={() => { setShowCreate(true) }}>
                    Create class
                  </button>
                  <button className="th-add-item" style={{width:'100%'}} onClick={() => { setShowJoin(true) }}>
                    Join class
                  </button>
                </div>
                <div
                  onClick={() => setShowAddMenu(false)}
                  style={{ position:'absolute', inset:0, borderRadius:16 }}
                />
              </>
            )}
          </div>

          {/* การ์ดคลาสเรียน */}
          {classes.map(item => (
            <div key={item.id} className="th-card">
              <div className="th-card-head">{item.name}</div>
              <div
                className="th-card-body"
                role="button"
                onClick={() => goClass(item.id)}
                title="เข้าเรียน"
              >
                <span className="th-section">{item.section}</span>
              </div>
              <div className="th-card-foot">
                <div className="th-card-actions">
                  <IconBtn title="report"   onClick={() => console.log('report', item.id)}>📄</IconBtn>
                  <IconBtn title="analytics" onClick={() => console.log('analytics', item.id)}>📊</IconBtn>
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
