import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { Package, Plus, ThermometerSnowflake, Clock, DollarSign, X } from 'lucide-react';

export default function TestsCatalogPage() {
  const { user, token } = useAuth();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Add test modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testName, setTestName] = useState('');
  const [category, setCategory] = useState('Biochemistry');
  const [price, setPrice] = useState('');
  const [sampleType, setSampleType] = useState('Blood');
  const [normalRange, setNormalRange] = useState('');
  const [unit, setUnit] = useState('');
  const [turnaroundHours, setTurnaroundHours] = useState('4');

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tests?category=${categoryFilter}`);
      const data = await res.json();
      if (data.success) {
        setTests(data.tests);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load test catalog: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [categoryFilter]);

  // Handle adding test with event.preventDefault() (College syllabus requirement)
  const handleAddTest = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!testName || !price) {
      setAlert({ type: 'error', message: 'Test name and price are required.' });
      return;
    }

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          testName,
          category,
          price: Number(price),
          sampleType,
          normalRange: normalRange || 'N/A',
          unit: unit || 'N/A',
          turnaroundHours: Number(turnaroundHours) || 4,
          storageTempMin: 2,
          storageTempMax: 8
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'New test added to catalog: ' + data.test.testName });
        setIsModalOpen(false);
        setTestName('');
        setPrice('');
        fetchTests();
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to add test' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Error adding test: ' + err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Diagnostic Tests Master Catalog & Tariffs
          </h2>
          <p className="text-xs text-slate-500">
            Define pathology tests, sample collection types, laboratory tariffs, and cold-storage conditions.
          </p>
        </div>

        {user?.role === 'Admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded shadow transition"
          >
            <Plus className="w-4 h-4" />
            Add New Test to Tariff
          </button>
        )}
      </div>

      <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto bg-white border border-slate-300 p-2 rounded shadow-sm text-xs">
        <span className="font-semibold text-slate-600 px-2">Category:</span>
        {['All', 'Hematology', 'Biochemistry', 'Microbiology', 'Endocrinology'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded transition ${
              categoryFilter === cat
                ? 'bg-blue-600 text-white font-medium shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-xs text-slate-500">Loading test catalog...</div>
        ) : tests.length === 0 ? (
          <div className="col-span-full text-center py-8 text-xs text-slate-500">No diagnostic tests found in this category.</div>
        ) : (
          tests.map(test => (
            <div key={test._id} className="bg-white border border-slate-300 rounded p-4 shadow-sm hover:border-blue-400 transition">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded font-bold">
                    {test.testCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{test.testName}</h3>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-blue-700">₹{test.price}</div>
                  <span className="text-[10px] text-slate-400">Standard Tariff</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discipline:</span>
                  <span className="font-medium text-slate-800">{test.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specimen Tube:</span>
                  <span className="font-medium text-slate-800">{test.sampleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Turnaround Time:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {test.turnaroundHours} hours
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] bg-blue-50/60 p-1.5 rounded border border-blue-100 text-blue-900 mt-2">
                  <span className="flex items-center gap-1 font-semibold">
                    <ThermometerSnowflake className="w-3 h-3 text-blue-600" /> ESP32 Storage:
                  </span>
                  <span className="font-mono font-bold">2.0°C - 8.0°C</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 border-b-2 border-blue-600 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Add Test to Laboratory Catalog</h3>
                <p className="text-[11px] text-slate-300">Set pricing, sample requirements, and reference ranges</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTest} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Test Name *</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. Serum Ferritin"
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Serology">Serology</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 500"
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Specimen Tube</label>
                  <select
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  >
                    <option value="Blood">Blood (EDTA)</option>
                    <option value="Serum">Serum</option>
                    <option value="Plasma">Plasma</option>
                    <option value="Urine">Urine</option>
                    <option value="Swab">Swab</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Turnaround (Hours)</label>
                  <input
                    type="number"
                    value={turnaroundHours}
                    onChange={(e) => setTurnaroundHours(e.target.value)}
                    placeholder="4"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Normal Range</label>
                  <input
                    type="text"
                    value={normalRange}
                    onChange={(e) => setNormalRange(e.target.value)}
                    placeholder="e.g. 20 - 250"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. ng/mL"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow"
                >
                  Add Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
