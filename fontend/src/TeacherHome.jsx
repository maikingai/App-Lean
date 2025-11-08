// TeacherHome.jsx
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from './api'
import pb from './pbClient'
import './teacher-home.css'
import UserProfile from './UserProfile'
import TeacherSidebar from './TeacherSidebar'

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

  // fetch classes for the current user from backend. If backend fails, fallback to local seed
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await apiFetch('/classes/mine')
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (mounted && data?.items) {
          // normalize id to simple number or string
          const items = data.items.map(it => ({ id: it.id || it._id || it.record?.id, name: it.name || it.title || 'Class', section: it.section || '', code: it.code || it.classcode }))
          setClasses(items)
          items.forEach(c => ensureClassroomStore(c.id, c.name, c.section))
        }
      } catch (err) {
        // keep existing local classes
        console.warn('Failed to fetch classes from API, using local seed', err)
      }
    })()
    return () => { mounted = false }
  }, [])

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

  // current user (display only)
  const [currentUser, setCurrentUser] = useState(() => {
    const m = pb.authStore?.model || {}
    const fn = (m.first_name || '').trim()
    const ln = (m.last_name || '').trim()
    const display = [fn, ln].filter(Boolean).join(' ') || m.name || m.username || m.email || ''
    return { display_name: display, role: localStorage.getItem('role') || '' }
  })

  useEffect(() => {
    // prefer authoritative data from backend /api/auth/me when token exists
    const token = pb.authStore?.token || localStorage.getItem('pb_token')
    if (!token) return
    let mounted = true
    ;(async () => {
      try {
        const res = await apiFetch('/auth/me')
        if (!res.ok) throw new Error('no-me')
        const data = await res.json()
        if (!mounted) return
        const u = data?.user || {}
        const fn = (u.first_name || u.firstName || '').trim()
        const ln = (u.last_name || u.lastName || '').trim()
  const display = [fn, ln].filter(Boolean).join(' ') || u.display_name || u.name || u.username || u.email || ''
  const role = u.role || localStorage.getItem('role') || ''
  setCurrentUser({ display_name: display, role })
  if (role) localStorage.setItem('role', role)
      } catch (err) {
        // fallback to pb.authStore.model if /me failed
        const m = pb.authStore?.model
        if (m) {
          const fn = (m.first_name || '').trim()
          const ln = (m.last_name || '').trim()
          const display = [fn, ln].filter(Boolean).join(' ') || m.name || m.username || m.email || ''
          setCurrentUser({ name: display, role: localStorage.getItem('role') || m.role || '' })
        }
      }
    })()
    return () => { mounted = false }
  }, [])

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
    // attempt to delete on backend, then cleanup local state
    ;(async () => {
      try {
        await apiFetch(`/classes/${id}`, { method: 'DELETE' })
      } catch (e) {
        console.warn('Failed to delete class on backend', e)
      }
    })()

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
    const name = createForm.name.trim() || 'New Class'
    const room = createForm.room.trim() || ''
    // call backend to create class (admin/teacher only)
    ;(async () => {
      try {
        const res = await apiFetch('/classes', { method: 'POST', body: JSON.stringify({ name, section: room }), headers: { 'Content-Type': 'application/json' } })
        if (res.ok) {
          const data = await res.json()
          const cls = data?.class || data
          const id = cls.id || cls._id || cls.record?.id || cls.id
          const item = { id, name: cls.name || name, section: cls.section || room, code: cls.code }
          setClasses(prev => [...prev, item])
          ensureClassroomStore(id, item.name, item.section)
        } else {
          // fallback local create
          const nextId = classes.length ? Math.max(...classes.map(c => (typeof c.id === 'number' ? c.id : 0))) + 1 : 1
          const newClass = { id: nextId, name, section: room }
          setClasses(prev => [...prev, newClass])
          ensureClassroomStore(nextId, name, room)
        }
      } catch (err) {
        console.warn('Create class failed, falling back to local', err)
        const nextId = classes.length ? Math.max(...classes.map(c => (typeof c.id === 'number' ? c.id : 0))) + 1 : 1
        const newClass = { id: nextId, name, section: room }
        setClasses(prev => [...prev, newClass])
        ensureClassroomStore(nextId, name, room)
      } finally {
        setShowCreate(false)
        setCreateForm({ name: '', room: '' })
        setShowAddMenu(false)
      }
    })()
  }

  // Join class → call backend join-by-code, add class to list and navigate
  const handleJoin = (e) => {
    e?.preventDefault?.()
    ;(async () => {
      try {
        const res = await apiFetch('/classes/join-by-code', { method: 'POST', body: JSON.stringify({ classcode: joinCode.trim() }), headers: { 'Content-Type': 'application/json' } })
        if (res.ok) {
          const data = await res.json()
          const cls = data?.class || (data?.enrollment && data.enrollment.class) || null
          if (cls) {
            const id = cls.id || cls._id || cls.record?.id || cls.id
            // add to classes if missing
            setClasses(prev => {
              if (prev.find(p => String(p.id) === String(id))) return prev
              const item = { id, name: cls.name || 'Class', section: cls.section || '' }
              ensureClassroomStore(id, item.name, item.section)
              return [...prev, item]
            })
            localStorage.setItem(LS_ACTIVE_KEY, String(id))
            navigate('/classroom')
          } else {
            // if backend returned enrollment only, try to fetch classes/mine
            try { await apiFetch('/classes/mine') } catch {}
            navigate('/classroom')
          }
        } else {
          // fallback: just navigate
          navigate('/classroom')
        }
      } catch (err) {
        console.warn('Join by code failed', err)
        navigate('/classroom')
      } finally {
        setShowJoin(false)
        setJoinCode('')
        setShowAddMenu(false)
      }
    })()
  }

  // ปุ่มไอคอน
  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  return (
    <div className="th-root th-root-rel">
      {/* ===== Shared Teacher Sidebar ===== */}
      <TeacherSidebar />

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        {/* top-right: avatar + name (shared) */}
        <div className="th-topbar" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserProfile />
        </div>

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
                {item.code ? (
                  <div style={{ fontSize: 12, color: '#334155', marginRight: 8 }}>Code: <strong>{item.code}</strong></div>
                ) : null}
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
