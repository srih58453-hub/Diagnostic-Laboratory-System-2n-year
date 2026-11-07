import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Database, 
  Cpu, 
  ShieldCheck, 
  CheckCircle, 
  Copy, 
  Check, 
  Code 
} from 'lucide-react';

export default function VivaGuidePage() {
  const [activeSection, setActiveSection] = useState('viva_qa');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const vivaQuestions = [
    {
      q: "1. Why is event.preventDefault() used in your React forms?",
      a: "In standard HTML forms, submitting triggers a full browser page reload which wipes out React's state in memory. By calling event.preventDefault(), we stop the default reload behavior and allow our controlled React state variables to be validated and sent asynchronously to our Express API via fetch().",
      topic: "React Controlled Forms"
    },
    {
      q: "2. How does JWT (JSON Web Token) authentication work in this project?",
      a: "When a user logs in, the Express server verifies the bcrypt password hash. Upon success, jwt.sign() creates an encrypted token payload { id, email, role } signed with a secret key. React stores this in localStorage ('lab_token') and sends it in the HTTP header as 'Authorization: Bearer <token>' on all protected requests. The verifyToken middleware decodes it using jwt.verify().",
      topic: "Security & Authentication"
    },
    {
      q: "3. What is Role-Based Access Control (RBAC) and how did you implement it?",
      a: "RBAC ensures users only access features appropriate to their job. We implemented a custom Express middleware checkRole(allowedRoles). For example, checkRole(['Admin', 'Lab Technician']) protects sample testing and result entry. If a Receptionist or Patient tries to access it, Express returns HTTP 403 Forbidden.",
      topic: "Express Middleware"
    },
    {
      q: "4. What is the role of ESP32 in a Diagnostic Laboratory?",
      a: "Pathology specimens (blood EDTA tubes, serum, reagents) spoil and enzymes denature if stored outside 2.0°C to 8.0°C. The ESP32 microcontroller with a DHT22 sensor continuously monitors the cold-storage refrigerator. It transmits temperature and humidity readings every 10 seconds via HTTP POST to /api/esp32/telemetry. If temperature spikes above 8°C, an audio buzzer sounds and an alert flag is logged.",
      topic: "IoT & Embedded Systems"
    },
    {
      q: "5. Explain the data flow from Patient Booking to Final Report.",
      a: "1) Receptionist registers Patient and creates a TestOrder (Status: Pending).\n2) Lab Tech collects specimen, generating a barcode and logging it into the ESP32 Cold Storage unit (Status: Sample Collected).\n3) Tech enters analyzer readings under Result records (Status: In Testing).\n4) Pathologist reviews normal ranges, signs off, and changes Status to Completed, issuing a verified report card.",
      topic: "Core Laboratory Workflow"
    },
    {
      q: "6. Why did you use React Context API instead of Redux?",
      a: "Context API is natively built into React and provides clean state sharing for authentication (user, token, login, logout, role switching) across all components without needing bulky external Redux boilerplate, matching our 2nd-year curriculum requirements perfectly.",
      topic: "React State Management"
    },
    {
      q: "7. How do you prevent SQL Injection and NoSQL Injection in MERN?",
      a: "1) By using Mongoose Schemas with strict field typing and validation.\n2) Using parameterized queries and avoiding eval() or un-sanitized string concatenation.\n3) Running bcrypt with 10 salt rounds for password storage so plaintext is never saved.",
      topic: "Database Security"
    },
    {
      q: "8. What are the 8 Mongoose Models in this project?",
      a: "As assigned in our syllabus sheet: User, Patient, Test, TestOrder, Sample, Result, Report, and Payment (plus EspTelemetry for IoT sensor logs).",
      topic: "Database Modeling"
    }
  ];

  const apiEndpoints = [
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticates credentials, returns JWT token' },
    { method: 'POST', path: '/api/auth/register', desc: 'Registers new user with role and bcrypt password' },
    { method: 'GET', path: '/api/patients', desc: 'Fetches patients with search query filter' },
    { method: 'POST', path: '/api/patients', desc: 'Registers patient record (Name, Age, Blood Group)' },
    { method: 'GET', path: '/api/tests', desc: 'Returns diagnostic tests catalog & tariffs' },
    { method: 'GET', path: '/api/orders', desc: 'Returns orders with status filter & sorting' },
    { method: 'POST', path: '/api/orders', desc: 'Books new test order with multi-test calculation' },
    { method: 'POST', path: '/api/samples/collect', desc: 'Generates barcode & assigns ESP32 cold unit' },
    { method: 'POST', path: '/api/results', desc: 'Records measured parameter vs normal range' },
    { method: 'POST', path: '/api/reports/verify', desc: 'Pathologist digital sign-off and report release' },
    { method: 'GET', path: '/api/esp32/telemetry', desc: 'Returns real-time cold storage temperature' },
    { method: 'POST', path: '/api/esp32/telemetry', desc: 'Receives temperature & humidity from ESP32 node' },
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-950 text-white border-b-2 border-blue-600 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white border border-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              Internal Exam & Viva Examination Guide
            </h2>
            <p className="text-xs text-slate-400">
              Complete project documentation, teacher viva Q&A, Mongoose schemas, and ESP32 hardware explanations.
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 p-1 rounded text-xs">
          <button
            onClick={() => setActiveSection('viva_qa')}
            className={`px-3 py-1 rounded transition ${
              activeSection === 'viva_qa' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            Top Viva Q&A
          </button>
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3 py-1 rounded transition ${
              activeSection === 'architecture' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            Architecture & Models
          </button>
          <button
            onClick={() => setActiveSection('apis')}
            className={`px-3 py-1 rounded transition ${
              activeSection === 'apis' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            REST API Endpoints
          </button>
        </div>
      </div>

      {/* SECTION 1: Viva Q&A */}
      {activeSection === 'viva_qa' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded text-xs">
            <strong>Tip for viva:</strong> Speak clearly and refer to your live running project tabs ("As shown in the Dashboard and ESP32 tab..."). The answers below are written in simple words that 2nd-year engineering students use.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vivaQuestions.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-300 rounded p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                      {item.topic}
                    </span>
                    <button
                      onClick={() => handleCopy(`${item.q}\n\nAnswer: ${item.a}`, idx)}
                      className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1"
                      title="Copy Q&A"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs mb-2">{item.q}</h3>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Architecture & Models */}
      {activeSection === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-300 rounded p-4 shadow-sm text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Full Stack MERN + ESP32 Architecture
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-700">
              <div className="border border-slate-200 bg-slate-50 p-3 rounded">
                <div className="font-bold text-slate-900 text-sm mb-1 text-blue-700">1. React Frontend</div>
                <ul className="space-y-1 text-[11px]">
                  <li>• Vite bundler for fast development</li>
                  <li>• JSX components & Tailwind styling</li>
                  <li>• React Context API (AuthContext)</li>
                  <li>• Controlled forms with e.preventDefault()</li>
                  <li>• Role-based screen rendering</li>
                </ul>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-3 rounded">
                <div className="font-bold text-slate-900 text-sm mb-1 text-slate-900">2. Node & Express</div>
                <ul className="space-y-1 text-[11px]">
                  <li>• REST API architecture</li>
                  <li>• Modular routes & controllers</li>
                  <li>• JWT authentication middleware</li>
                  <li>• Role-Based Access Control (RBAC)</li>
                  <li>• ESP32 HTTP POST ingest</li>
                </ul>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-3 rounded">
                <div className="font-bold text-slate-900 text-sm mb-1 text-emerald-700">3. MongoDB Models</div>
                <ul className="space-y-1 text-[11px]">
                  <li>• User, Patient, Test, TestOrder</li>
                  <li>• Sample, Result, Report, Payment</li>
                  <li>• EspTelemetry sensor log collection</li>
                  <li>• Unique indexes & Schema validations</li>
                  <li>• Bcrypt password hashing</li>
                </ul>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-3 rounded">
                <div className="font-bold text-slate-900 text-sm mb-1 text-blue-800">4. ESP32 IoT Node</div>
                <ul className="space-y-1 text-[11px]">
                  <li>• ESP32 DevKit V1 board</li>
                  <li>• DHT22 Temp & Humidity sensor</li>
                  <li>• Cold storage safety (2°C - 8°C)</li>
                  <li>• HTTPClient POST to /api/esp32</li>
                  <li>• Hardware buzzer alarm on Pin 18</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mongoose Models Overview */}
          <div className="bg-white border border-slate-300 rounded p-4 shadow-sm text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Syllabus Mongoose Models Reference
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-800">
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <strong>1. User</strong>
                <p className="text-[10px] text-slate-500">name, email, password (bcrypt), role, phone</p>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <strong>2. Patient</strong>
                <p className="text-[10px] text-slate-500">patientId, name, age, gender, bloodGroup, phone</p>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <strong>3. Test</strong>
                <p className="text-[10px] text-slate-500">testCode, testName, category, price, normalRange</p>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <strong>4. TestOrder</strong>
                <p className="text-[10px] text-slate-500">orderId, patientId, testIds, status, paymentStatus</p>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <strong>5. Sample</strong>
                <p className="text-[10px] text-slate-500">sampleId, orderId, barcode, storageUnit, status</p>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <strong>6. Result</strong>
                <p className="text-[10px] text-slate-500">resultId, parameterName, measuredValue, unit, status</p>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <strong>7. Report</strong>
                <p className="text-[10px] text-slate-500">reportId, orderId, doctorName, verifiedBy, summary</p>
              </div>
              <div className="p-2 border border-slate-200 rounded bg-slate-50">
                <strong>8. Payment</strong>
                <p className="text-[10px] text-slate-500">paymentId, orderId, amount, method (UPI/Card/Cash)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: REST API Endpoints */}
      {activeSection === 'apis' && (
        <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase">Express.js API Endpoints (Postman Tested)</span>
            <span className="text-xs text-slate-500 font-mono">12 Endpoints Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">HTTP Method</th>
                  <th className="py-2.5 px-3">Endpoint Route</th>
                  <th className="py-2.5 px-3">Functional Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {apiEndpoints.map((ep, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        ep.method === 'GET' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-900 font-semibold">{ep.path}</td>
                    <td className="py-2 px-3 text-slate-600">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
