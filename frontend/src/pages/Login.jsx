import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquareCode, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) return;
    
    setLoading(true);
    const success = await login(emailOrUsername, password);
    setLoading(false);
    
    if (success) {
      navigate('/');
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-200/50 bg-white p-8 shadow-xl dark:border-gray-800/50 dark:bg-gray-900 glass-effect">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg text-2xl font-black transform hover:rotate-6 transition-all duration-300">
            Hi
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Welcome to <span className="logo-gradient-text">ConvoHi</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Connect instantly. Chat securely.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Email or Username
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-chat-light-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-chat-light-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-chat-dark-primary dark:focus:bg-gray-900 dark:focus:ring-chat-dark-primary"
                  placeholder="Enter email or username"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-chat-light-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-chat-light-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-chat-dark-primary dark:focus:bg-gray-900 dark:focus:ring-chat-dark-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-chat-light-primary dark:bg-chat-dark-primary py-3 px-4 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-chat-light-primary focus:ring-offset-2 dark:focus:ring-chat-dark-primary disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          New to ConvoHi?{' '}
          <Link
            to="/register"
            className="font-semibold text-chat-light-primary dark:text-chat-dark-primary hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
