// TeacherHome.jsx  (Student-mode)
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './teacher-home.css'

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
  const [classes, setClasses] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_CLASSES_KEY) || 'null')
      if (Array.isArray(saved) && saved.length) return saved
    } catch {}
    // ถ้ายังไม่เคยมี ให้ seed
    return SEED
  })

  // บันทึกทุกครั้งที่เปลี่ยน (ยังคงเก็บ แต่ฝั่งนักเรียนจะไม่แก้ค่า)
  useEffect(() => {
    localStorage.setItem(LS_CLASSES_KEY, JSON.stringify(classes))
  }, [classes])

  // โปรไฟล์ / logout
  const [showProfile, setShowProfile] = useState(false)
  const handleLogout = () => {
    localStorage.removeItem('role')
    setShowProfile(false)
    navigate('/login')
  }

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

  // ปุ่มไอคอน
  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  return (
    <div className="th-root th-root-rel">
      {/* ===== Sidebar (โหมดนักเรียน) ===== */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top">
          <IconBtn title="Home" onClick={() => navigate('/student')}>🏠</IconBtn>
          <IconBtn title="Calendar" onClick={() => navigate('/student/calendar')}>🗓️</IconBtn>
          <IconBtn title="Quiz" onClick={() => navigate('/student/quiz')}>❓</IconBtn>
          {/* Cart */}
          <IconBtn title="Cart" onClick={() => navigate('/cart')}>
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
      </aside>

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        {/* top-right: coins + avatar */}
        <div className="th-topbar" style={{ justifyContent:'flex-end', gap:10 }}>
          <div
            title="Coins"
            style={{
              display:'flex', alignItems:'center', gap:6,
              background:'#ffe58a', color:'#1f2937',
              padding:'6px 10px', borderRadius:999, fontWeight:800,
              boxShadow:'0 2px 0 rgba(0,0,0,.08)'
            }}
          >
            🪙 {coins}
          </div>
          <button className="th-avatar" title="profile" onClick={() => setShowProfile(v => !v)}>🙂</button>
        </div>

        {/* Profile popover */}
        {showProfile && (
          <>
            <div className="th-profile-backdrop" onClick={() => setShowProfile(false)} />
            <div className="th-profile-pop">
              <div className="th-profile-title">Profile</div>
              <div className="th-profile-row">Role: Student</div>
              <div className="th-profile-row">Coins: {coins}</div>
              <button className="th-btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          </>
        )}

        {/* Cards (อ่านอย่างเดียวสำหรับนักเรียน) */}
        <div className="th-card-grid">
          {/* ⛔ ลบการ์ด Add / Create / Join ออกในโหมดนักเรียน */}

          {/* การ์ดคลาสเรียน */}
          {classes.length === 0 && (
            <div className="th-card" style={{ gridColumn:'1/-1', textAlign:'center', padding:20 }}>
              You haven't joined any class yet.
            </div>
          )}

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
                {/* ⛔ ลบปุ่ม report / analytics / edit และปุ่ม delete ออก */}
                <div className="th-card-actions" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ⛔ ลบทุกโมดัลของครู (Edit / Create / Join) ออกในโหมดนักเรียน */}
    </div>
  )
}
