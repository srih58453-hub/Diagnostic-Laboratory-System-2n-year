import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  ThermometerSnowflake, 
  PlusCircle, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage({ setActiveTab }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to load stats' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Could not fetch dashboard data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 10 seconds to reflect ESP32 readings
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Diagnostic Laboratory Management System
            <span className="text-xs bg-slate-200 text-slate-800 border border-slate-300 font-mono px-2 py-0.5 rounded">
              Role: {user?.role || 'Guest'}
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Logged in as <strong className="text-slate-900">{user?.name}</strong>. Real-time pathology workflow and ESP32 cold-storage telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs px-3 py-1.5 rounded transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
          {user?.role !== 'Patient' && (
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded shadow transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Test Order
            </button>
          )}
        </div>
      </div>

      <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Metrics Row (Silver, Black, Blue) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Patients */}
        <div className="bg-white border border-slate-300 p-3 rounded shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Patients</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {loading ? '...' : stats?.totalPatients ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Registered in system</div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white border border-slate-300 p-3 rounded shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Test Orders</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {loading ? '...' : stats?.totalOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total bookings</div>
        </div>

        {/* Metric 3: In Testing */}
        <div className="bg-white border border-slate-300 p-3 rounded shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Testing</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700">
            {loading ? '...' : stats?.inTestingOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Samples in process</div>
        </div>

        {/* Metric 4: Completed */}
        <div className="bg-white border border-slate-300 p-3 rounded shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            {loading ? '...' : stats?.completedOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Reports generated</div>
        </div>

        {/* Metric 5: Revenue */}
        <div className="bg-white border border-slate-300 p-3 rounded shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Revenue</span>
            <IndianRupee className="w-4 h-4 text-slate-800" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            ₹{loading ? '...' : stats?.totalRevenue ?? 0}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Collected payments</div>
        </div>

        {/* Metric 6: Cold Storage Samples */}
        <div className="bg-white border border-slate-300 p-3 rounded shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cold Samples</span>
            <ThermometerSnowflake className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-blue-700">
            {loading ? '...' : stats?.samplesInColdStorage ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">In ESP32 Unit #1</div>
        </div>
      </div>

      {/* Featured ESP32 IoT Live Refrigerator Card */}
      <div className={`border rounded shadow-sm p-4 transition ${
        stats?.esp32Status?.isSafe
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white border-blue-800'
          : 'bg-red-950 text-white border-red-700'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded border ${
              stats?.esp32Status?.isSafe ? 'bg-blue-600/30 border-blue-400' : 'bg-red-600/30 border-red-400'
            }`}>
              <ThermometerSnowflake className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-slate-300">
                  ESP32 IoT Node: ESP32-LAB-COLD-01
                </span>
                {stats?.esp32Status?.isSafe ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Safe Storage (2°C - 8°C)
                  </span>
                ) : (
                  <span className="bg-red-500/30 text-red-200 border border-red-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3 h-3" /> TEMPERATURE ALERT!
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Pathology Reagent & Specimen Cold Unit #1
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {stats?.esp32Status?.alertMessage || 'Monitoring cold chain for blood, serum and urine specimens.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400">Current Temp</div>
              <div className="text-2xl font-bold text-blue-400 font-mono">
                {stats?.esp32Status?.currentTemp?.toFixed(1) ?? '4.0'}°C
              </div>
            </div>

            <div className="text-right border-l border-slate-700 pl-4">
              <div className="text-xs text-slate-400">Humidity</div>
              <div className="text-2xl font-bold text-slate-200 font-mono">
                {stats?.esp32Status?.currentHumidity?.toFixed(1) ?? '48.0'}%
              </div>
            </div>

            <button
              onClick={() => setActiveTab('esp32')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded font-medium shadow flex items-center gap-1 transition"
            >
              ESP32 Console & Hardware Code <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Cards for College Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Core Workflow */}
        <div className="bg-white border border-slate-300 rounded p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">
            Core Lab Workflow
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center justify-between">
              <span>1. Register Patient & Book Order</span>
              <button onClick={() => setActiveTab('orders')} className="text-blue-600 hover:underline font-medium">Open</button>
            </li>
            <li className="flex items-center justify-between">
              <span>2. Collect Sample & Store in Cold Unit</span>
              <button onClick={() => setActiveTab('samples')} className="text-blue-600 hover:underline font-medium">Open</button>
            </li>
            <li className="flex items-center justify-between">
              <span>3. Enter Test Results & Ranges</span>
              <button onClick={() => setActiveTab('results')} className="text-blue-600 hover:underline font-medium">Open</button>
            </li>
            <li className="flex items-center justify-between">
              <span>4. Pathologist Report Verification</span>
              <button onClick={() => setActiveTab('reports')} className="text-blue-600 hover:underline font-medium">Open</button>
            </li>
          </ul>
        </div>

        {/* Card 2: Technical Architecture (For Teacher Viva) */}
        <div className="bg-white border border-slate-300 rounded p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">
            System Architecture
          </h3>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div><strong className="text-slate-800">Frontend:</strong> React + Vite, Context API, JSX, Controlled Forms</div>
            <div><strong className="text-slate-800">Backend:</strong> Node.js, Express, Separate Routers & Controllers</div>
            <div><strong className="text-slate-800">Database:</strong> MongoDB Atlas Schemas & Models</div>
            <div><strong className="text-slate-800">IoT Hardware:</strong> ESP32 with DHT22 Sensor over HTTP POST</div>
            <div><strong className="text-slate-800">Security:</strong> JWT Auth + bcrypt Password Hashing + RBAC</div>
          </div>
          <button
            onClick={() => setActiveTab('viva')}
            className="mt-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1 rounded w-full text-center font-medium block"
          >
            Open College Viva Q&A Guide
          </button>
        </div>

        {/* Card 3: Role Privileges Quick Summary */}
        <div className="bg-white border border-slate-300 rounded p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3">
            Role Access Matrix (RBAC)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">Admin</span>
              <span className="text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">Full System Access</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">Lab Technician</span>
              <span className="text-[11px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">Samples, Results, ESP32</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">Receptionist</span>
              <span className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">Patients, Orders, Billing</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">Patient</span>
              <span className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">View Reports & Orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
