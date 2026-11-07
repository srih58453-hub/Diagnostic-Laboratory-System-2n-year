import React, { createContext, useContext, useState, useEffect } from 'react';

// Create React Context for Authentication (Context API as per syllabus)
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token and user exist in browser localStorage on initial page load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('lab_token');
      const storedUser = localStorage.getItem('lab_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error reading localStorage for auth:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function calling Node.js Express backend
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user to state and localStorage
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('lab_token', data.token);
      localStorage.setItem('lab_user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Register function calling Node.js Express backend
  const register = async (name, email, password, role, phone) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('lab_token', data.token);
      localStorage.setItem('lab_user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lab_token');
    localStorage.removeItem('lab_user');
  };

  // Quick switch role (for college internal exam demonstration)
  const quickSwitchRole = async (targetRole) => {
    let email = 'admin@lab.com';
    let pass = 'admin123';
    if (targetRole === 'Lab Technician') {
      email = 'tech@lab.com';
      pass = 'tech123';
    } else if (targetRole === 'Receptionist') {
      email = 'reception@lab.com';
      pass = 'reception123';
    } else if (targetRole === 'Patient') {
      email = 'rahul@gmail.com';
      pass = 'patient123';
    }
    return await login(email, pass);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickSwitchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook to consume AuthContext easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
