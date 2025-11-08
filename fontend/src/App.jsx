import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import Signup from './Signup'
import TeacherHome from './TeacherHome'
import StudentHome from './StudentHome'
import Classroom from './Classroom'
import CalendarTeacher from './CalendarTeacher'
import StudentCalendar from './StudentCalendar'
import AssignStudent from './AssignStudent'
import ClassroomAssignments from './Assignmentpost'
import AssignmentReview from './AssignmentReview'
import AssignmentGrade from './AssignmentGrade'
import MaterialDetail from './MaterialDetail'
import QuizzTeacher from './QuizzTeacher'
import QuizManage from './QuizManage'; 
import AssignmentTeacher from './AssignmentTeacher';
import Meet from "./Meet.jsx"
import Dashboard from "./Dashboard";
import Members from './Members.jsx'
import Grades from './Grades.jsx'
import DoQuiz from "./DoQuiz";
import StudentQuiz from "./StudentQuiz";
import Store from './Store'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/teacher" element={<TeacherHome />} />
      <Route path="/student" element={<StudentHome />} />
  <Route path="/calendar" element={<CalendarTeacher />} />
  <Route path="/student/calendar" element={<StudentCalendar />} />
      <Route path="/classroom" element={<Classroom />} />
      <Route path="/assignment/:assignmentId" element={<AssignmentGrade />} />
      <Route path="/material/:materialId" element={<MaterialDetail />} />
      <Route path="/classroom/assignments" element={<ClassroomAssignments />} />
      <Route path="/assignments/review" element={<AssignmentReview />} />
  <Route path="/quiz" element={<QuizzTeacher />} />
  <Route path="/student/quiz" element={<StudentQuiz />} />
  <Route path="/assign-student" element={<AssignStudent />} />
  <Route path="/cart" element={<Navigate to="/store" replace />} />
  <Route path="/store" element={<Store />} />
      <Route path="/quiz/:quizId" element={<QuizManage />} />
      <Route path="/assignments/manage/:assignmentId" element={<AssignmentTeacher />} />
      <Route path="/meet" element={<Meet/>} />
      <Route path="/classroom/dashboard" element={<Dashboard />} />
      <Route path="/classroom/members" element={<Members/>} />
      <Route path="/classroom/grades" element={<Grades/>} />
  <Route path="/student/quiz/do/:id" element={<DoQuiz />} />
    
      <Route path="*" element={<Navigate to="/" replace />} />
    
    </Routes>
  )
}
