import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
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
