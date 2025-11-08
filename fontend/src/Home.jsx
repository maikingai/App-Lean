import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import pb from './pbClient'

export default function Home() {
  const navigate = useNavigate()
  useEffect(() => {
    // if user already logged in, redirect to their home based on role
    const token = pb.authStore?.token || localStorage.getItem('pb_token')
    const role = localStorage.getItem('role')
    if (token) {
      if (role === 'student') navigate('/student')
      else navigate('/teacher')
    }
  }, [])
  return (
    <div
      onClick={() => navigate('/login')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/login')}
      title="คลิกที่ใดก็ได้เพื่อไปหน้า Login"
      aria-label="ไปหน้า Login"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/logo1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000',
        cursor: 'pointer',
      }}
    />
  )
}
