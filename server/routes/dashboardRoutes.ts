import { Router, Request, Response } from 'express';
import { labDb } from '../db/mockDb.ts';

const router = Router();

// GET /api/dashboard/stats - Lab summary statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const totalPatients = labDb.patients.length;
    const totalOrders = labDb.orders.length;
    const pendingOrders = labDb.orders.filter(o => o.status === 'Pending').length;
    const inTestingOrders = labDb.orders.filter(o => o.status === 'In Testing' || o.status === 'Sample Collected').length;
    const completedOrders = labDb.orders.filter(o => o.status === 'Completed').length;
    
    const totalRevenue = labDb.payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPaymentAmount = labDb.orders
      .filter(o => o.paymentStatus === 'Pending')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const latestTelemetry = labDb.telemetry[0] || null;

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalOrders,
        pendingOrders,
        inTestingOrders,
        completedOrders,
        totalRevenue,
        pendingPaymentAmount,
        testsAvailable: labDb.tests.length,
        samplesInColdStorage: labDb.samples.filter(s => s.status === 'Stored in Cold Unit').length,
        esp32Status: {
          currentTemp: latestTelemetry ? latestTelemetry.temperature : 4.0,
          currentHumidity: latestTelemetry ? latestTelemetry.humidity : 48.0,
          isSafe: latestTelemetry ? latestTelemetry.isSafe : true,
          alertMessage: latestTelemetry?.alertMessage || 'Cold storage within safe limits'
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
