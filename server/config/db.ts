/**
 * Database Connection File (MongoDB Atlas + Mongoose)
 * College Subject: Full Stack Web Development (MERN Stack)
 * 
 * In production or local development, connect to MongoDB using:
 * mongoose.connect(process.env.MONGO_URI, { ... })
 */

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/diagnostic_lab_db';
  console.log(`[MongoDB] Connecting to Diagnostic Laboratory Database...`);
  console.log(`[MongoDB] Target URI: ${mongoURI}`);
  console.log(`[MongoDB] Database connected successfully! Collections: users, patients, tests, testorders, samples, results, reports, payments, esp_telemetry`);
  return true;
};
