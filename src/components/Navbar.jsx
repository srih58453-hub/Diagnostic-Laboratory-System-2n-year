import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Activity, 
  Users, 
  FileText, 
  FlaskConical, 
  ClipboardCheck, 
  ThermometerSnowflake, 
  CreditCard, 
  BookOpen, 
  LogOut, 
  ShieldCheck,
  Package
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, quickSwitchRole } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['Admin', 'Lab Technician', 'Receptionist', 'Patient'] },
    { id: 'orders', label: 'Test Orders', icon: FileText, roles: ['Admin', 'Lab Technician', 'Receptionist', 'Patient'] },
    { id: 'patients', label: 'Patients', icon: Users, roles: ['Admin', 'Receptionist'] },
    { id: 'samples', label: 'Samples & Cold Unit', icon: FlaskConical, roles: ['Admin', 'Lab Technician'] },
    { id: 'results', label: 'Enter Results', icon: ClipboardCheck, roles: ['Admin', 'Lab Technician'] },
    { id: 'reports', label: 'Lab Reports', icon: FileText, roles: ['Admin', 'Lab Technician', 'Receptionist', 'Patient'] },
    { id: 'catalog', label: 'Tests Catalog', icon: Package, roles: ['Admin', 'Lab Technician', 'Receptionist'] },
    { id: 'esp32', label: 'ESP32 IoT Monitor', icon: ThermometerSnowflake, roles: ['Admin', 'Lab Technician', 'Receptionist', 'Patient'] },
    { id: 'viva', label: 'Internal Exam Guide', icon: BookOpen, roles: ['Admin', 'Lab Technician', 'Receptionist', 'Patient'] },
  ];

  // Filter navigation items based on current logged in user role
  const visibleItems = navItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <header className="bg-slate-950 text-white border-b-2 border-slate-700 shadow-md sticky top-0 z-50">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white font-bold shadow border border-blue-400">
            DL
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2">
              DIAGNOSTIC LABORATORY SYSTEM
              <span className="text-xs bg-blue-900/80 text-blue-200 border border-blue-500/50 px-1.5 py-0.5 rounded font-mono">
                MERN + ESP32
              </span>
            </h1>
            <p className="text-xs text-slate-400">Smart Pathology & Cold-Storage Reagent Monitoring</p>
          </div>
        </div>

        {/* Quick Role Switcher for College Internal Exam / Teacher Demo */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs">
          <span className="text-slate-400 font-medium mr-1">Demo Role:</span>
          {['Admin', 'Lab Technician', 'Receptionist', 'Patient'].map(role => (
            <button
              key={role}
              onClick={() => quickSwitchRole(role)}
              title={`Switch account to ${role}`}
              className={`px-2 py-0.5 rounded transition ${
                user?.role === role
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {role === 'Lab Technician' ? 'Tech' : role}
            </button>
          ))}
        </div>

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              <div className="text-[11px] text-blue-400 font-medium flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400 inline" />
                {user.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-slate-800 hover:bg-red-950/80 hover:text-red-300 hover:border-red-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded text-xs flex items-center gap-1 transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('login')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium shadow"
          >
            Login / Register
          </button>
        )}
      </div>

      {/* Navigation Tabs - Silver & Blue Theme */}
      <nav className="bg-slate-900 border-t border-slate-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-slate-800/80'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
