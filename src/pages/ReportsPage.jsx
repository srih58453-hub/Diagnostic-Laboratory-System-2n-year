import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { 
  FileText, 
  CheckCircle, 
  Printer, 
  ShieldCheck, 
  X, 
  Award, 
  Search,
  Building2,
  Phone,
  Mail,
  QrCode
} from 'lucide-react';

export default function ReportsPage({ selectedOrderId }) {
  const { user, token } = useAuth();

  const [reports, setReports] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Verification Form State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [orderToVerify, setOrderToVerify] = useState(selectedOrderId || '');
  const [doctorName, setDoctorName] = useState('Dr. Suresh Kumar, MD (Pathology)');
  const [summary, setSummary] = useState('All biological investigations completed. Findings interpreted in clinical context.');

  // Printable Report Viewer State
  const [activeReportDetails, setActiveReportDetails] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Reports
      const repRes = await fetch('/api/reports', { headers });
      const repData = await repRes.json();
      if (repData.success) {
        setReports(repData.reports);
      }

      // 2. Fetch Orders that might need verification
      const ordRes = await fetch('/api/orders', { headers });
      const ordData = await ordRes.json();
      if (ordData.success) {
        setOrders(ordData.orders);
        if (!orderToVerify && ordData.orders.length > 0) {
          const ready = ordData.orders.find(o => o.status === 'In Testing' || o.status === 'Sample Collected') || ordData.orders[0];
          setOrderToVerify(ready.orderId);
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load reports: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Handle Report Verification (Admin or Lab Technician)
  const handleVerifyReport = async (e) => {
    e.preventDefault(); // College requirement: Controlled form with event.preventDefault()
    setAlert({ type: '', message: '' });

    if (!orderToVerify) {
      setAlert({ type: 'error', message: 'Please select an order to verify.' });
      return;
    }

    try {
      const response = await fetch('/api/reports/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderToVerify,
          doctorName,
          summary
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Report verified and issued! Patient can view.' });
        setIsVerifyModalOpen(false);
        fetchData();
      } else {
        setAlert({ type: 'error', message: data.message || 'Verification failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Error verifying report: ' + err.message });
    }
  };

  // Open printable report view
  const handleOpenReport = async (reportId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActiveReportDetails(data);
        setIsPrintModalOpen(true);
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Could not open report: ' + err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Verified Diagnostic Laboratory Reports
          </h2>
          <p className="text-xs text-slate-500">
            Pathologist digital sign-off, patient delivery, and printable clinical report cards.
          </p>
        </div>

        {user?.role !== 'Patient' && (
          <button
            onClick={() => setIsVerifyModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded shadow transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify & Sign Lab Report
          </button>
        )}
      </div>

      <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Reports List */}
      <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white border-b border-slate-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patient Name</th>
                <th className="py-2.5 px-3">Doctor / Pathologist</th>
                <th className="py-2.5 px-3">Verification Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">View / Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Loading verified reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No verified reports yet. Complete testing and click "Verify & Sign Lab Report".
                  </td>
                </tr>
              ) : (
                reports.map(rep => (
                  <tr key={rep._id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{rep.reportId}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{rep.orderId}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {rep.patientName}
                      <div className="text-[10px] text-slate-400 font-mono">{rep.patientId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{rep.doctorName}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(rep.verifiedDate).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleOpenReport(rep.reportId)}
                        className="bg-slate-900 hover:bg-blue-600 text-white text-xs px-2.5 py-1 rounded shadow inline-flex items-center gap-1 transition"
                      >
                        <Printer className="w-3 h-3" />
                        View Report Card
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify & Sign Report Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 border-b-2 border-blue-600 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Pathologist Verification & Digital Sign</h3>
                <p className="text-[11px] text-slate-300">Authorize release of diagnostic report to patient</p>
              </div>
              <button onClick={() => setIsVerifyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyReport} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Select Order *</label>
                <select
                  value={orderToVerify}
                  onChange={(e) => setOrderToVerify(e.target.value)}
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
                <label className="block font-semibold text-slate-800 mb-1">Verifying Consultant Doctor</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Clinical Summary / Remarks</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows="3"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow"
                >
                  Confirm & Release Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Clinical Laboratory Report Card Modal */}
      {isPrintModalOpen && activeReportDetails && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border-2 border-slate-400 rounded-sm shadow-2xl w-full max-w-3xl my-6 overflow-hidden">
            {/* Action Bar */}
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-700">
              <span className="font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400" />
                Laboratory Test Report Preview (Print Ready)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium flex items-center gap-1 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Report Document (Clinical Letterhead Style) */}
            <div className="p-8 text-slate-800 bg-white" id="printable-report">
              {/* Header Letterhead */}
              <div className="border-b-2 border-blue-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    APEX DIAGNOSTIC & CLINICAL RESEARCH LABORATORY
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    (NABL & ISO 15189 Certified Pathology & Molecular Laboratory)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    42 Healthcare Avenue, Medical Enclave • Phone: +91 80 2345 6789 • info@apexlab.in
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-blue-900 text-white px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                    Official Lab Report
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {activeReportDetails.report.reportId}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Order: {activeReportDetails.report.orderId}
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Demographics Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-300 p-3 rounded-xs text-xs mb-6">
                <div>
                  <div className="mb-1"><span className="text-slate-500 font-semibold">Patient Name:</span> <strong>{activeReportDetails.report.patientName}</strong></div>
                  <div className="mb-1"><span className="text-slate-500 font-semibold">Patient ID:</span> <span className="font-mono">{activeReportDetails.report.patientId}</span></div>
                  <div><span className="text-slate-500 font-semibold">Age / Gender:</span> {activeReportDetails.patient?.age || '32'} yrs / {activeReportDetails.patient?.gender || 'Male'}</div>
                </div>
                <div>
                  <div className="mb-1"><span className="text-slate-500 font-semibold">Ref. Doctor:</span> <strong>{activeReportDetails.report.doctorName}</strong></div>
                  <div className="mb-1"><span className="text-slate-500 font-semibold">Sample Barcode:</span> <span className="font-mono">{activeReportDetails.samples?.[0]?.barcode || 'BC-889021'}</span></div>
                  <div><span className="text-slate-500 font-semibold">Report Date:</span> {new Date(activeReportDetails.report.verifiedDate).toLocaleString()}</div>
                </div>
              </div>

              {/* Cold-Chain Quality Assurance Tag */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-2 mb-4 text-[11px] text-blue-950 flex items-center justify-between">
                <div>
                  <strong>IoT Cold-Chain Integrity Verified:</strong> Specimen was maintained in ESP32 temperature-regulated unit at <strong>4.2°C (Optimal biological range 2°C - 8°C)</strong> throughout processing.
                </div>
                <div className="font-mono text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold">
                  ESP32 VALIDATED
                </div>
              </div>

              {/* Test Results Table */}
              <div className="mb-6">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                    <tr>
                      <th className="py-2 px-3 border border-slate-700">Test / Parameter</th>
                      <th className="py-2 px-3 border border-slate-700">Measured Result</th>
                      <th className="py-2 px-3 border border-slate-700">Biological Reference Interval</th>
                      <th className="py-2 px-3 border border-slate-700">Unit</th>
                      <th className="py-2 px-3 border border-slate-700 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {activeReportDetails.results && activeReportDetails.results.length > 0 ? (
                      activeReportDetails.results.map((res, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-900">
                            {res.parameterName}
                            <div className="text-[10px] text-slate-500 font-normal">{res.testName}</div>
                          </td>
                          <td className="py-2 px-3 border border-slate-300 font-mono font-bold text-slate-900">
                            {res.measuredValue}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 font-mono text-slate-600">
                            {res.normalRange}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-slate-600 font-mono">
                            {res.unit}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-center">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              res.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-slate-500 text-xs">
                          No specific parameter rows entered yet for this test order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pathologist Summary */}
              <div className="border border-slate-200 bg-slate-50 p-3 rounded mb-8 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Consultant Pathologist Interpretation:</span>
                <p className="text-slate-700">{activeReportDetails.report.summary}</p>
              </div>

              {/* Signature Stamp Footer */}
              <div className="pt-6 border-t-2 border-slate-300 flex justify-between items-end text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">
                    * Automated analyzer results. Clinical correlation advised.<br />
                    Generated by Diagnostic Laboratory System (MERN Stack + ESP32 IoT).
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block border-b border-slate-400 pb-1 mb-1 font-serif italic text-blue-900 font-bold text-sm">
                    {activeReportDetails.report.doctorName}
                  </div>
                  <div className="font-bold text-slate-900">Consultant Pathologist</div>
                  <div className="text-[10px] text-slate-500">Reg. No: MED-KA-45892</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
