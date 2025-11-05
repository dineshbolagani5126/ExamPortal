import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExamList from './pages/student/ExamList';
import ExamInterface from './pages/student/ExamInterface';
import Results from './pages/student/Results';
import StudentProfile from './pages/student/StudentProfile';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import ManageExams from './pages/faculty/ManageExams';
import CreateExam from './pages/faculty/CreateExam';
import QuestionBank from './pages/faculty/QuestionBank';
import EvaluateExams from './pages/faculty/EvaluateExams';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import SystemAnalytics from './pages/admin/SystemAnalytics';

// Common Pages
import Notifications from './pages/common/Notifications';
import NotFound from './pages/common/NotFound';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Loading from './components/Loading';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}`} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Student Routes */}
        <Route path="/student" element={<PrivateRoute role="student"><Layout /></PrivateRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<ExamList />} />
          <Route path="exam/:examId" element={<ExamInterface />} />
          <Route path="results" element={<Results />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Faculty Routes */}
        <Route path="/faculty" element={<PrivateRoute role="faculty"><Layout /></PrivateRoute>}>
          <Route index element={<FacultyDashboard />} />
          <Route path="exams" element={<ManageExams />} />
          <Route path="exams/create" element={<CreateExam />} />
          <Route path="exams/edit/:examId" element={<CreateExam />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="evaluate" element={<EvaluateExams />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute role="admin"><Layout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="exams" element={<ManageExams />} />
          <Route path="exams/create" element={<CreateExam />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="analytics" element={<SystemAnalytics />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={
          user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/login" />
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
