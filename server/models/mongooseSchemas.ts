/**
 * Mongoose Schemas & Models Definition for College Submission
 * Topic: 22. Diagnostic Laboratory System
 * Includes validations, enum types, references, and indexes.
 */

export const MongooseSchemasDocumentation = {
  UserSchema: `
  const mongoose = require('mongoose');
  const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, index: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    role: { type: String, enum: ['Admin', 'Lab Technician', 'Receptionist', 'Patient'], default: 'Patient' },
    phone: { type: String, trim: true }
  }, { timestamps: true });
  module.exports = mongoose.model('User', userSchema);
  `,

  PatientSchema: `
  const mongoose = require('mongoose');
  const patientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: [true, 'Patient name is required'] },
    age: { type: Number, required: true, min: 0, max: 125 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: [true, 'Contact number is required'], index: true },
    email: { type: String, lowercase: true },
    address: { type: String },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], default: 'Unknown' }
  }, { timestamps: true });
  module.exports = mongoose.model('Patient', patientSchema);
  `,

  TestSchema: `
  const mongoose = require('mongoose');
  const testSchema = new mongoose.Schema({
    testCode: { type: String, required: true, unique: true, uppercase: true },
    testName: { type: String, required: [true, 'Test title is required'] },
    category: { type: String, enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Serology', 'Endocrinology'], required: true },
    price: { type: Number, required: true, min: 0 },
    sampleType: { type: String, enum: ['Blood', 'Serum', 'Urine', 'Plasma', 'Swab'], required: true },
    normalRange: { type: String, default: 'N/A' },
    unit: { type: String, default: 'N/A' },
    turnaroundHours: { type: Number, default: 4 },
    storageTempMin: { type: Number, default: 2 },
    storageTempMax: { type: Number, default: 8 }
  }, { timestamps: true });
  module.exports = mongoose.model('Test', testSchema);
  `,

  TestOrderSchema: `
  const mongoose = require('mongoose');
  const testOrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    testIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    testNames: [{ type: String }],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Pending', 'Sample Collected', 'In Testing', 'Completed'], default: 'Pending', index: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    doctorName: { type: String, default: 'Self' },
    notes: { type: String }
  }, { timestamps: true });
  module.exports = mongoose.model('TestOrder', testOrderSchema);
  `,

  SampleSchema: `
  const mongoose = require('mongoose');
  const sampleSchema = new mongoose.Schema({
    sampleId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, ref: 'TestOrder' },
    patientName: { type: String, required: true },
    sampleType: { type: String, required: true },
    barcode: { type: String, required: true, unique: true },
    storageUnit: { type: String, default: 'ESP32 Cold Unit #1' },
    status: { type: String, enum: ['Collected', 'Stored in Cold Unit', 'Processed'], default: 'Stored in Cold Unit' },
    collectedAt: { type: Date, default: Date.now },
    collectedBy: { type: String, required: true }
  }, { timestamps: true });
  module.exports = mongoose.model('Sample', sampleSchema);
  `,

  ResultSchema: `
  const mongoose = require('mongoose');
  const resultSchema = new mongoose.Schema({
    resultId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    testName: { type: String, required: true },
    parameterName: { type: String, required: true },
    measuredValue: { type: String, required: true },
    unit: { type: String },
    normalRange: { type: String },
    status: { type: String, enum: ['Normal', 'Abnormal', 'Critical'], default: 'Normal' },
    testedBy: { type: String, required: true },
    testDate: { type: Date, default: Date.now },
    notes: { type: String }
  }, { timestamps: true });
  module.exports = mongoose.model('Result', resultSchema);
  `,

  ReportSchema: `
  const mongoose = require('mongoose');
  const reportSchema = new mongoose.Schema({
    reportId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorName: { type: String, required: true },
    verifiedBy: { type: String, required: true },
    summary: { type: String },
    status: { type: String, enum: ['Draft', 'Verified', 'Delivered'], default: 'Verified' },
    verifiedDate: { type: Date, default: Date.now },
    pdfGenerated: { type: Boolean, default: true }
  }, { timestamps: true });
  module.exports = mongoose.model('Report', reportSchema);
  `,

  PaymentSchema: `
  const mongoose = require('mongoose');
  const paymentSchema = new mongoose.Schema({
    paymentId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['Cash', 'Card', 'UPI'], required: true },
    status: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' },
    transactionDate: { type: Date, default: Date.now }
  }, { timestamps: true });
  module.exports = mongoose.model('Payment', paymentSchema);
  `,

  EspTelemetrySchema: `
  const mongoose = require('mongoose');
  const espTelemetrySchema = new mongoose.Schema({
    deviceId: { type: String, required: true, index: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    refrigeratorDoorStatus: { type: String, enum: ['Closed', 'Open'], default: 'Closed' },
    isSafe: { type: Boolean, required: true },
    alertMessage: { type: String }
  }, { timestamps: true });
  module.exports = mongoose.model('EspTelemetry', espTelemetrySchema);
  `
};
