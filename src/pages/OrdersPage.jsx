import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  FlaskConical, 
  FileText, 
  CreditCard,
  X
} from 'lucide-react';

export default function OrdersPage({ setActiveTab, setSelectedOrderId }) {
  const { user, token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [doctorName, setDoctorName] = useState('Self / Referral');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Load orders, patients, and tests
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Orders
      const ordRes = await fetch(`/api/orders?status=${statusFilter}&search=${searchTerm}`, { headers });
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders(ordData.orders);
      }

      // 2. Fetch Patients (for booking dropdown)
      const patRes = await fetch('/api/patients', { headers });
      const patData = await patRes.json();
      if (patData.success) {
        setPatients(patData.patients);
        if (patData.patients.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patData.patients[0].patientId);
        }
      }

      // 3. Fetch Tests (for selection)
      const testRes = await fetch('/api/tests');
      const testData = await testRes.json();
      if (testData.success) {
        setTests(testData.tests);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load test orders: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, statusFilter, searchTerm]);

  // Handle new test booking with event.preventDefault() (College syllabus requirement)
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!selectedPatientId) {
      setAlert({ type: 'error', message: 'Please select a patient.' });
      return;
    }

    if (selectedTestIds.length === 0) {
      setAlert({ type: 'error', message: 'Please select at least one diagnostic test.' });
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedPatientId,
          testIds: selectedTestIds,
          doctorName,
          notes,
          paymentMethod
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Test order booked successfully! Order ID: ' + data.order.orderId });
        setIsModalOpen(false);
        setSelectedTestIds([]);
        fetchData();
      } else {
        setAlert({ type: 'error', message: data.message || 'Booking failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Error booking order: ' + err.message });
    }
  };

  // Toggle test selection
  const handleTestToggle = (testId) => {
    if (selectedTestIds.includes(testId)) {
      setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
    } else {
      setSelectedTestIds([...selectedTestIds, testId]);
    }
  };

  // Calculate total amount dynamically
  const calculatedTotal = tests
    .filter(t => selectedTestIds.includes(t._id))
    .reduce((sum, t) => sum + t.price, 0);

  // Status badge colors in silver, black, blue
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded">Pending Sample</span>;
      case 'Sample Collected':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded">Sample Collected</span>;
      case 'In Testing':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded">In Testing</span>;
      case 'Completed':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded">Report Verified</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Diagnostic Test Orders (Workflow Management)
          </h2>
          <p className="text-xs text-slate-500">
            Create, track, collect samples, enter lab findings and manage report issuance.
          </p>
        </div>

        {user?.role !== 'Patient' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            Book New Test Order
          </button>
        )}
      </div>

      <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-300 rounded p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Patient Name, or Patient ID..."
            className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-medium">Filter Status:</span>
          {['All', 'Pending', 'Sample Collected', 'In Testing', 'Completed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white border-b border-slate-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Diagnostic Tests</th>
                <th className="py-2.5 px-3">Total (₹)</th>
                <th className="py-2.5 px-3">Workflow Status</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-xs">
                    Loading test orders from Node.js backend...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-xs">
                    No test orders found matching your search.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {ord.orderId}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {ord.patientName}
                      <div className="text-[11px] text-slate-400 font-mono">{ord.patientId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {ord.testNames.map((tName, i) => (
                          <span key={i} className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] px-1.5 py-0.5 rounded">
                            {tName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-2.5 px-3">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      {ord.status === 'Pending' && user?.role !== 'Patient' && (
                        <button
                          onClick={() => {
                            if (setSelectedOrderId) setSelectedOrderId(ord.orderId);
                            setActiveTab('samples');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] px-2 py-1 rounded shadow"
                        >
                          Collect Sample
                        </button>
                      )}
                      {(ord.status === 'Sample Collected' || ord.status === 'In Testing') && user?.role !== 'Patient' && (
                        <button
                          onClick={() => {
                            if (setSelectedOrderId) setSelectedOrderId(ord.orderId);
                            setActiveTab('results');
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] px-2 py-1 rounded shadow"
                        >
                          Enter Results
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (setSelectedOrderId) setSelectedOrderId(ord.orderId);
                          setActiveTab('reports');
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book New Test Order Modal (Controlled Form with event.preventDefault) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-4 py-3 border-b-2 border-blue-600 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Book Diagnostic Test Order</h3>
                <p className="text-[11px] text-slate-300">Enter order details and select requested investigations</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOrder} className="p-4 space-y-4 text-xs">
              {/* Select Patient */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Select Patient <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white focus:border-blue-600"
                >
                  {patients.map(p => (
                    <option key={p._id} value={p.patientId}>
                      {p.name} ({p.patientId}) - {p.gender}, Age: {p.age}, Blood: {p.bloodGroup}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Need a new patient? Register them first under the "Patients" tab.
                </p>
              </div>

              {/* Select Tests (Checkboxes) */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Select Tests to Conduct <span className="text-red-500">*</span>
                </label>
                <div className="border border-slate-200 rounded p-2 max-h-40 overflow-y-auto space-y-1.5 bg-slate-50">
                  {tests.map(t => (
                    <label key={t._id} className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded cursor-pointer hover:bg-blue-50/50">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTestIds.includes(t._id)}
                          onChange={() => handleTestToggle(t._id)}
                          className="rounded text-blue-600"
                        />
                        <span className="font-medium text-slate-900">{t.testName}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded">{t.category}</span>
                      </div>
                      <span className="font-bold text-blue-700">₹{t.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Total Price preview */}
              <div className="bg-slate-100 border border-slate-300 p-2.5 rounded flex items-center justify-between">
                <span className="font-semibold text-slate-700">Total Bill Amount:</span>
                <span className="text-base font-bold text-slate-900">₹{calculatedTotal}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Referring Doctor</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. R. K. Mehta"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cash">Cash at Counter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fasting sample requested, routine checkup..."
                  rows="2"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow transition"
                >
                  Confirm & Book Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
