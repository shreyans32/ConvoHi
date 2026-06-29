import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { Loader2 } from 'lucide-react';
// Guard for private paths
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-850 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg text-2xl font-black animate-bounce">
            Hi
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-2">
            <span className="text-gray-900 dark:text-white">Convo</span>
            <span className="logo-gradient-text">Hi</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-8 text-sm font-semibold text-gray-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-[#3B82F6]" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};
// Guard to prevent authenticated users from opening login/register pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
       <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-850 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg text-2xl font-black animate-pulse">
            Hi
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-2">
            <span className="text-gray-900 dark:text-white">Convo</span>
            <span className="logo-gradient-text">Hi</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-8 text-sm font-semibold text-gray-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-[#3B82F6]" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }
  return !user ? children : <Navigate to="/" replace />;
};
function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
export default App;
