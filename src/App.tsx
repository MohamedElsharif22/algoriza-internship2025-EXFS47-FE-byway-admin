import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import Login from './pages/auth/Login';
import Unauthorized from './pages/auth/Unauthorized';
import Dashboard from './pages/Dashboard';
import Instructors from './pages/Instructors';
import Courses from './pages/Courses';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructors"
            element={
              <ProtectedRoute>
                <Layout>
                  <Instructors />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Layout>
                  <Courses />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <ToastContainer 
          position="top-right"
          className="mt-16"
        />
      </div>
    </Router>
  );
}

export default App;