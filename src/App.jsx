import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import Signup from './Signup'
import TeacherHome from './TeacherHome'
import Classroom from './Classroom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/teacher" element={<TeacherHome />} />
      <Route path="/classroom" element={<Classroom />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

