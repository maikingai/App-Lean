import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()
  // ปรับได้ง่ายถ้าต้องจูนสีเพิ่ม (ตอนนี้ตั้งให้ตรงกับภาพตัวอย่าง)
  const C = {
    bg:        '#8FB6FF',   // ฟ้าเต็มจอด้านหลัง
    cardBg:    '#FFFFFF',   // กล่องขาว
    title:     '#2F2F2F',   // สีหัวข้อ Login
    inputBg:   '#E7E7E7',   // ช่องกรอกเทาอ่อน
    inputText: '#4A4A4A',
    placeholder: '#9CA3AF',
    btnBg:     '#0FB0A0',   // ปุ่มเขียวอมฟ้า (teal)
    btnText:   '#FFFFFF',
    hint:      '#9FA6B2',   // ข้อความเทาใต้ปุ่ม
    link:      '#F2994A',   // ลิงก์ส้ม "Sign Up"
    shadow:    '0 16px 40px rgba(0,0,0,0.12)'
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
      {/* โลโก้ด้านบน (ใช้ภาพเดียวกับหน้าโฮม) */}
      <div
        aria-hidden
        style={{
          width: 'min(980px, 96%)',
          height: 220,
          backgroundImage: 'url(/logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          marginTop: 32
        }}
      />

      {/* กล่องฟอร์ม */}
      <div
        style={{
          width: 'min(720px, 92%)',
          background: C.cardBg,
          borderRadius: 16,
          boxShadow: C.shadow,
          padding: 24,
          marginTop: 12,
          marginBottom: 40
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            color: C.title,
            fontSize: 28,
            fontWeight: 600,
            margin: '8px 0 18px'
          }}
        >
          Login
        </h2>

        <form
          onSubmit={(e) => {
            
            e.preventDefault()
            e.preventDefault()
            navigate('/teacher')
            const role = 'teacher'               // <-- ฮาร์ดโค้ดชั่วคราวให้เป็น teacher ตลอด
            localStorage.setItem('role', role)
            if (role === 'teacher') navigate('/teacher')
            else navigate('/student')
            // TODO: ใส่ลอจิกเข้าสู่ระบบ
          }}
          style={{ display: 'grid', gap: 14, padding: '0 12px 6px' }}
        >
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ position: 'absolute', height: 0, width: 0, overflow: 'hidden' }}>
              Email
            </span>
            <input
              type="email"
              placeholder="Email"
              required
              style={{
                background: C.inputBg,
                border: '0',
                borderRadius: 10,
                padding: '14px 16px',
                fontSize: 16,
                color: C.inputText,
                outline: 'none'
              }}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px rgba(15,176,160,.20)')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
            />
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ position: 'absolute', height: 0, width: 0, overflow: 'hidden' }}>
              Password
            </span>
            <input
              type="password"
              placeholder="Password"
              required
              style={{
                background: C.inputBg,
                border: '0',
                borderRadius: 10,
                padding: '14px 16px',
                fontSize: 16,
                color: C.inputText,
                outline: 'none'
              }}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px rgba(15,176,160,.20)')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
            />
          </label>

          <button
            type="submit"
            style={{
              marginTop: 6,
              background: C.btnBg,
              color: C.btnText,
              border: 0,
              borderRadius: 10,
              padding: '14px 16px',
              fontSize: 22,
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onMouseDown={(e) => (e.currentTarget.style.filter = 'brightness(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.filter = 'none')}
          >
            Login
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            color: C.hint,
            marginTop: 8,
            marginBottom: 6,
            fontSize: 14
          }}
        >
          Do not have an account??
          {' '}
          <Link to="/signup" style={{ color: C.link, textDecoration: 'underline' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
