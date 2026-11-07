import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import SamplesPage from './pages/SamplesPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import TestsCatalogPage from './pages/TestsCatalogPage.jsx';
import Esp32Page from './pages/Esp32Page.jsx';
import VivaGuidePage from './pages/VivaGuidePage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Initializing Diagnostic Laboratory Portal...
        </div>
      </div>
    );
  }

  // If user is not logged in and not on login tab, prompt login or let them see guest preview
  const renderCurrentTab = () => {
    if (!user && activeTab !== 'login' && activeTab !== 'viva' && activeTab !== 'esp32') {
      return <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'orders':
        return <OrdersPage setActiveTab={setActiveTab} setSelectedOrderId={setSelectedOrderId} />;
      case 'patients':
        return <PatientsPage />;
      case 'samples':
        return <SamplesPage selectedOrderId={selectedOrderId} />;
      case 'results':
        return <ResultsPage selectedOrderId={selectedOrderId} />;
      case 'reports':
        return <ReportsPage selectedOrderId={selectedOrderId} />;
      case 'catalog':
        return <TestsCatalogPage />;
      case 'esp32':
        return <Esp32Page />;
      case 'viva':
        return <VivaGuidePage />;
      case 'login':
        return <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {renderCurrentTab()}
      </main>

      {/* Silver & Black Academic Project Footer */}
      <footer className="bg-slate-950 border-t-2 border-slate-800 text-slate-400 text-xs py-5 px-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-200">
              Topic 22: Diagnostic Laboratory Management System
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Built with: React (Vite, Context API), Node.js, Express, MongoDB Atlas Mongoose Models, ESP32 IoT Node.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded font-mono">
              Role Access: Admin • Lab Tech • Receptionist • Patient
            </span>
            <button
              onClick={() => setActiveTab('viva')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium px-2.5 py-1 rounded transition"
            >
              Open Viva Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
