import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './teacher-home.css'
import TeacherSidebar from './TeacherSidebar'

export default function MaterialDetail() {
  const navigate = useNavigate()
  const { materialId } = useParams()

  // ===== Profile / Logout =====
  const [showProfile, setShowProfile] = useState(false)
  const handleLogout = () => {
    localStorage.removeItem('role')
    setShowProfile(false)
    navigate('/login')
  }

  const IconBtn = ({ title, onClick, children }) => (
    <button className="th-iconbtn" title={title} aria-label={title} onClick={onClick}>
      {children ?? <span className="th-icon-placeholder">◎</span>}
    </button>
  )

  // ====== ข้อมูลโพสต์ (Material) ======
  const [postTitle, setPostTitle] = useState(`Matrix (Material #${materialId})`)
  const [postDesc, setPostDesc]   = useState('................................')
  const [postedMeta] = useState('Thanchanok Konsuag · 26 Sep. 2025')

  // แนบไฟล์ตัวอย่าง (อ่านอย่างเดียว)
  const [pdfs] = useState([{ name: 'Matrix_Notes.pdf', url: '#' }])
  const [links] = useState([
    { title: 'Matrix Lecture (YouTube)', url: 'https://www.youtube.com/live/qVt_fdsvHqw?si=-KDf46PEraWlf3Zo' }
  ])

  // ====== คอมเมนต์ ======
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState('')

  const submitComment = () => {
    const text = commentInput.trim()
    if (!text) return
    setComments(prev => [...prev, { id: Date.now(), author: 'You', text }])
    setCommentInput('')
  }
  const deleteComment = (id) => setComments(prev => prev.filter(c => c.id !== id))

  // ====== เมนูแก้ไขโพสต์ ======
  const [openPostMenu, setOpenPostMenu] = useState(false)
  const [showEditPost, setShowEditPost] = useState(false)
  const [editDraft, setEditDraft] = useState({ title: '', desc: '' })

  const openEdit = () => {
    setOpenPostMenu(false)
    setEditDraft({ title: postTitle, desc: postDesc })
    setShowEditPost(true)
  }
  const saveEdit = (e) => {
    e?.preventDefault?.()
    setPostTitle(editDraft.title.trim() || postTitle)
    setPostDesc(editDraft.desc.trim()   || postDesc)
    setShowEditPost(false)
  }

  return (
    <div className="th-root">
      {/* Shared teacher sidebar */}
      <TeacherSidebar />

      {/* ===== Main ===== */}
      <main className="th-main th-main-rel">
        {/* Topbar: โปรไฟล์ + logout */}
        <div className="th-topbar" style={{ justifyContent: 'flex-end' }}>
          <button className="th-avatar" title="profile" onClick={() => setShowProfile(v => !v)}>🙂</button>
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 18, margin: '6px 0 12px' }}>
          {['Classroom', 'Assignments', 'Members', 'Grades', 'Dashboard'].map((label, i) => (
            <button
              key={label}
              style={{
                background: 'transparent',
                border: 0,
                padding: '8px 4px',
                fontWeight: 600,
                color: i === 0 ? '#1f2937' : '#2c3e50',
                borderBottom: `3px solid ${i === 0 ? '#ffffff' : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ===== การ์ดโพสต์ (Material) ===== */}
        <section
          className="th-card th-card--fluid"
          style={{
            padding: 0,
            borderRadius: 16,
            width: '97%',
            maxWidth: 980,
            minHeight: 160,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'stretch',
            overflow: 'hidden'
          }}
        >
          {/* ซ้าย: เนื้อหาหลัก */}
          <div style={{
            width: '100%',
            minHeight: '100%',
            display: 'grid',
            gridAutoRows: 'auto',
            gap: 12,
            padding: 16,
            boxSizing: 'border-box',
            alignItems: 'start'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#E9F0FF', display: 'grid', placeItems: 'center' }}>📚</div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{postTitle}</div>
                <div style={{ fontSize: 12, color: '#6b7c93' }}>{postedMeta}</div>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(0,0,0,.08)' }} />

            {/* Attachments */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {pdfs.map((f, i) => (
                <div key={`pdf-${i}`} className="th-card" style={{ width: 220, height: 88, borderRadius: 14, boxShadow: 'none', background: '#f8fbff' }}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      height: 64,
                      margin: 12,
                      borderRadius: 12,
                      background: '#fff',
                      display: 'grid',
                      alignContent: 'center',
                      paddingLeft: 10,
                      gap: 2,
                      textDecoration: 'none'
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#7A8BA6' }}>PDF</div>
                  </a>
                </div>
              ))}

              {links.map((v, i) => (
                <div key={`link-${i}`} className="th-card" style={{ width: 280, height: 88, borderRadius: 14, boxShadow: 'none', background: '#f8fbff' }}>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      height: 64,
                      margin: 12,
                      borderRadius: 12,
                      background: '#fff',
                      display: 'grid',
                      gridTemplateColumns: '96px 1fr',
                      gap: 8,
                      alignItems: 'center',
                      textDecoration: 'none',
                      paddingRight: 10
                    }}
                  >
                    <div style={{ width: 96, height: 52, borderRadius: 8, background: '#e8eefc', display: 'grid', placeItems: 'center', fontSize: 12 }}>Link</div>
                    <div>
                      <div style={{ fontSize: 12, color: '#111827' }}>{v.title}</div>
                      <div style={{ fontSize: 11, color: '#7A8BA6' }}>External</div>
                    </div>
                  </a>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ color: '#6b7c93', fontSize: 14, wordBreak: 'break-word' }}>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Description</span>
              <span> {postDesc}</span>
            </div>
          </div>

          {/* ขวา: เมนู ⋯ (ไม่มี Due สำหรับ Material) */}
          <div style={{
            width: 220,
            borderLeft: '1px solid rgba(0,0,0,.06)',
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            alignContent: 'start'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
              <button
                title="more"
                onClick={() => setOpenPostMenu(v => !v)}
                style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer', margin: 10 }}
              >⋯</button>

              {openPostMenu && (
                <>
                  <div
                    onClick={() => setOpenPostMenu(false)}
                    style={{ position: 'fixed', inset: 0, background: 'transparent' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 40, right: 10,
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 12px 28px rgba(0,0,0,.15)',
                      overflow: 'hidden',
                      zIndex: 5
                    }}
                  >
                    <button
                      onClick={openEdit}
                      style={{ display: 'block', padding: '10px 14px', width: 160, background: 'transparent', border: 0, textAlign: 'left', cursor: 'pointer' }}
                    >Edit post</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ===== คอมเมนต์ ===== */}
        <section className="th-card th-card--fluid" style={{ marginTop: 16, borderRadius: 16, padding: 0 }}>
          <div style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
            Class comments
          </div>

          {/* ลิสต์คอมเมนต์ */}
          <div style={{ display: 'grid', gap: 10, padding: '12px 16px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 24px', gap: 10, alignItems: 'start' }}>
                <div style={{ width: 28, height: 28, borderRadius: 16, background: '#A3E887', display: 'grid', placeItems: 'center' }}>
                  {c.author[0]?.toUpperCase() || 'Y'}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>{c.author}</div>
                  <div style={{ fontSize: 14, color: '#334155' }}>{c.text}</div>
                </div>
                <button
                  title="remove"
                  onClick={() => deleteComment(c.id)}
                  style={{ border: 0, background: 'transparent', color: '#E11D48', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                >ⓧ</button>
              </div>
            ))}
          </div>

          {/* กล่องพิมพ์คอมเมนต์ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 40px',
            alignItems: 'center',
            gap: 10,
            padding: '12px',
            borderTop: '1px solid rgba(0,0,0,.06)',
            background: '#fff'
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 16, background: '#A3E887', display: 'grid', placeItems: 'center' }}>🙂</div>
            <input
              className="th-input"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment() }}
              style={{ height: 40, borderRadius: 999, background: '#e9f0ff', border: 0, padding: '0 14px' }}
            />
            <button title="send" onClick={submitComment}
              style={{ width: 36, height: 36, borderRadius: 999, border: 0, background: '#111827', color: '#fff', cursor: 'pointer' }}>
              ➤
            </button>
          </div>
        </section>
      </main>

      {/* ===== Modal แก้ไขโพสต์ ===== */}
      {showEditPost && (
        <div className="th-modal-backdrop" onClick={() => setShowEditPost(false)}>
          <form className="th-modal" onClick={(e)=>e.stopPropagation()} onSubmit={saveEdit}>
            <div className="th-modal-title">Edit Post</div>
            <div className="th-modal-body" style={{ display: 'grid', gap: 10 }}>
              <input
                className="th-input"
                type="text"
                placeholder="Title"
                value={editDraft.title}
                onChange={(e)=>setEditDraft(v=>({...v, title:e.target.value}))}
              />
              <textarea
                className="th-input"
                rows={4}
                placeholder="Description"
                value={editDraft.desc}
                onChange={(e)=>setEditDraft(v=>({...v, desc:e.target.value}))}
              />
            </div>
            <div className="th-modal-actions">
              <button type="button" className="th-btn-cancel" onClick={()=>setShowEditPost(false)}>cancel</button>
              <button type="submit" className="th-btn-save">save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
