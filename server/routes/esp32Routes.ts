import { Router, Request, Response } from 'express';
import { labDb, IEspTelemetry } from '../db/mockDb.ts';

const router = Router();

// GET /api/esp32/telemetry - Fetch recent telemetry & current status
router.get('/telemetry', (req: Request, res: Response) => {
  try {
    const latest = labDb.telemetry[0] || null;
    const history = labDb.telemetry.slice(0, 20);

    // Calculate safe status
    const isSafe = latest ? (latest.temperature >= 2.0 && latest.temperature <= 8.0) : true;

    res.json({
      success: true,
      deviceId: latest?.deviceId || 'ESP32-LAB-COLD-01',
      storageUnit: 'Main Clinical Cold Storage #1',
      idealRange: '2.0°C - 8.0°C',
      currentStatus: {
        temperature: latest ? latest.temperature : 4.0,
        humidity: latest ? latest.humidity : 48.0,
        doorStatus: latest ? latest.refrigeratorDoorStatus : 'Closed',
        isSafe,
        lastUpdated: latest ? latest.timestamp : new Date().toISOString(),
        alertMessage: isSafe ? 'Refrigeration unit operating within safe clinical limits.' : 'WARNING: Temperature deviation detected!'
      },
      history
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/esp32/telemetry - Endpoint called by ESP32 Microcontroller via HTTP POST
router.post('/telemetry', (req: Request, res: Response) => {
  try {
    const { deviceId, temperature, humidity, doorStatus } = req.body;

    if (temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Temperature and humidity values are required from ESP32 sensor.'
      });
    }

    const tempNum = parseFloat(temperature);
    const humNum = parseFloat(humidity);

    // Diagnostic laboratory standards: blood & serum reagents must stay between 2.0°C and 8.0°C
    const isSafe = tempNum >= 2.0 && tempNum <= 8.0;
    const alertMessage = isSafe
      ? 'Temperature within safe clinical storage threshold (2°C - 8°C)'
      : `CRITICAL ALERT: Cold Unit Temp ${tempNum.toFixed(1)}°C is outside safe range (2°C - 8°C)! Specimen integrity compromised!`;

    const newReading: IEspTelemetry = {
      _id: `tel_${Date.now()}`,
      deviceId: deviceId || 'ESP32-LAB-COLD-01',
      temperature: tempNum,
      humidity: humNum,
      refrigeratorDoorStatus: doorStatus === 'Open' ? 'Open' : 'Closed',
      isSafe,
      timestamp: new Date().toISOString(),
      alertMessage
    };

    labDb.telemetry.unshift(newReading);

    // Keep history at max 50 entries
    if (labDb.telemetry.length > 50) {
      labDb.telemetry = labDb.telemetry.slice(0, 50);
    }

    return res.status(201).json({
      success: true,
      message: 'ESP32 Telemetry saved to Lab Database successfully!',
      isSafe,
      alertMessage,
      data: newReading
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/esp32/arduino-code - Returns the complete ESP32 C++ Arduino sketch for college viva / hardware
router.get('/arduino-code', (req: Request, res: Response) => {
  const inoCode = `/*
  ==============================================================
  Project: Diagnostic Laboratory System - ESP32 IoT Module
  Topic: Smart Cold-Storage & Blood Reagent Temperature Monitor
  Microcontroller: ESP32 DOIT DevKit V1
  Sensors: DHT22 (Temperature & Humidity) on GPIO 4, Buzzer on GPIO 18, LED on GPIO 2
  Target API: POST /api/esp32/telemetry
  ==============================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// WiFi Configuration
const char* ssid = "COLLEGE_WIFI_OR_HOTSPOT";
const char* password = "wifi_password";

// Node.js Backend Server URL
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/esp32/telemetry";

// Hardware Pins
#define DHTPIN 4
#define DHTTYPE DHT22
#define BUZZER_PIN 18
#define STATUS_LED 2

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  dht.begin();

  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }
  digitalWrite(STATUS_LED, HIGH);
  Serial.println("\\nWiFi Connected! IP Address: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read temperature and humidity from DHT22
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      delay(2000);
      return;
    }

    Serial.printf("Fridge Temp: %.1f C, Humidity: %.1f %%\n", temperature, humidity);

    // Audio alarm if outside safe threshold (2 C - 8 C)
    if (temperature < 2.0 || temperature > 8.0) {
      digitalWrite(BUZZER_PIN, HIGH); // Alarm ON
    } else {
      digitalWrite(BUZZER_PIN, LOW);  // Alarm OFF
    }

    // Send HTTP POST to Node.js MERN Backend
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\\"deviceId\\":\\"ESP32-LAB-COLD-01\\",\\"temperature\\":" 
                         + String(temperature, 1) + ",\\"humidity\\":" 
                         + String(humidity, 1) + ",\\"doorStatus\\":\\"Closed\\"}";

    int httpResponseCode = http.POST(jsonPayload);
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    http.end();
  }

  // Send every 10 seconds (for college testing)
  delay(10000);
}
`;

  res.type('text/plain').send(inoCode);
});

export default router;
