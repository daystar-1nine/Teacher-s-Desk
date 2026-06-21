import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { AttendanceGrid } from './pages/attendance/AttendanceGrid';
import { HomeworkHub } from './pages/homework/HomeworkHub';
import { Grades } from './pages/grades/Grades';
import { MeetingsList } from './pages/classrooms/MeetingsList';
import { AiCockpit } from './pages/ai/AiCockpit';
import { Login } from './pages/auth/Login';
import { AdminLogin } from './pages/auth/AdminLogin';
import { Unauthorized } from './pages/auth/Unauthorized';
import { RequireAuth } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing & Login Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Layout Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<AttendanceGrid />} />
            <Route path="/homework" element={<HomeworkHub />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/classrooms" element={<MeetingsList />} />
            <Route path="/ai" element={<AiCockpit />} />
          </Route>
        </Route>

        {/* Catch All redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
