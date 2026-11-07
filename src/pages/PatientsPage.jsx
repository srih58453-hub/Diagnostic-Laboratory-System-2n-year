import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { Users, UserPlus, Search, Phone, Mail, Droplet, MapPin, X } from 'lucide-react';

export default function PatientsPage() {
  const { user, token } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Modal State for adding new patient
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [address, setAddress] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Error loading patients: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPatients();
    }
  }, [token, searchTerm]);

  // Handle patient registration form with event.preventDefault()
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!name || !phone) {
      setAlert({ type: 'error', message: 'Patient Name and Phone number are required fields.' });
      return;
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          age: Number(age) || 0,
          gender,
          phone,
          email,
          bloodGroup,
          address
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: `Patient registered successfully! Assigned ID: ${data.patient.patientId}` });
        setIsModalOpen(false);
        // Reset form fields
        setName('');
        setAge('');
        setPhone('');
        setEmail('');
        setAddress('');
        fetchPatients();
      } else {
        setAlert({ type: 'error', message: data.message || 'Registration failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to save patient: ' + err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Patient Directory & Registration
          </h2>
          <p className="text-xs text-slate-500">
            Maintain master demographic, contact, and blood group records for laboratory tests.
          </p>
        </div>

        {user?.role !== 'Patient' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            Register New Patient
          </button>
        )}
      </div>

      <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Search Input */}
      <div className="bg-white border border-slate-300 rounded p-3 shadow-sm flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Patient Name, ID, or Phone..."
          className="w-full text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-blue-600 bg-slate-50 focus:bg-white"
        />
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white border-b border-slate-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Patient ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Age / Gender</th>
                <th className="py-2.5 px-3">Blood Group</th>
                <th className="py-2.5 px-3">Contact (Phone / Email)</th>
                <th className="py-2.5 px-3">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 text-xs">
                    Loading patient database...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500 text-xs">
                    No patients registered yet. Click "Register New Patient" above.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {p.patientId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {p.name}
                      {p.address && <div className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{p.address}</div>}
                    </td>
                    <td className="py-2.5 px-3">
                      {p.age} yrs • {p.gender}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                        <Droplet className="w-2.5 h-2.5 text-red-500" />
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" /> {p.phone}
                      </div>
                      {p.email && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Mail className="w-2.5 h-2.5 text-slate-400" /> {p.email}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 border-b-2 border-blue-600 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Register New Patient</h3>
                <p className="text-[11px] text-slate-300">Enter personal and demographic info</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Murthy"
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 42"
                    min="1"
                    max="120"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10 digit number"
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@gmail.com"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, locality"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50 focus:bg-white"
                />
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
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
