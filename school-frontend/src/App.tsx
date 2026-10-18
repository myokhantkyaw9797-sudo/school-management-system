import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './auth/store/useAuthStore';
import { ProtectedRoute } from './auth/page/ProtectedRoute';
import { LoginPage } from './public-page/LoginPage';
import { UnauthorizePage } from './public-page/UnauthorizePage';
import { Header } from './public-page/Header';
import { HomePage } from './public-page/HomePage';

import { TeacherPage } from './teacher/page/TeacherPage';
import StudentPage from './student/pages/StudentPage'; 
import { ExamMarkPage } from './exam-mark/ExamMarkPage';
import { StudentProfileForm } from './student/components/StudentProfileForm';
function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-emerald-50 text-gray-800">
        {isAuthenticated && <Header />}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/unauthorized" element={<UnauthorizePage />} />

          {/* Teacher & Principal Shared Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_PRINCIPAL', 'PRINCIPAL', 'ROLE_TEACHER', 'TEACHER']} />}>
            <Route path="/teacher/dashboard" element={<TeacherPage />} />
            <Route path="/students" element={<StudentPage />} />
            <Route path="/exam-marks" element={<ExamMarkPage />} /> 
            <Route path="/student-profile" element={<StudentProfileForm />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;