import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import StudySessionCreate from './pages/StudySessions/StudySessionCreate';
import StudySessionList from './pages/StudySessions/StudySessionList';
import StatsPage from './pages/Stats/StatsPage';
import StudySessionEdit from './pages/StudySessions/StudySessionEdit';
import AdminRoute from './components/common/AdminRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ExamYears from './pages/Admin/ExamYears';
import TopicQuestions from './pages/Admin/TopicQuestions';
import Users from './pages/Admin/Users';
import PomodoroTimer from './pages/Pomodoro/PomodoroTimer';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/study-sessions/create"
              element={
                <ProtectedRoute>
                  <StudySessionCreate />
                </ProtectedRoute>
              }
            />

            <Route
              path="/study-sessions"
              element={
                <ProtectedRoute>
                  <StudySessionList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <StatsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/study-sessions/:id/edit"
              element={
                <ProtectedRoute>
                  <StudySessionEdit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/exam-years"
              element={
                <AdminRoute>
                  <ExamYears />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/topic-questions"
              element={
                <AdminRoute>
                  <TopicQuestions />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
            <Route
              path="/pomodoro"
              element={<PomodoroTimer />}
            />
              

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;