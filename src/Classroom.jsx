// src/Classroom.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './teacher-home.css'

export default function Classroom() {
  const navigate = useNavigate()
  const location = useLocation()

  // ---------------- Tabs state ----------------
  const [tab, setTab] = useState('classroom')

  // ---------------- Profile / Logout ----------------
  const [showProfile, setShowProfile] = useState(false)
  const handleLogout = () => {
    localStorage.removeItem('role')
    setShowProfile(false)
    navigate('/login')
  }

  // ---------------- Meet modal (ปุ่มขวาบนยังเป็น Create meet) ----------------
  const [showMeet, setShowMeet] = useState(false)
  const [meetForm, setMeetForm] = useState({ topic: '', time: '' })

  const handleCreateMeet = (e) => {
    e?.preventDefault?.()
    const topic = meetForm.topic.trim() || 'Class Meet'
    const time  = meetForm.time.trim()  || 'Now'
    setShowMeet(false)
    setMeetForm({ topic: '', time: '' })
    navigate(`/meet?topic=${encodeURIComponent(topic)}&time=${encodeURIComponent(time)}`)
  }

  // ---------------- Create (Assignment/Material) modal ----------------
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState('assignment') // 'assignment' | 'material'

  // ฟอร์ม Assignment
  const [assignForm, setAssignForm] = useState({
    name: '', detail: '', section: 'M4/1',
    dueDate: '', dueTime: '',
    point: '', coin: '',
    youtubeUrl: '',
    otherLink: '',
    files: [] // FileList
  })
  // ฟอร์ม Material
  const [materialForm, setMaterialForm] = useState({
    name: '', detail: '', section: 'M4/1',
    youtubeUrl: '',
    otherLink: '',
    files: [] // FileList
  })

  // ---------------- Feed ----------------
  const [posts, setPosts] = useState([
    {
      id: 'p1',
      type: 'assignment',
      title: 'Thanchanok Konsuag : New Assignment - Matrix',
      dateLabel: '3 Oct. 2025, 23:59',
      detail: 'Description..........................',
      section: 'M4/1',
      dueDate: '2025-10-10',
      dueTime: '23:59',
      point: 10,
      coin: 10,
      youtubeUrl: '',
      otherLink: '',
      files: [
        { name: 'Matrix.pdf', type: 'application/pdf', url: '#', label: 'PDF' },
        { name: 'Matrix.mp4', type: 'video/mp4', url: '#', label: 'Video' },
      ],
    },
    {
      id: 'p2',
      type: 'material',
      title: 'Thanchanok Konsuag : New Material - Matrix',
      dateLabel: '26 Sep. 2025',
      detail: 'สไลด์ Matrix บทที่ 1-2',
      section: 'M4/1',
      youtubeUrl: '',
      otherLink: '',
      files: [],
    }
  ])

  // ---------------- UI Helpers ----------------
  const IconBtn = ({ title, onClick, children }) => (
    <button
      className="th-iconbtn"
      title={title}
      aria-label={title}
      onClick={onClick}
      style={{
        background: 'linear-gradient(180deg,#fff, #f3f6ff)',
        border: '1px solid #e5e7eb',
        boxShadow: '0 6px 18px rgba(15,23,42,.06)',
      }}
    >
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  const SoftBtn = ({ children, onClick, title, type }) => (
    <button
      type={type}
      title={title}
      onClick={onClick}
      style={{
        height: 36,
        padding: '0 16px',
        borderRadius: 999,
        border: '1px solid rgba(15,23,42,.08)',
        background: 'linear-gradient(180deg,#ffffff,#f7faff)',
        boxShadow: '0 8px 24px rgba(15,23,42,.08)',
        fontWeight: 700,
        color: '#1f2937',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )

  const PrimaryBtn = ({ children, onClick, title, type }) => (
    <button
      type={type}
      title={title}
      onClick={onClick}
      style={{
        height: 36,
        padding: '0 16px',
        borderRadius: 12,
        border: 0,
        background: 'linear-gradient(180deg,#6366f1,#4f46e5)',
        boxShadow: '0 10px 26px rgba(79,70,229,.35)',
        color: '#fff',
        fontWeight: 700,
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )

  const DangerBtn = ({ children, onClick, title }) => (
    <button
      title={title}
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 12px',
        borderRadius: 10,
        border: 0,
        background: 'linear-gradient(180deg,#ef4444,#dc2626)',
        boxShadow: '0 10px 26px rgba(239,68,68,.35)',
        color: '#fff',
        fontWeight: 700,
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )

  const Chip = ({ children, color = '#e2e8f0' }) => (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        background: color,
        fontSize: 12,
        fontWeight: 700,
        color: '#0f172a'
      }}
    >
      {children}
    </span>
  )

  function getYouTubeId(url = '') {
    const m = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?v=|v\/|.*[?&]v=))([a-zA-Z0-9_-]{6,})/
    )
    return m ? m[1] : null
  }

  // แปลง FileList -> attachments ที่เปิดดูได้ (objectURL)
  function toAttachments(fileList) {
    try {
      return Array.from(fileList || []).map((f) => ({
        name: f.name,
        type: f.type || '',
        size: f.size || 0,
        url: URL.createObjectURL(f),
      }))
    } catch {
      return []
    }
  }
  const typeLabel = (mime = '', name = '') => {
    if (mime.startsWith('image/')) return 'Image'
    if (mime.startsWith('video/')) return 'Video'
    if (mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return 'PDF'
    if (/\.docx?$/.test(name.toLowerCase())) return 'Doc'
    if (/\.pptx?$/.test(name.toLowerCase())) return 'Slide'
    if (/\.xlsx?$/.test(name.toLowerCase())) return 'Sheet'
    if (/\.txt$/.test(name.toLowerCase())) return 'Text'
    return 'File'
  }

  // ---------------- Clipboard ----------------
  const copyCode = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText('KinkHaw88')
      } else {
        const ta = document.createElement('textarea')
        ta.value = 'KinkHaw88'
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      alert('Copied: KinkHaw88')
    } catch {
      alert('Copy failed')
    }
  }

  // ---------------- Sync Tab with URL ----------------
  useEffect(() => {
    const p = location.pathname
    if (p.startsWith('/assignments/teacher') || p.startsWith('/classroom/assignments') || p.startsWith('/assignments/review')) {
      setTab('assignments')
    } else if (p.startsWith('/classroom/members')) setTab('members')
    else if (p.startsWith('/classroom/grades')) setTab('grades')
    else if (p.startsWith('/classroom/dashboard')) setTab('dashboard')
    else setTab('classroom')
  }, [location.pathname])

  // ---------------- API stub (เตรียมต่อ backend) ----------------
  async function createPostToAPI(payload) {
    return { ok: true, id: 'p' + Math.random().toString(36).slice(2, 8) }
  }

  // ---------------- Submit Create ----------------
  const submitCreate = async (e) => {
    e?.preventDefault?.()
    if (createType === 'assignment') {
      const payload = {
        type: 'assignment',
        title: `${'Thanchanok Konsuag'} : New Assignment - ${assignForm.name.trim() || 'Untitled'}`,
        dateLabel: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit' }),
        detail: assignForm.detail.trim(),
        section: assignForm.section,
        dueDate: assignForm.dueDate || '',
        dueTime: assignForm.dueTime || '',
        point: assignForm.point ? Number(assignForm.point) : '',
        coin: assignForm.coin ? Number(assignForm.coin) : '',
        youtubeUrl: assignForm.youtubeUrl.trim(),
        otherLink: assignForm.otherLink.trim(),
        files: toAttachments(assignForm.files)
      }
      const apiRes = await createPostToAPI(payload)
      const id = apiRes?.id || 'local_' + Date.now()
      setPosts(prev => [{ ...payload, id }, ...prev])
      setShowCreate(false)
      setAssignForm({ name:'', detail:'', section:'M4/1', dueDate:'', dueTime:'', point:'', coin:'', youtubeUrl:'', otherLink:'', files:[] })
    } else {
      const payload = {
        type: 'material',
        title: `${'Thanchanok Konsuag'} : New Material - ${materialForm.name.trim() || 'Untitled'}`,
        dateLabel: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year:'numeric' }),
        detail: materialForm.detail.trim(),
        section: materialForm.section,
        youtubeUrl: materialForm.youtubeUrl.trim(),
        otherLink: materialForm.otherLink.trim(),
        files: toAttachments(materialForm.files)
      }
      const apiRes = await createPostToAPI(payload)
      const id = apiRes?.id || 'local_' + Date.now()
      setPosts(prev => [{ ...payload, id }, ...prev])
      setShowCreate(false)
      setMaterialForm({ name:'', detail:'', section:'M4/1', youtubeUrl:'', otherLink:'', files:[] })
    }
  }

  // ---------------- Post Card (หน้าฟีด) ----------------
  const PostCard = ({ post, onOpen }) => {
    const [open, setOpen] = useState(false)
    const ytid = getYouTubeId(post.youtubeUrl)

    const headBg = post.type === 'assignment'
      ? 'linear-gradient(180deg,#eef2ff,#e0e7ff)'
      : 'linear-gradient(180deg,#e6fffa,#d1fae5)'

    const badge = post.type === 'assignment'
      ? <Chip color="#e0e7ff">Assignment</Chip>
      : <Chip color="#dcfce7">Material</Chip>

    const handleDelete = () => {
      if (confirm('Delete this post?')) {
        setPosts(prev => prev.filter(p => p.id !== post.id))
      }
    }

    return (
      <div
        className="th-card"
        style={{
          width: '97%',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(15,23,42,.10)',
        }}
      >
        {/* Header */}
        <div
          onClick={() => setOpen(o => !o)}
          style={{
            padding: '14px 18px',
            background: headBg,
            cursor: 'pointer'
          }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {post.title}
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              {badge}
              <DangerBtn title="Delete" onClick={(e)=>{ e.stopPropagation(); handleDelete(); }}>Delete</DangerBtn>
            </div>
          </div>

          {/* sub header row: points left, due right (สำหรับ assignment) */}
          {post.type === 'assignment' && (
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:13, color:'#374151' }}>
              <div>{(post.point ?? 0)} points</div>
              <div>Due {post.dueDate ? new Date(post.dueDate + 'T' + (post.dueTime || '00:00')).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-'}</div>
            </div>
          )}
          {post.type !== 'assignment' && (
            <div style={{ marginTop:6, fontSize:12, color:'#64748b' }}>{post.dateLabel} • {post.section}</div>
          )}
        </div>

        {/* Body */}
        {open && (
          <div style={{ padding: 18, background: '#ffffff' }}>
            {/* ไฟล์แนบเป็นการ์ด คลิกเปิดในแท็บใหม่ */}
            {!!post.files?.length && (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:14, marginBottom:14 }}>
                  {post.files.map((f, i) => {
                    const label = f.label || typeLabel(f.type, f.name)
                    return (
                      <a key={i} href={f.url || '#'} target="_blank" rel="noreferrer"
                        style={{
                          textDecoration:'none',
                          background:'#fff',
                          borderRadius:18,
                          padding:'14px 16px',
                          boxShadow:'0 10px 26px rgba(15,23,42,.10)',
                          display:'block',
                          border:'1px solid #e5e7eb'
                        }}>
                        <div style={{ fontWeight:700, color:'#111', marginBottom:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize:12, color:'#64748b' }}>{label}</div>
                      </a>
                    )
                  })}
                </div>
              </>
            )}

            {/* รายละเอียดข้อความ */}
            {post.detail && (
              <>
                <div style={{ height:1, background:'rgba(0,0,0,.08)', margin:'6px 0 12px' }} />
                <div style={{ color:'#0f172a', lineHeight:1.6 }}>{post.detail}</div>
              </>
            )}

            {/* YouTube embed */}
            {ytid && (
              <div style={{ marginTop: 14 }}>
                <div style={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 12px 30px rgba(15,23,42,.15)',
                  background: '#000'
                }}>
                  <iframe
                    title="youtube"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://www.youtube.com/embed/${ytid}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* ลิงก์อื่น */}
            {post.otherLink && (
              <div style={{ marginTop:12 }}>
                <a href={post.otherLink} target="_blank" rel="noreferrer" style={{ color:'#2563eb', wordBreak:'break-all' }}>
                  {post.otherLink}
                </a>
              </div>
            )}

            {/* กล่องคอมเมนต์ (UI) */}
            <div style={{ height:1, background:'rgba(0,0,0,.08)', margin:'14px 0' }} />
            <div style={{ fontSize:14, color:'#374151', marginBottom:8 }}>Class comments</div>
            <div style={{ display:'grid', gridTemplateColumns:'28px 1fr 32px', alignItems:'center', gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:14, background:'#A3E887', display:'grid', placeItems:'center' }}>🙂</div>
              <input className="th-input" placeholder="Write a comment..." style={{ height:38, borderRadius:12 }} />
              <div style={{ color:'#3b82f6', fontWeight:700, textAlign:'center' }}>➤</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="th-root">
      {/* ===== Sidebar ===== */}
      <aside className="th-sidebar">
        <div className="th-sidebar-top" style={{ gap: 12 }}>
          <IconBtn title="Home" onClick={() => navigate('/teacher')}>🏠</IconBtn>
          <IconBtn title="Calendar" onClick={() => navigate('/calendar')}>🗓️</IconBtn>
          <IconBtn title="Quiz" onClick={() => navigate('/quiz')}>❓</IconBtn>
          <IconBtn title="Assignment Review" onClick={() => navigate('/assignments/review')}>📝</IconBtn>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        {/* Topbar */}
        <div className="th-topbar" style={{ justifyContent: 'flex-end' }}>
          <button
            className="th-avatar"
            title="profile"
            onClick={() => setShowProfile(v => !v)}
            style={{ boxShadow: '0 8px 24px rgba(15,23,42,.15)' }}
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

        {/* Tabs + Create */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', margin: '6px 0 12px' }}>
          {[
            ['classroom',   'Classroom',   () => navigate('/classroom')],
            ['assignments', 'Assignments', () => navigate('/assignments/review')],
            ['members',     'Members',     () => navigate('/classroom/members')],
            ['grades',      'Grades',      () => navigate('/classroom/grades')],
            ['dashboard',   'Dashboard',   () => navigate('/classroom/dashboard')],
          ].map(([key, label, go]) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={go}
                style={{
                  background: 'transparent',
                  border: 0,
                  padding: '10px 6px',
                  fontWeight: 700,
                  letterSpacing: .2,
                  color: active ? '#111827' : '#334155',
                  borderBottom: `3px solid ${active ? '#6366f1' : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <SoftBtn
              title="Create assignment/material"
              onClick={() => { setCreateType('assignment'); setShowCreate(true) }}
            >
              + Create
            </SoftBtn>
            <PrimaryBtn title="Create meet" onClick={() => setShowMeet(true)}>
              Create meet
            </PrimaryBtn>
          </div>
        </div>

        {/* Header */}
        <section className="th-card" style={{
          width: '97%',
          background: 'linear-gradient(135deg,#b58cff,#8ea5ff)',
          color: '#fff',
          borderRadius: 18,
          padding: 22,
          height: 140,
          position: 'relative',
          boxShadow: '0 22px 50px rgba(15,23,42,.25)',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Math</div>
        </section>

        {/* Grid 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 18, alignItems: 'start', marginTop: 14 }}>
          {/* Left */}
          <aside style={{ display: 'grid', gap: 14 }}>
            {/* Meet (ซ้ายเป็น Join) */}
            <div className="th-card" style={{ padding: 14, borderRadius: 16, boxShadow:'0 14px 36px rgba(15,23,42,.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E9F0FF', display: 'grid', placeItems: 'center' }}>🎥</div>
                  <div style={{ fontWeight: 700 }}>Meet</div>
                </div>
                <PrimaryBtn title="Join meet" onClick={() => navigate('/meet')}>Join</PrimaryBtn>
              </div>
            </div>

            {/* Class code */}
            <div className="th-card" style={{ padding: 14, borderRadius: 16, boxShadow:'0 14px 36px rgba(15,23,42,.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#7A8BA6', marginBottom: 8 }}>
                <span>Class code</span>
                <button onClick={copyCode} title="Copy" style={{ background: 'transparent', border: 0, fontSize: 18, cursor: 'pointer' }}>
                  📋
                </button>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>KinkHaw88</div>
            </div>
          </aside>

          {/* Right: Feed */}
          <section style={{ display: 'grid', gap: 14 }}>
            {/* Post box (Quick) */}
            <div className="th-card" style={{
              width: '97%',
              display: 'grid',
              gridTemplateColumns: '34px 1fr',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 16,
              boxShadow:'0 14px 36px rgba(15,23,42,.12)'
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 16, background: '#A3E887', display: 'grid', placeItems: 'center' }}>🙂</div>
              <input className="th-input" placeholder="Thanchanok , post something to your class..." style={{ height: 38, borderRadius: 12 }} />
            </div>

            {/* Feed items */}
            {posts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                onOpen={() => {
                  if (p.type === 'assignment') navigate('/assignment/42')
                }}
              />
            ))}
          </section>
        </div>
      </main>

      {/* Modal: Create Meet (เลือกวัน/เวลา + Cancel) */}
      {showMeet && (
        <div className="th-modal-backdrop" onClick={() => setShowMeet(false)}>
          <form className="th-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreateMeet}>
            <div className="th-modal-title">Create Meet</div>
            <div className="th-modal-body" style={{ display: 'grid', gap: 10 }}>
              <input
                className="th-input"
                type="text"
                placeholder="Title"
                value={meetForm.topic}
                onChange={(e)=>setMeetForm(v=>({...v, topic:e.target.value}))}
              />
              <input
                className="th-input"
                type="date"
                onChange={(e)=>setMeetForm(v=>({...v, time: (v.time?.split(' ')?.[1] ? `${e.target.value} ${v.time.split(' ')[1]}` : e.target.value)}))}
              />
              <input
                className="th-input"
                type="time"
                onChange={(e)=>setMeetForm(v=>({...v, time: (v.time?.split(' ')?.[0] ? `${v.time.split(' ')[0]} ${e.target.value}` : e.target.value)}))}
              />
            </div>
            <div className="th-modal-actions" style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <SoftBtn title="Cancel" onClick={()=>setShowMeet(false)} type="button">Cancel</SoftBtn>
              <PrimaryBtn type="submit" title="Create">Create</PrimaryBtn>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create Assignment / Material — เรียบ สะอาด ไม่มีไอคอน + อัพโหลดไฟล์/ลิงก์ */}
      {showCreate && (
        <div className="th-modal-backdrop" onClick={() => setShowCreate(false)}>
          <form className="th-modal" style={{ width: 1100, padding: 22 }} onClick={(e) => e.stopPropagation()} onSubmit={submitCreate}>
            <div className="th-modal-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>Create</div>
              <div style={{ display: 'grid', gridAutoFlow: 'column', gap: 8 }}>
                <SoftBtn title="Assignment" onClick={() => setCreateType('assignment')} type="button">
                  {createType === 'assignment' ? '✓ Assignment' : 'Assignment'}
                </SoftBtn>
                <SoftBtn title="Material" onClick={() => setCreateType('material')} type="button">
                  {createType === 'material' ? '✓ Material' : 'Material'}
                </SoftBtn>
              </div>
            </div>

            {createType === 'assignment' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 22 }}>
                {/* LEFT */}
                <div className="th-card" style={{ padding: 16, borderRadius: 18, minWidth: 720, marginLeft: 6 }}>
                  <input
                    className="th-input"
                    placeholder="Name Assignment"
                    value={assignForm.name}
                    onChange={(e)=>setAssignForm(v=>({...v, name:e.target.value}))}
                    style={{ marginBottom: 50 }}
                  />
                  <textarea
                    className="th-input"
                    placeholder="Write assignment details..."
                    value={assignForm.detail}
                    onChange={(e)=>setAssignForm(v=>({...v, detail:e.target.value}))}
                    rows={10}
                    style={{ resize: 'vertical' }}
                  />

                  <div style={{ display:'grid', gap:10, marginTop:14 }}>
                    <input
                      className="th-input"
                      type="url"
                      placeholder="YouTube link (optional)"
                      value={assignForm.youtubeUrl}
                      onChange={(e)=>setAssignForm(v=>({...v, youtubeUrl:e.target.value}))}
                    />
                    <input
                      className="th-input"
                      type="url"
                      placeholder="Other link (optional)"
                      value={assignForm.otherLink}
                      onChange={(e)=>setAssignForm(v=>({...v, otherLink:e.target.value}))}
                    />
                    <input
                      className="th-input"
                      type="file"
                      multiple
                      accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                      onChange={(e)=>setAssignForm(v=>({...v, files:e.target.files}))}
                    />
                  </div>
                </div>

                {/* RIGHT */}
                <div className="th-card" style={{ padding: 16, borderRadius: 18 }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>For</div>
                  <select className="th-input" value={assignForm.section} onChange={(e)=>setAssignForm(v=>({...v, section:e.target.value}))}>
                    <option>M4/1</option><option>M4/2</option>
                  </select>

                  <div style={{ fontSize: 12, color: '#6b7280', margin: '12px 0 6px' }}>Due date</div>
                  <input className="th-input" type="date" value={assignForm.dueDate} onChange={(e)=>setAssignForm(v=>({...v, dueDate:e.target.value}))} />

                  <div style={{ fontSize: 12, color: '#6b7280', margin: '12px 0 6px' }}>Due time</div>
                  <input className="th-input" type="time" value={assignForm.dueTime} onChange={(e)=>setAssignForm(v=>({...v, dueTime:e.target.value}))} />

                  <div style={{ fontSize: 12, color: '#6b7280', margin: '12px 0 6px' }}>Grading</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 8 }}>
                    <input className="th-input" placeholder="Add point" value={assignForm.point} onChange={(e)=>setAssignForm(v=>({...v, point:e.target.value}))} />
                    <div style={{ display:'grid', placeItems:'center', fontSize:12, color:'#6b7280' }}>points</div>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 13 }}>1 point = </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 8 }}>
                    <input className="th-input" placeholder="Add coin" value={assignForm.coin} onChange={(e)=>setAssignForm(v=>({...v, coin:e.target.value}))} />
                    <div style={{ display:'grid', placeItems:'center' }}>🪙</div>
                  </div>

                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                    <PrimaryBtn type="submit" title="Assign">Assign</PrimaryBtn>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 22 }}>
                {/* LEFT */}
                <div className="th-card" style={{ padding: 16, borderRadius: 18, minWidth: 720, marginLeft: 6 }}>
                  <input
                    className="th-input"
                    placeholder="Name Material"
                    value={materialForm.name}
                    onChange={(e)=>setMaterialForm(v=>({...v, name:e.target.value}))}
                    style={{ marginBottom: 12 }}
                  />
                  <textarea
                    className="th-input"
                    placeholder="Write assignment details..."
                    value={materialForm.detail}
                    onChange={(e)=>setMaterialForm(v=>({...v, detail:e.target.value}))}
                    rows={10}
                    style={{ resize: 'vertical' }}
                  />

                  <div style={{ display:'grid', gap:10, marginTop:14 }}>
                    <input
                      className="th-input"
                      type="url"
                      placeholder="YouTube link (optional)"
                      value={materialForm.youtubeUrl}
                      onChange={(e)=>setMaterialForm(v=>({...v, youtubeUrl:e.target.value}))}
                    />
                    <input
                      className="th-input"
                      type="url"
                      placeholder="Other link (optional)"
                      value={materialForm.otherLink}
                      onChange={(e)=>setMaterialForm(v=>({...v, otherLink:e.target.value}))}
                    />
                    <input
                      className="th-input"
                      type="file"
                      multiple
                      accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                      onChange={(e)=>setMaterialForm(v=>({...v, files:e.target.files}))}
                    />
                  </div>
                </div>

                {/* RIGHT */}
                <div className="th-card" style={{ padding: 16, borderRadius: 18 }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>For</div>
                  <select className="th-input" value={materialForm.section} onChange={(e)=>setMaterialForm(v=>({...v, section:e.target.value}))}>
                    <option>M4/1</option><option>M4/2</option>
                  </select>

                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                    <PrimaryBtn type="submit" title="Post">Post</PrimaryBtn>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
