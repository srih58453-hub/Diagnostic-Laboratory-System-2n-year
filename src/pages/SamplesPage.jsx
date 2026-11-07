import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { FlaskConical, ThermometerSnowflake, QrCode, CheckCircle, Plus, Search, ShieldCheck } from 'lucide-react';

export default function SamplesPage({ selectedOrderId }) {
  const { user, token } = useAuth();

  const [samples, setSamples] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Collect sample form state
  const [orderId, setOrderId] = useState(selectedOrderId || '');
  const [sampleType, setSampleType] = useState('Blood (EDTA Tube)');
  const [storageUnit, setStorageUnit] = useState('ESP32 Cold Unit #1 (2°C - 8°C)');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Samples
      const smpRes = await fetch(`/api/samples?search=${searchTerm}`, { headers });
      const smpData = await smpRes.json();
      if (smpData.success) {
        setSamples(smpData.samples);
      }

      // 2. Fetch Orders that need sample collection
      const ordRes = await fetch('/api/orders', { headers });
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders(ordData.orders);
        if (!orderId && ordData.orders.length > 0) {
          const pending = ordData.orders.find(o => o.status === 'Pending') || ordData.orders[0];
          setOrderId(pending.orderId);
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load samples: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, searchTerm]);

  // Handle sample collection with event.preventDefault()
  const handleCollectSample = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!orderId) {
      setAlert({ type: 'error', message: 'Please select an Order ID.' });
      return;
    }

    try {
      const response = await fetch('/api/samples/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          sampleType,
          storageUnit
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlert({
          type: 'success',
          message: `Sample collected! Barcode: ${data.sample.barcode} safely deposited in ${storageUnit}`
        });
        fetchData();
      } else {
        setAlert({ type: 'error', message: data.message || 'Collection failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Error collecting sample: ' + err.message });
    }
  };

  // Mark status as Processed
  const handleUpdateStatus = async (sampleId, newStatus) => {
    try {
      const res = await fetch(`/api/samples/${sampleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAlert({ type: 'success', message: `Sample updated to ${newStatus}` });
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-blue-600" />
            Biological Sample Collection & Cold-Chain Storage
          </h2>
          <p className="text-xs text-slate-500">
            Log phlebotomy collection, generate barcode labels, and store biological specimens in ESP32 temperature-regulated refrigerators.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-900 px-3 py-1.5 rounded">
          <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
          <span>Storage Standard: <strong>2.0°C - 8.0°C</strong> (ESP32 Monitored)</span>
        </div>
      </div>

      <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Collect Sample Form (Controlled Form) */}
      {user?.role !== 'Patient' && (
        <div className="bg-white border border-slate-300 rounded p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            Collect New Specimen
          </h3>

          <form onSubmit={handleCollectSample} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs items-end">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Order ID *</label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
              >
                {orders.map(o => (
                  <option key={o._id} value={o.orderId}>
                    {o.orderId} - {o.patientName} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specimen Tube Type *</label>
              <select
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
              >
                <option value="Blood (EDTA Purple Cap)">Blood (EDTA Purple Cap)</option>
                <option value="Serum (SST Yellow Cap)">Serum (SST Yellow Cap)</option>
                <option value="Plasma (Sodium Citrate Blue)">Plasma (Sodium Citrate Blue)</option>
                <option value="Urine (Sterile Container)">Urine (Sterile Container)</option>
                <option value="Nasopharyngeal Swab">Nasopharyngeal Swab</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preservation Cold Unit</label>
              <select
                value={storageUnit}
                onChange={(e) => setStorageUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
              >
                <option value="ESP32 Cold Unit #1 (2°C - 8°C)">ESP32 Cold Unit #1 (2°C - 8°C)</option>
                <option value="ESP32 Cold Unit #2 (Deep Freeze -20°C)">ESP32 Cold Unit #2 (Deep Freeze -20°C)</option>
                <option value="Ambient Rack (Room Temp 22°C)">Ambient Rack (Room Temp 22°C)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded shadow transition"
              >
                Collect & Generate Barcode
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Samples Table */}
      <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Barcode, Sample ID, or Patient..."
              className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-slate-50 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total Samples: {samples.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white border-b border-slate-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Sample ID</th>
                <th className="py-2.5 px-3">Barcode Label</th>
                <th className="py-2.5 px-3">Associated Order</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Specimen Type</th>
                <th className="py-2.5 px-3">Cold Storage Location</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500 text-xs">Loading samples...</td>
                </tr>
              ) : samples.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500 text-xs">No samples recorded.</td>
                </tr>
              ) : (
                samples.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.sampleId}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold text-slate-900 inline-flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-slate-600" />
                        {s.barcode}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold">{s.orderId}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{s.patientName}</td>
                    <td className="py-2.5 px-3">{s.sampleType}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                        <ThermometerSnowflake className="w-3 h-3 text-blue-500" />
                        {s.storageUnit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        s.status === 'Stored in Cold Unit'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : s.status === 'Processed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {s.status !== 'Processed' && user?.role !== 'Patient' && (
                        <button
                          onClick={() => handleUpdateStatus(s._id, 'Processed')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-1 rounded shadow"
                        >
                          Mark Processed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
