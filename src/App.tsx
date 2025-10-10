import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import { authService } from './services/auth.service';

// Import pages
import Login from './pages/auth/Login';
import Unauthorized from './pages/auth/Unauthorized';
import Dashboard from './pages/Dashboard';
import Instructors from './pages/Instructors';
import Courses from './pages/Courses';
import AddCourse from './pages/AddCourse';
import EditCourse from './pages/EditCourse';
import ViewCourse from './pages/ViewCourse';
import NotFound from './pages/NotFound';

function App() {
  const RouteGuard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
      if (import.meta.env.DEV) return;

      const publicPaths = ['/login', '/unauthorized'];
      if (publicPaths.includes(location.pathname)) return;

      if (!authService.isAuthenticated()) {
        navigate('/login', { state: { from: location }, replace: true });
      }
    }, [location.pathname, navigate]);

    return null;
  };

  return (
    <Router>
      <RouteGuard />
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
          <Route
            path="/courses/add"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddCourse />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditCourse />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/view/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ViewCourse />
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