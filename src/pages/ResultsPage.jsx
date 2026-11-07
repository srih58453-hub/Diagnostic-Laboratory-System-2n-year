import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { ClipboardCheck, Plus, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function ResultsPage({ selectedOrderId }) {
  const { user, token } = useAuth();

  const [results, setResults] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Form state
  const [orderId, setOrderId] = useState(selectedOrderId || '');
  const [testName, setTestName] = useState('Complete Blood Count (CBC)');
  const [parameterName, setParameterName] = useState('Hemoglobin (Hb)');
  const [measuredValue, setMeasuredValue] = useState('');
  const [unit, setUnit] = useState('g/dL');
  const [normalRange, setNormalRange] = useState('13.0 - 17.0');
  const [status, setStatus] = useState('Normal');
  const [notes, setNotes] = useState('Tested on automated hematology analyzer.');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Results
      const resRes = await fetch('/api/results', { headers });
      const resData = await resRes.json();
      if (resData.success) {
        setResults(resData.results);
      }

      // 2. Fetch Orders that need results
      const ordRes = await fetch('/api/orders', { headers });
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders(ordData.orders);
        if (!orderId && ordData.orders.length > 0) {
          const inProgress = ordData.orders.find(o => o.status === 'Sample Collected' || o.status === 'In Testing') || ordData.orders[0];
          setOrderId(inProgress.orderId);
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load test results: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Handle result entry with event.preventDefault() (College syllabus requirement)
  const handleAddResult = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!orderId || !parameterName || !measuredValue) {
      setAlert({ type: 'error', message: 'Order ID, parameter name, and measured value are required.' });
      return;
    }

    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          testName,
          parameterName,
          measuredValue,
          unit,
          normalRange,
          status,
          notes
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: `Test parameter recorded successfully! [${parameterName}: ${measuredValue} ${unit}]` });
        setMeasuredValue('');
        fetchData();
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to record result' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Error: ' + err.message });
    }
  };

  // Quick preset helper
  const applyPreset = (preset) => {
    if (preset === 'CBC') {
      setTestName('Complete Blood Count (CBC)');
      setParameterName('Hemoglobin (Hb)');
      setUnit('g/dL');
      setNormalRange('13.0 - 17.0');
    } else if (preset === 'FBS') {
      setTestName('Fasting Blood Sugar (FBS)');
      setParameterName('Glucose Fasting');
      setUnit('mg/dL');
      setNormalRange('70 - 100');
    } else if (preset === 'TSH') {
      setTestName('Thyroid Profile');
      setParameterName('TSH (Ultrasensitive)');
      setUnit('uIU/mL');
      setNormalRange('0.40 - 4.20');
    } else if (preset === 'CHOL') {
      setTestName('Lipid Profile');
      setParameterName('Total Cholesterol');
      setUnit('mg/dL');
      setNormalRange('< 200');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            Enter Laboratory Test Results (Clinical Chemistry & Hematology)
          </h2>
          <p className="text-xs text-slate-500">
            Record automated analyzer readings, verify reference intervals, and flag biological abnormalities.
          </p>
        </div>
      </div>

      <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Entry Form */}
      {user?.role !== 'Patient' && (
        <div className="bg-white border border-slate-300 rounded p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 mb-3 gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              New Parameter Reading Entry
            </h3>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-500">Quick Parameter Presets:</span>
              <button type="button" onClick={() => applyPreset('CBC')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">Hb (CBC)</button>
              <button type="button" onClick={() => applyPreset('FBS')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">Glucose (FBS)</button>
              <button type="button" onClick={() => applyPreset('TSH')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">TSH</button>
              <button type="button" onClick={() => applyPreset('CHOL')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">Cholesterol</button>
            </div>
          </div>

          <form onSubmit={handleAddResult} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <label className="block font-semibold text-slate-700 mb-1">Investigation Test Name *</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specific Parameter *</label>
                <input
                  type="text"
                  value={parameterName}
                  onChange={(e) => setParameterName(e.target.value)}
                  placeholder="e.g. Hemoglobin, Total Leucocyte Count"
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Measured Value *</label>
                <input
                  type="text"
                  value={measuredValue}
                  onChange={(e) => setMeasuredValue(e.target.value)}
                  placeholder="e.g. 14.2"
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit of Measurement</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. g/dL, mg/dL"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biological Reference Range</label>
                <input
                  type="text"
                  value={normalRange}
                  onChange={(e) => setNormalRange(e.target.value)}
                  placeholder="e.g. 13.0 - 17.0"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Interpretation</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white font-semibold"
                >
                  <option value="Normal">Normal (Within Limits)</option>
                  <option value="Abnormal">Abnormal (Out of Range)</option>
                  <option value="Critical">Critical Alert (Notify MD)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Technician observation notes..."
                className="flex-1 mr-3 px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 text-xs"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded shadow transition"
              >
                Save Parameter Result
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recorded Results Table */}
      <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase">Master Results Log</span>
          <span className="text-xs text-slate-500 font-mono">Total Recorded: {results.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white border-b border-slate-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Result ID</th>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Investigation</th>
                <th className="py-2.5 px-3">Parameter Tested</th>
                <th className="py-2.5 px-3">Measured Value</th>
                <th className="py-2.5 px-3">Reference Range</th>
                <th className="py-2.5 px-3">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Loading results...</td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">No test results recorded yet.</td>
                </tr>
              ) : (
                results.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.resultId}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold">{r.orderId}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{r.patientName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.testName}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{r.parameterName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {r.measuredValue} <span className="text-[10px] text-slate-500 font-normal">{r.unit}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{r.normalRange}</td>
                    <td className="py-2.5 px-3">
                      {r.status === 'Normal' && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Normal
                        </span>
                      )}
                      {r.status === 'Abnormal' && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> Abnormal
                        </span>
                      )}
                      {r.status === 'Critical' && (
                        <span className="bg-red-50 text-red-800 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <AlertOctagon className="w-2.5 h-2.5 text-red-600" /> Critical
                        </span>
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
