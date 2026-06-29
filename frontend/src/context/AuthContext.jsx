import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await API.get('/users/profile');
      setUser(data);
    } catch (err) {
      console.error('Fetch profile error:', err.response?.data?.message || err.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);
  const login = async (emailOrUsername, password) => {
    try {
      const { data } = await API.post('/auth/login', { emailOrUsername, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success(`Welcome back, ${data.username}!`);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      toast.error(errMsg);
      return false;
    }
  };
  const register = async (username, email, password) => {
    try {
      const { data } = await API.post('/auth/register', { username, email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success(`Account created! Welcome, ${data.username}!`);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      toast.error(errMsg);
      return false;
    }
  };
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };
  const updateProfile = async (formData) => {
    try {
      const isMultipart = formData instanceof FormData;
      const { data } = await API.put('/users/profile', formData, {
        headers: {
          'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json'
        }
      });
      setUser(prev => ({ ...prev, ...data }));
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Profile update failed';
      toast.error(errMsg);
      return false;
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
