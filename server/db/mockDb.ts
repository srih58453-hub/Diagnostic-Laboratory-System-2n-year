import bcrypt from 'bcryptjs';

// Types matching Mongoose Schemas taught in college syllabus
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // bcrypt hashed
  role: 'Admin' | 'Lab Technician' | 'Receptionist' | 'Patient';
  phone: string;
  createdAt: string;
}

export interface IPatient {
  _id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  createdAt: string;
}

export interface ITest {
  _id: string;
  testCode: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Serology' | 'Endocrinology';
  price: number;
  sampleType: 'Blood' | 'Serum' | 'Urine' | 'Plasma' | 'Swab';
  normalRange: string;
  unit: string;
  turnaroundHours: number;
  storageTempMin: number; // For ESP32 monitoring (e.g. 2°C)
  storageTempMax: number; // For ESP32 monitoring (e.g. 8°C)
}

export interface ITestOrder {
  _id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  testIds: string[];
  testNames: string[];
  totalAmount: number;
  status: 'Pending' | 'Sample Collected' | 'In Testing' | 'Completed';
  paymentStatus: 'Pending' | 'Paid';
  doctorName?: string;
  notes?: string;
  createdAt: string;
}

export interface ISample {
  _id: string;
  sampleId: string;
  orderId: string;
  patientName: string;
  sampleType: string;
  barcode: string;
  storageUnit: string; // e.g. "Cold Unit 1 (ESP32 Monitored)"
  status: 'Collected' | 'Stored in Cold Unit' | 'Processed';
  collectedAt: string;
  collectedBy: string;
}

export interface IResult {
  _id: string;
  resultId: string;
  orderId: string;
  patientName: string;
  testName: string;
  parameterName: string;
  measuredValue: string;
  unit: string;
  normalRange: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
  testedBy: string;
  testDate: string;
  notes: string;
}

export interface IReport {
  _id: string;
  reportId: string;
  orderId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  verifiedBy: string;
  summary: string;
  status: 'Draft' | 'Verified' | 'Delivered';
  verifiedDate: string;
  pdfGenerated: boolean;
}

export interface IPayment {
  _id: string;
  paymentId: string;
  orderId: string;
  patientName: string;
  amount: number;
  method: 'Cash' | 'Card' | 'UPI';
  status: 'Completed' | 'Pending';
  transactionDate: string;
}

export interface IEspTelemetry {
  _id: string;
  deviceId: string; // e.g. "ESP32-LAB-COLD-01"
  temperature: number; // in Celsius
  humidity: number; // in percentage
  refrigeratorDoorStatus: 'Closed' | 'Open';
  isSafe: boolean; // 2°C - 8°C is safe for blood & reagent samples
  timestamp: string;
  alertMessage?: string;
}

// In-Memory Database store with pre-seeded data for college lab demonstration
class LabDatabase {
  users: IUser[] = [];
  patients: IPatient[] = [];
  tests: ITest[] = [];
  orders: ITestOrder[] = [];
  samples: ISample[] = [];
  results: IResult[] = [];
  reports: IReport[] = [];
  payments: IPayment[] = [];
  telemetry: IEspTelemetry[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);

    // 1. Initial Users for all 4 roles
    this.users = [
      {
        _id: 'usr_1',
        name: 'Dr. Suresh Kumar (Admin)',
        email: 'admin@lab.com',
        password: bcrypt.hashSync('admin123', salt),
        role: 'Admin',
        phone: '9876543210',
        createdAt: '2026-10-01T10:00:00Z',
      },
      {
        _id: 'usr_2',
        name: 'Ananya Sharma (Technician)',
        email: 'tech@lab.com',
        password: bcrypt.hashSync('tech123', salt),
        role: 'Lab Technician',
        phone: '9876543211',
        createdAt: '2026-10-05T11:00:00Z',
      },
      {
        _id: 'usr_3',
        name: 'Pooja Verma (Receptionist)',
        email: 'reception@lab.com',
        password: bcrypt.hashSync('reception123', salt),
        role: 'Receptionist',
        phone: '9876543212',
        createdAt: '2026-10-10T09:30:00Z',
      },
      {
        _id: 'usr_4',
        name: 'Rahul Patel (Patient)',
        email: 'rahul@gmail.com',
        password: bcrypt.hashSync('patient123', salt),
        role: 'Patient',
        phone: '9876543213',
        createdAt: '2026-11-01T14:20:00Z',
      },
    ];

    // 2. Predefined Diagnostic Tests Catalog
    this.tests = [
      {
        _id: 't_1',
        testCode: 'CBC-01',
        testName: 'Complete Blood Count (CBC)',
        category: 'Hematology',
        price: 450,
        sampleType: 'Blood',
        normalRange: 'Hemoglobin: 13.0 - 17.0 g/dL',
        unit: 'g/dL',
        turnaroundHours: 4,
        storageTempMin: 2,
        storageTempMax: 6,
      },
      {
        _id: 't_2',
        testCode: 'LIP-02',
        testName: 'Lipid Profile Screen',
        category: 'Biochemistry',
        price: 800,
        sampleType: 'Serum',
        normalRange: 'Total Cholesterol: < 200 mg/dL',
        unit: 'mg/dL',
        turnaroundHours: 6,
        storageTempMin: 2,
        storageTempMax: 8,
      },
      {
        _id: 't_3',
        testCode: 'GLU-03',
        testName: 'Fasting Blood Sugar (FBS)',
        category: 'Biochemistry',
        price: 150,
        sampleType: 'Blood',
        normalRange: '70 - 100 mg/dL',
        unit: 'mg/dL',
        turnaroundHours: 2,
        storageTempMin: 2,
        storageTempMax: 8,
      },
      {
        _id: 't_4',
        testCode: 'THY-04',
        testName: 'Thyroid Function Test (T3, T4, TSH)',
        category: 'Endocrinology',
        price: 950,
        sampleType: 'Serum',
        normalRange: 'TSH: 0.4 - 4.0 uIU/mL',
        unit: 'uIU/mL',
        turnaroundHours: 12,
        storageTempMin: 2,
        storageTempMax: 6,
      },
      {
        _id: 't_5',
        testCode: 'LFT-05',
        testName: 'Liver Function Test (LFT)',
        category: 'Biochemistry',
        price: 750,
        sampleType: 'Serum',
        normalRange: 'SGPT: < 45 U/L, Bilirubin: 0.2 - 1.2 mg/dL',
        unit: 'U/L',
        turnaroundHours: 6,
        storageTempMin: 2,
        storageTempMax: 8,
      },
      {
        _id: 't_6',
        testCode: 'URN-06',
        testName: 'Urine Routine & Microscopic',
        category: 'Microbiology',
        price: 250,
        sampleType: 'Urine',
        normalRange: 'Color: Pale Yellow, Sugar: Nil',
        unit: 'cells/HPF',
        turnaroundHours: 3,
        storageTempMin: 4,
        storageTempMax: 8,
      },
    ];

    // 3. Patients
    this.patients = [
      {
        _id: 'pat_1',
        patientId: 'PAT-101',
        name: 'Rahul Patel',
        age: 34,
        gender: 'Male',
        phone: '9876543213',
        email: 'rahul@gmail.com',
        address: '24 MG Road, Bangalore',
        bloodGroup: 'B+',
        createdAt: '2026-11-01T14:20:00Z',
      },
      {
        _id: 'pat_2',
        patientId: 'PAT-102',
        name: 'Priyanka Sen',
        age: 28,
        gender: 'Female',
        phone: '9822334455',
        email: 'priyanka@gmail.com',
        address: '12 Sector 4, Indiranagar',
        bloodGroup: 'O+',
        createdAt: '2026-11-02T10:15:00Z',
      },
      {
        _id: 'pat_3',
        patientId: 'PAT-103',
        name: 'Vikram Joshi',
        age: 52,
        gender: 'Male',
        phone: '9845112233',
        email: 'vikram.j@yahoo.com',
        address: '77 Lake View, Koramangala',
        bloodGroup: 'A+',
        createdAt: '2026-11-03T16:45:00Z',
      },
    ];

    // 4. Test Orders
    this.orders = [
      {
        _id: 'ord_1',
        orderId: 'ORD-2026-001',
        patientId: 'PAT-101',
        patientName: 'Rahul Patel',
        testIds: ['t_1', 't_3'],
        testNames: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar (FBS)'],
        totalAmount: 600,
        status: 'Completed',
        paymentStatus: 'Paid',
        doctorName: 'Dr. R. K. Mehta',
        notes: 'Routine health checkup',
        createdAt: '2026-11-04T09:00:00Z',
      },
      {
        _id: 'ord_2',
        orderId: 'ORD-2026-002',
        patientId: 'PAT-102',
        patientName: 'Priyanka Sen',
        testIds: ['t_4'],
        testNames: ['Thyroid Function Test (T3, T4, TSH)'],
        totalAmount: 950,
        status: 'In Testing',
        paymentStatus: 'Paid',
        doctorName: 'Dr. Sunita Rao',
        notes: 'Fatigue and weight fluctuation',
        createdAt: '2026-11-05T11:30:00Z',
      },
      {
        _id: 'ord_3',
        orderId: 'ORD-2026-003',
        patientId: 'PAT-103',
        patientName: 'Vikram Joshi',
        testIds: ['t_2', 't_5'],
        testNames: ['Lipid Profile Screen', 'Liver Function Test (LFT)'],
        totalAmount: 1550,
        status: 'Sample Collected',
        paymentStatus: 'Pending',
        doctorName: 'Dr. R. K. Mehta',
        notes: 'Annual cardiology screening',
        createdAt: '2026-11-06T08:15:00Z',
      },
    ];

    // 5. Samples collected & monitored in ESP32 Cold Unit
    this.samples = [
      {
        _id: 'smp_1',
        sampleId: 'SMP-501',
        orderId: 'ORD-2026-001',
        patientName: 'Rahul Patel',
        sampleType: 'Blood',
        barcode: 'BC-889021',
        storageUnit: 'ESP32 Cold Unit #1',
        status: 'Processed',
        collectedAt: '2026-11-04T09:15:00Z',
        collectedBy: 'Ananya Sharma',
      },
      {
        _id: 'smp_2',
        sampleId: 'SMP-502',
        orderId: 'ORD-2026-002',
        patientName: 'Priyanka Sen',
        sampleType: 'Serum',
        barcode: 'BC-889022',
        storageUnit: 'ESP32 Cold Unit #1',
        status: 'Stored in Cold Unit',
        collectedAt: '2026-11-05T11:45:00Z',
        collectedBy: 'Ananya Sharma',
      },
      {
        _id: 'smp_3',
        sampleId: 'SMP-503',
        orderId: 'ORD-2026-003',
        patientName: 'Vikram Joshi',
        sampleType: 'Blood & Serum',
        barcode: 'BC-889023',
        storageUnit: 'ESP32 Cold Unit #1',
        status: 'Stored in Cold Unit',
        collectedAt: '2026-11-06T08:30:00Z',
        collectedBy: 'Ananya Sharma',
      },
    ];

    // 6. Test Results
    this.results = [
      {
        _id: 'res_1',
        resultId: 'RES-701',
        orderId: 'ORD-2026-001',
        patientName: 'Rahul Patel',
        testName: 'Complete Blood Count (CBC)',
        parameterName: 'Hemoglobin (Hb)',
        measuredValue: '14.5',
        unit: 'g/dL',
        normalRange: '13.0 - 17.0',
        status: 'Normal',
        testedBy: 'Ananya Sharma',
        testDate: '2026-11-04T11:00:00Z',
        notes: 'Within normal biological limits',
      },
      {
        _id: 'res_2',
        resultId: 'RES-702',
        orderId: 'ORD-2026-001',
        patientName: 'Rahul Patel',
        testName: 'Fasting Blood Sugar (FBS)',
        parameterName: 'Glucose Fasting',
        measuredValue: '92',
        unit: 'mg/dL',
        normalRange: '70 - 100',
        status: 'Normal',
        testedBy: 'Ananya Sharma',
        testDate: '2026-11-04T11:10:00Z',
        notes: 'Fasting condition confirmed',
      },
    ];

    // 7. Verified Reports
    this.reports = [
      {
        _id: 'rep_1',
        reportId: 'REP-901',
        orderId: 'ORD-2026-001',
        patientId: 'PAT-101',
        patientName: 'Rahul Patel',
        doctorName: 'Dr. Suresh Kumar, MD (Path)',
        verifiedBy: 'Dr. Suresh Kumar',
        summary: 'All hematology and fasting glucose parameters are healthy.',
        status: 'Verified',
        verifiedDate: '2026-11-04T14:00:00Z',
        pdfGenerated: true,
      },
    ];

    // 8. Payments
    this.payments = [
      {
        _id: 'pay_1',
        paymentId: 'PAY-301',
        orderId: 'ORD-2026-001',
        patientName: 'Rahul Patel',
        amount: 600,
        method: 'UPI',
        status: 'Completed',
        transactionDate: '2026-11-04T09:05:00Z',
      },
      {
        _id: 'pay_2',
        paymentId: 'PAY-302',
        orderId: 'ORD-2026-002',
        patientName: 'Priyanka Sen',
        amount: 950,
        method: 'Card',
        status: 'Completed',
        transactionDate: '2026-11-05T11:35:00Z',
      },
    ];

    // 9. ESP32 Refrigerator Telemetry Readings (Safe temp for lab samples is 2°C to 8°C)
    this.telemetry = [
      {
        _id: 'tel_1',
        deviceId: 'ESP32-LAB-COLD-01',
        temperature: 4.2,
        humidity: 48.5,
        refrigeratorDoorStatus: 'Closed',
        isSafe: true,
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        alertMessage: 'Normal operating conditions (2°C - 8°C)',
      },
      {
        _id: 'tel_2',
        deviceId: 'ESP32-LAB-COLD-01',
        temperature: 4.5,
        humidity: 49.0,
        refrigeratorDoorStatus: 'Closed',
        isSafe: true,
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        alertMessage: 'Normal operating conditions (2°C - 8°C)',
      },
      {
        _id: 'tel_3',
        deviceId: 'ESP32-LAB-COLD-01',
        temperature: 4.1,
        humidity: 47.8,
        refrigeratorDoorStatus: 'Closed',
        isSafe: true,
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        alertMessage: 'Normal operating conditions (2°C - 8°C)',
      },
    ];
  }
}

export const labDb = new LabDatabase();
