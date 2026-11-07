import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { login, register, quickSwitchRole } = useAuth();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Controlled form state for Login
  const [loginEmail, setLoginEmail] = useState('admin@lab.com');
  const [loginPassword, setLoginPassword] = useState('admin123');

  // Controlled form state for Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Patient');
  const [regPhone, setRegPhone] = useState('');

  // Handle Login submission with event.preventDefault()
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); // College requirement: Controlled form using event.preventDefault()
    setAlert({ type: '', message: '' });

    // Simple college level validation
    if (!loginEmail || !loginPassword) {
      setAlert({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        setAlert({ type: 'success', message: `Welcome back, ${res.user.name}!` });
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setAlert({ type: 'error', message: res.message || 'Login failed. Check email/password.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'An unexpected error occurred: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration submission with event.preventDefault()
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!regName || !regEmail || !regPassword) {
      setAlert({ type: 'error', message: 'Name, email, and password are required.' });
      return;
    }

    if (regPassword.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    try {
      const res = await register(regName, regEmail, regPassword, regRole, regPhone);
      if (res.success) {
        setAlert({ type: 'success', message: 'Account registered successfully! Logged in as ' + res.user.role });
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setAlert({ type: 'error', message: res.message || 'Registration failed.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Registration error: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 bg-slate-100">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        {/* Silver & Black Header */}
        <div className="bg-slate-900 border-b-2 border-blue-600 px-6 py-4 text-white text-center">
          <div className="inline-block p-2 bg-blue-600/30 rounded border border-blue-500 mb-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold">Diagnostic Laboratory Portal</h2>
          <p className="text-xs text-slate-300">Authentication & Role-Based Access Control</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => { setIsLoginTab(true); setAlert({ type: '', message: '' }); }}
            className={`py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
              isLoginTab
                ? 'bg-white text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Existing User Login
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setAlert({ type: '', message: '' }); }}
            className={`py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
              !isLoginTab
                ? 'bg-white text-blue-700 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            New User Register
          </button>
        </div>

        <div className="p-6">
          <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

          {isLoginTab ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. admin@lab.com"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-4 rounded transition shadow disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Sign In with JWT'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Lab Technician">Lab Technician</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10 digit number"
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-4 rounded transition shadow disabled:opacity-60"
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>
          )}

          {/* Teacher / Viva 1-Click Demo Accounts Section */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
              <span>Quick 1-Click Login (For Internal Exam Evaluation):</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={async () => {
                  setLoginEmail('admin@lab.com');
                  setLoginPassword('admin123');
                  const res = await quickSwitchRole('Admin');
                  if (res.success && onLoginSuccess) onLoginSuccess();
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 p-1.5 rounded text-left transition"
              >
                <div className="font-bold text-slate-900">Admin</div>
                <div className="text-[10px] text-slate-500 font-mono">admin@lab.com</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setLoginEmail('tech@lab.com');
                  setLoginPassword('tech123');
                  const res = await quickSwitchRole('Lab Technician');
                  if (res.success && onLoginSuccess) onLoginSuccess();
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 p-1.5 rounded text-left transition"
              >
                <div className="font-bold text-slate-900">Lab Technician</div>
                <div className="text-[10px] text-slate-500 font-mono">tech@lab.com</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setLoginEmail('reception@lab.com');
                  setLoginPassword('reception123');
                  const res = await quickSwitchRole('Receptionist');
                  if (res.success && onLoginSuccess) onLoginSuccess();
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 p-1.5 rounded text-left transition"
              >
                <div className="font-bold text-slate-900">Receptionist</div>
                <div className="text-[10px] text-slate-500 font-mono">reception@lab.com</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setLoginEmail('rahul@gmail.com');
                  setLoginPassword('patient123');
                  const res = await quickSwitchRole('Patient');
                  if (res.success && onLoginSuccess) onLoginSuccess();
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 p-1.5 rounded text-left transition"
              >
                <div className="font-bold text-slate-900">Patient</div>
                <div className="text-[10px] text-slate-500 font-mono">rahul@gmail.com</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Password for all seeded demo users is their respective role password (e.g. admin123, tech123, reception123, patient123).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
