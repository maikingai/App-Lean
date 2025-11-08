// TeacherHome.jsx  (Student-mode)
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from './api'
import pb from './pbClient'
import './teacher-home.css'
import StudentSidebar from './StudentSidebar'
import UserProfile from './UserProfile'

export default function TeacherHome() {
  const navigate = useNavigate()

  const C = useMemo(() => ({
    ring: '0 0 0 3px rgba(15,176,160,.22)',
  }), [])

  /* =========================
   *  LocalStorage keys
   * ========================= */
  const LS_CLASSES_KEY = 'classes_v1'        // รายการคลาส (ฝั่งครูเป็น truth)
  const LS_ACTIVE_KEY  = 'activeClassId'     // คลาสที่กำลังเข้าใช้งาน
  const COIN_KEY       = 'student_coins'     // เหรียญนักเรียน
  const CART_KEY       = 'student_cart_v1'   // รถเข็นนักเรียน (array)

  // seed เริ่มต้น (ใช้กรณีไม่มีใน localStorage)
  const SEED = [
    { id: 1, name: 'Math', section: 'M4/1' },
    { id: 2, name: 'Math', section: 'M4/2' },
    { id: 3, name: 'Math', section: 'M4/3' },
    { id: 4, name: 'Math', section: 'M4/4' },
  ]

  /* =========================
   *  STATE (โหลด/เซฟถาวร)
   * ========================= */
  // Start with null (loading) and fetch authoritative classes from backend.
  const [classes, setClasses] = useState(null)

  // Save to localStorage only when we have a concrete array (not null/loading)
  useEffect(() => {
    if (classes === null) return
    localStorage.setItem(LS_CLASSES_KEY, JSON.stringify(classes))
  }, [classes])

  // fetch classes for current user from backend; set empty array on failure
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await apiFetch('/classes/mine')
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (mounted) {
          if (data?.items) {
            const items = data.items.map(it => ({ id: it.id || it._id || it.record?.id, name: it.name || it.title || 'Class', section: it.section || '', code: it.code || it.classcode }))
            setClasses(items)
          } else {
            setClasses([])
          }
        }
      } catch (err) {
        console.warn('Failed to fetch classes for student', err)
        if (mounted) setClasses([])
      }
    })()
    return () => { mounted = false }
  }, [])

  // current user (display only)
  const [currentUser, setCurrentUser] = useState(() => ({
    display_name: (() => {
      const m = pb.authStore?.model || {}
      const fn = (m.first_name || '').trim()
      const ln = (m.last_name || '').trim()
      return [fn, ln].filter(Boolean).join(' ') || m.name || m.username || m.email || ''
    })(),
    role: localStorage.getItem('role') || '',
  }))

  useEffect(() => {
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

  // เหรียญนักเรียน
  const [coins, setCoins] = useState(() => {
    const n = Number(localStorage.getItem(COIN_KEY))
    if (!Number.isFinite(n)) {
      localStorage.setItem(COIN_KEY, '5000')
      return 5000
    }
    return n
  })
  useEffect(() => localStorage.setItem(COIN_KEY, String(coins)), [coins])

  // รถเข็น (badge)
  const [cartCount, setCartCount] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
      return Array.isArray(arr) ? arr.length : 0
    } catch { return 0 }
  })

  // sync classes & cart badge จาก storage events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LS_CLASSES_KEY) {
        try {
          const v = JSON.parse(e.newValue || '[]')
          setClasses(Array.isArray(v) ? v : [])
        } catch {}
      }
      if (e.key === CART_KEY) {
        try {
          const arr = JSON.parse(e.newValue || '[]')
          setCartCount(Array.isArray(arr) ? arr.length : 0)
        } catch { setCartCount(0) }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ไปหน้า classroom พร้อม remember active class id
  const goClass = (id) => {
    localStorage.setItem(LS_ACTIVE_KEY, String(id))
    navigate('/classroom')
  }

  // Join modal state (students can join via code)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [showAddMenu, setShowAddMenu] = useState(false)

  // Join class by code handler
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
            // refresh authoritative list from backend (so it persists on refresh)
            try {
              const mine = await apiFetch('/classes/mine')
              if (mine.ok) {
                const payload = await mine.json()
                if (payload?.items) {
                  const items = payload.items.map(it => ({ id: it.id || it._id || it.record?.id, name: it.name || it.title || 'Class', section: it.section || '' }))
                  setClasses(items)
                }
              } else {
                // fallback to locally adding
                setClasses(prev => {
                  if (prev.find(p => String(p.id) === String(id))) return prev
                  const item = { id, name: cls.name || 'Class', section: cls.section || '' }
                  return [...prev, item]
                })
              }
            } catch (err) {
              // fallback local add
              setClasses(prev => {
                if (prev.find(p => String(p.id) === String(id))) return prev
                const item = { id, name: cls.name || 'Class', section: cls.section || '' }
                return [...prev, item]
              })
            }
            // do not set active class or navigate; show the class in the home list
          } else {
            // stay on home
          }
        } else {
          // stay on home
        }
      } catch (err) {
        console.warn('Join by code failed', err)
        // stay on home
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
      {/* ===== Sidebar (โหมดนักเรียน) ===== */}
      <StudentSidebar />

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        {/* top-right: coins + avatar */}
        <div className="th-topbar" style={{ justifyContent:'flex-end' }}>
          <UserProfile />
        </div>
        

        {/* Cards (นักเรียน: สามารถ Join ได้) */}
        <div className="th-card-grid">
            {/* Add card: opens Join modal */}
            <div className="th-card th-card-add" onClick={() => setShowJoin(true)} role="button" title="Join class"
              style={{ display:'grid', placeItems:'center', position:'relative' }}>
              <div style={{ fontSize: 42, lineHeight: 1, opacity:.9 }}>＋</div>
            </div>

            {/* การ์ดคลาสเรียน */}
            {classes === null && (
              <div className="th-card" style={{ gridColumn:'1/-1', textAlign:'center', padding:20, opacity:0.8 }}>
                Loading classes...
              </div>
            )}

            {Array.isArray(classes) && classes.length === 0 && (
              <div className="th-card" style={{ gridColumn:'1/-1', textAlign:'center', padding:20 }}>
                You haven't joined any class yet.
              </div>
            )}

            {Array.isArray(classes) && classes.map(item => (
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
                  <div className="th-card-actions" />
                </div>
              </div>
            ))}
        </div>
      </main>

      {/* Join Class modal for students */}
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
