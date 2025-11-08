import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiFetch from './api'

export default function Signup() {
  const [role, setRole] = useState('teacher')
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)

  const C = {
    bg:        '#8FB6FF',   
    cardBg:    '#FFFFFF',   
    title:     '#2F2F2F',
    inputBg:   '#E7E7E7',
    inputText: '#4A4A4A',
    btnBg:     '#0FB0A0',   
    btnText:   '#FFFFFF',
    hint:      '#9FA6B2',
    link:      '#F2994A',   
    shadow:    '0 16px 40px rgba(0,0,0,0.12)',

    // ปุ่มเลือกบทบาท
    teacherBg: '#FFE666',   
    teacherText: '#6B5D00',
    studentText: '#9FA6B2',
    border: '#CFCFCF'
  }

  // named submit handler to avoid event scoping issues
  async function handleSubmit(e) {
    e?.preventDefault?.();
    const form = e?.target;
    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    const parts = name.split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ') || '';
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, role })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = (data && (data.message || JSON.stringify(data))) || 'Signup failed';
        setStatus({ type: 'error', text: msg });
        return;
      }
  // on successful registration, redirect to login page
  navigate('/login');
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: 'ลงทะเบียนไม่สำเร็จ' });
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* โลโก้ด้านบน */}
      <div
        aria-hidden
        style={{
          width: 'min(980px, 96%)',
          height: 180,
          backgroundImage: 'url(/logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          marginTop: 24
        }}
      />

      {/* กล่องฟอร์ม */}
      <div
        style={{
          width: 'min(720px, 92%)',
          background: C.cardBg,
          borderRadius: 12,
          boxShadow: C.shadow,
          padding: 24,
          marginTop: 8,
          marginBottom: 28
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            color: C.title,
            fontSize: 24,
            fontWeight: 600,
            margin: '0 0 14px'
          }}
        >
          Sign Up
        </h2>

        {/* inline status message */}
        {status?.text && (
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <small style={{ color: status.type === 'error' ? '#D14343' : '#1f8a3d' }}>{status.text}</small>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          {/* Name */}
          <div style={{ display: 'grid', gap: 6 }}>
            <small style={{ color: C.hint }}>Name</small>
            <input
              type="text"
              placeholder=""
              required
              style={{
                background: C.inputBg,
                border: '1px solid #BDBDBD',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 16,
                color: C.inputText,
                outline: 'none'
              }}
            />
          </div>

          {/* Email */}
          <div style={{ display: 'grid', gap: 6 }}>
            <small style={{ color: C.hint }}>Email</small>
            <input
              type="email"
              required
              style={{
                background: C.inputBg,
                border: '1px solid #BDBDBD',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 16,
                color: C.inputText,
                outline: 'none'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'grid', gap: 6 }}>
            <small style={{ color: C.hint }}>Password</small>
            <input
              type="password"
              required
              style={{
                background: C.inputBg,
                border: '1px solid #BDBDBD',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 16,
                color: C.inputText,
                outline: 'none'
              }}
            />
          </div>

          {/* Role selector */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginTop: 6,
              alignItems: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => setRole('teacher')}
              style={{
                background: role === 'teacher' ? C.teacherBg : 'transparent',
                color: role === 'teacher' ? C.teacherText : C.studentText,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Teacher
            </button>

            <button
              type="button"
              onClick={() => setRole('student')}
              style={{
                background: role === 'student' ? C.teacherBg : 'transparent',
                color: role === 'student' ? C.teacherText : C.studentText,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 16,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Student
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              marginTop: 8,
              background: C.btnBg,
              color: C.btnText,
              border: 0,
              borderRadius: 8,
              padding: '14px 16px',
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </form>

        {/* Footer link */}
        <p
          style={{
            textAlign: 'center',
            color: C.hint,
            marginTop: 10,
            fontSize: 12
          }}
        >
          Already have an account??{' '}
          <Link to="/login" style={{ color: C.link, textDecoration: 'underline' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
