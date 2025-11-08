import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from './pbClient'
import apiFetch from './api'

function pickFirst(...vals){
  for(const v of vals){
    if(typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

export default function UserProfile({ onLogout } = {}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState({ display_name: '', role: '' })
  const [coins, setCoins] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // First, try to fetch fresh user data from the database via API
        const res = await apiFetch('/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (!mounted) return
          const u = data?.user || {}
          const fn = pickFirst(u.first_name, u.firstName, u.firstname, u.given_name, u.givenName)
          const ln = pickFirst(u.last_name, u.lastName, u.lastname, u.family_name, u.familyName)
          const display = [fn, ln].filter(Boolean).join(' ') || pickFirst(u.display_name, u.name, u.username, u.email)
          const role = pickFirst(u.role, localStorage.getItem('role'))
          setUser({ display_name: display, role })
          if (role) localStorage.setItem('role', role) // persist role
        } else {
          throw new Error('API failed')
        }
      } catch (err) {
        // Fallback to pb.authStore.model and localStorage
        if (!mounted) return
        try {
          const m = pb.authStore?.model || {}
          const fn = pickFirst(m.first_name, m.firstName, m.firstname, m.given_name, m.givenName)
          const ln = pickFirst(m.last_name, m.lastName, m.lastname, m.family_name, m.familyName)
          const display = [fn, ln].filter(Boolean).join(' ') || pickFirst(m.display_name, m.name, m.username, m.email)
          const role = pickFirst(m.role, localStorage.getItem('role'))
          setUser({ display_name: display, role })
        } catch (e) {
          setUser({ display_name: '', role: localStorage.getItem('role') || '' })
        }
      }

      // Always load student coins from localStorage (client-side metric)
      const c = Number(localStorage.getItem('student_coins'))
      if (mounted) setCoins(Number.isFinite(c) ? c : null)
    })()
    return () => { mounted = false }
  }, [])

  const handleLogout = () => {
    try { localStorage.removeItem('role') } catch(e){}
    setOpen(false)
    if (typeof onLogout === 'function') return onLogout()
    navigate('/login')
  }

  const roleLower = (user.role || '').toLowerCase()
  const isStudent = roleLower === 'student' || roleLower === 'learner' || roleLower === 'user'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {isStudent && coins !== null && (
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
      )}
        {/* inline name shown next to avatar for topbar */}
        {user.display_name ? (
          <div style={{ fontWeight: 700, color: '#0f172a', marginRight: 8 }}>{user.display_name}</div>
        ) : null}
      <button className="th-avatar" title="profile" onClick={() => setOpen(v => !v)}>🙂</button>

      {open && (
        <>
          <div className="th-profile-backdrop" onClick={() => setOpen(false)} />
          <div className="th-profile-pop">
            <div className="th-profile-title">Profile</div>
            <div className="th-profile-row">Name: {user.display_name || '-'}</div>
            <div className="th-profile-row">Role: {user.role || '-'}</div>

            {/* Show student-only metrics (coins). Teachers/Admins won't see this. */}
            {isStudent && coins !== null && (
              <div className="th-profile-row">Coins: {coins}</div>
            )}

            <button className="th-btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </>
      )}
    </div>
  )
}
