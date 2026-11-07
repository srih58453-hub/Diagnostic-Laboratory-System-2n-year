import React, { useState, useEffect } from 'react';
import AlertBanner from '../components/AlertBanner.jsx';
import { 
  ThermometerSnowflake, 
  Cpu, 
  Wifi, 
  Bell, 
  ShieldCheck, 
  ShieldAlert, 
  Code, 
  Copy, 
  Check, 
  Play, 
  RefreshCw,
  HardDrive
} from 'lucide-react';

export default function Esp32Page() {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [copied, setCopied] = useState(false);
  const [arduinoCode, setArduinoCode] = useState('');

  // Fetch live telemetry from Express backend
  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/esp32/telemetry');
      const data = await res.json();
      if (data.success) {
        setTelemetry(data);
        setHistory(data.history || []);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to communicate with ESP32 gateway: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Arduino code
  const fetchArduinoCode = async () => {
    try {
      const res = await fetch('/api/esp32/arduino-code');
      const code = await res.text();
      setArduinoCode(code);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    fetchArduinoCode();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  // Simulator helper: sends test telemetry POST to /api/esp32/telemetry
  const handleSimulate = async (temp, hum, door) => {
    try {
      setSimulating(true);
      const response = await fetch('/api/esp32/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'ESP32-LAB-COLD-01',
          temperature: temp,
          humidity: hum,
          doorStatus: door
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlert({
          type: data.isSafe ? 'success' : 'error',
          message: `Simulated ESP32 Transmission: ${temp}°C, ${hum}% RH. Status: ${data.alertMessage}`
        });
        fetchTelemetry();
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Simulation failed: ' + err.message });
    } finally {
      setSimulating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const current = telemetry?.currentStatus;
  const isSafe = current?.isSafe ?? true;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white border-b-2 border-blue-600 rounded p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white border border-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              ESP32 Microcontroller IoT Cold-Chain Monitoring Node
              <span className="text-[11px] bg-blue-900 border border-blue-400 text-blue-200 px-2 py-0.5 rounded font-mono">
                GPIO 4 (DHT22)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Preserving blood, serum reagents, enzymes, and clinical samples within standard biological thresholds (2.0°C - 8.0°C).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-700 px-3 py-1.5 rounded">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono">WiFi HTTP POST: Online</span>
          </div>
          <button
            onClick={fetchTelemetry}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1.5 rounded font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      {/* Main Gauges & Alert Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gauge 1: Temperature */}
        <div className={`bg-white border rounded p-4 shadow-sm transition ${
          isSafe ? 'border-slate-300' : 'border-red-500 bg-red-50/20'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Cold Unit Temperature</span>
            <ThermometerSnowflake className={`w-5 h-5 ${isSafe ? 'text-blue-600' : 'text-red-600'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold font-mono tracking-tight ${
              isSafe ? 'text-slate-900' : 'text-red-600'
            }`}>
              {current?.temperature?.toFixed(1) ?? '4.2'}°C
            </span>
            <span className="text-xs text-slate-500 font-medium">Standard: 2°C - 8°C</span>
          </div>

          {/* Simple Visual Bar */}
          <div className="mt-3 bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 ${
                isSafe ? 'bg-blue-600' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, ((current?.temperature ?? 4) / 12) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0°C (Freeze)</span>
            <span className="text-blue-700 font-bold">2°C - 8°C (Safe Zone)</span>
            <span>12°C (Spoilage)</span>
          </div>
        </div>

        {/* Gauge 2: Relative Humidity */}
        <div className="bg-white border border-slate-300 rounded p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Chamber Humidity</span>
            <Cpu className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
              {current?.humidity?.toFixed(1) ?? '48.5'}%
            </span>
            <span className="text-xs text-slate-500 font-medium">RH Target: 40% - 60%</span>
          </div>
          <div className="mt-3 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-700 transition-all duration-500"
              style={{ width: `${current?.humidity ?? 50}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Prevents condensation on specimen test tubes and barcodes.
          </div>
        </div>

        {/* Gauge 3: Safety & Alarm Status */}
        <div className={`border rounded p-4 shadow-sm flex flex-col justify-between ${
          isSafe
            ? 'bg-slate-900 text-white border-slate-700'
            : 'bg-red-900 text-white border-red-600 animate-pulse'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Safety & Door Status
              </span>
              <Bell className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              {isSafe ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" /> REAGENTS SAFE
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-300 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-red-400" /> ALARM ACTIVE!
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300">
              {current?.alertMessage || 'Operating under normal parameters.'}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-700 pt-2 mt-2 font-mono flex justify-between">
            <span>Door: <strong>{current?.doorStatus || 'Closed'}</strong></span>
            <span>Node: ESP32-LAB-COLD-01</span>
          </div>
        </div>
      </div>

      {/* Classroom Demonstration / Teacher Evaluation Simulator Panel */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-sm">
        <div className="border-b border-slate-200 pb-2 mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-blue-600" />
              ESP32 Hardware Simulator (For Internal Marks / Viva Evaluation)
            </h3>
            <p className="text-[11px] text-slate-500">
              Demonstrate IoT telemetry ingestion and threshold triggers to your teacher without needing a physical ESP32 connected right now.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => handleSimulate(4.2, 48.0, 'Closed')}
            disabled={simulating}
            className="bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-300 p-2 rounded text-left transition"
          >
            <div className="font-bold text-slate-900">1. Simulate Safe (4.2°C)</div>
            <div className="text-[10px] text-emerald-600 font-medium">Optimal Cold Chain Storage</div>
          </button>

          <button
            onClick={() => handleSimulate(9.8, 55.0, 'Closed')}
            disabled={simulating}
            className="bg-red-50 hover:bg-red-100 border border-red-300 p-2 rounded text-left transition"
          >
            <div className="font-bold text-red-900">2. Simulate High Temp (9.8°C)</div>
            <div className="text-[10px] text-red-700 font-medium">Trigger Critical Buzzer Alert</div>
          </button>

          <button
            onClick={() => handleSimulate(0.8, 42.0, 'Closed')}
            disabled={simulating}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-300 p-2 rounded text-left transition"
          >
            <div className="font-bold text-blue-900">3. Simulate Freezing (0.8°C)</div>
            <div className="text-[10px] text-blue-700 font-medium">Trigger Freezing Alert</div>
          </button>

          <button
            onClick={() => handleSimulate(7.2, 62.0, 'Open')}
            disabled={simulating}
            className="bg-amber-50 hover:bg-amber-100 border border-amber-300 p-2 rounded text-left transition"
          >
            <div className="font-bold text-amber-900">4. Simulate Door Left Open</div>
            <div className="text-[10px] text-amber-700 font-medium">Magnetic Sensor Warning</div>
          </button>
        </div>
      </div>

      {/* Arduino Firmware & Circuit Diagram Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Circuit Pinout Explanation */}
        <div className="bg-white border border-slate-300 rounded p-4 shadow-sm text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            ESP32 Hardware Wiring & Pinout
          </h3>

          <div className="space-y-2 text-slate-700">
            <div className="bg-slate-50 border border-slate-200 p-2 rounded">
              <strong className="text-slate-900">1. DHT22 Sensor (Temperature & Humidity):</strong>
              <div className="text-slate-600 mt-0.5">
                • VCC Pin ➔ ESP32 3.3V Pin<br />
                • Data Pin ➔ ESP32 GPIO 4 (with 10kΩ pull-up resistor)<br />
                • GND Pin ➔ ESP32 GND Pin
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2 rounded">
              <strong className="text-slate-900">2. Active Piezo Buzzer (Audio Alert):</strong>
              <div className="text-slate-600 mt-0.5">
                • Positive Pin (+) ➔ ESP32 GPIO 18<br />
                • Negative Pin (-) ➔ ESP32 GND Pin
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2 rounded">
              <strong className="text-slate-900">3. WiFi & HTTP Transmission:</strong>
              <div className="text-slate-600 mt-0.5">
                ESP32 connects to laboratory WiFi and sends JSON payload via HTTP POST to:
                <code className="block mt-1 font-mono text-[10px] bg-slate-900 text-blue-300 p-1 rounded">
                  POST http://YOUR_SERVER_IP:3000/api/esp32/telemetry
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Arduino C++ Code Viewer */}
        <div className="bg-slate-900 text-white rounded border border-slate-700 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Code className="w-4 h-4" />
                Arduino Sketch (esp32_firmware.ino)
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] px-2.5 py-1 rounded border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="bg-slate-950 p-2 rounded border border-slate-800 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300">
              <pre>{arduinoCode || '// Loading Arduino sketch...'}</pre>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            * This sketch can be opened in the Arduino IDE. Select board: <strong>ESP32 Dev Module</strong>.
          </div>
        </div>
      </div>

      {/* Telemetry History Log */}
      <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase">Recent Telemetry Data Packets Received</span>
          <span className="text-xs text-slate-500 font-mono">Packets in Memory: {history.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white border-b border-slate-700 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Device Node</th>
                <th className="py-2 px-3">Temperature</th>
                <th className="py-2 px-3">Humidity</th>
                <th className="py-2 px-3">Door</th>
                <th className="py-2 px-3">Preservation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {history.map(item => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-800">{item.deviceId}</td>
                  <td className="py-2 px-3 font-mono font-bold">
                    <span className={item.isSafe ? 'text-blue-700' : 'text-red-600'}>
                      {item.temperature.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono">{item.humidity.toFixed(1)}%</td>
                  <td className="py-2 px-3">{item.refrigeratorDoorStatus}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.isSafe
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isSafe ? 'Normal' : 'Critical Out of Range'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
