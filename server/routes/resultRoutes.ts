import { Router, Response } from 'express';
import { labDb, IResult } from '../db/mockDb.ts';
import { verifyToken, checkRole, AuthRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/results - Get test results (filter by orderId if provided)
router.get('/', verifyToken, (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.query.orderId as string;
    let results = [...labDb.results];

    if (orderId) {
      results = results.filter(r => r.orderId === orderId);
    }

    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/results - Enter a test result (Lab Technician / Admin)
router.post('/', verifyToken, checkRole(['Admin', 'Lab Technician']), (req: AuthRequest, res: Response) => {
  try {
    const { orderId, testName, parameterName, measuredValue, unit, normalRange, status, notes } = req.body;

    if (!orderId || !parameterName || !measuredValue) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, parameter name, and measured value are required.'
      });
    }

    const order = labDb.orders.find(o => o.orderId === orderId || o._id === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated test order not found' });
    }

    const resultNum = labDb.results.length + 701;
    const newResult: IResult = {
      _id: `res_${Date.now()}`,
      resultId: `RES-${resultNum}`,
      orderId: order.orderId,
      patientName: order.patientName,
      testName: testName || 'Diagnostic Test',
      parameterName,
      measuredValue,
      unit: unit || 'N/A',
      normalRange: normalRange || 'N/A',
      status: status || 'Normal',
      testedBy: req.user?.name || 'Lab Technician',
      testDate: new Date().toISOString(),
      notes: notes || 'Test completed on automated analyzer.'
    };

    labDb.results.unshift(newResult);

    // Update order status to 'In Testing'
    if (order.status === 'Sample Collected' || order.status === 'Pending') {
      order.status = 'In Testing';
    }

    res.status(201).json({
      success: true,
      message: 'Test parameter result recorded successfully!',
      result: newResult
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
