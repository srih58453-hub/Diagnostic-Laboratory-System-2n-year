import { Router, Response } from 'express';
import { labDb, IPayment } from '../db/mockDb.ts';
import { verifyToken, checkRole, AuthRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/payments - Get payments list
router.get('/', verifyToken, (req: AuthRequest, res: Response) => {
  try {
    let payments = [...labDb.payments];

    // If Patient, filter by name
    if (req.user?.role === 'Patient') {
      payments = payments.filter(p => p.patientName.toLowerCase() === req.user?.name.toLowerCase());
    }

    res.json({
      success: true,
      count: payments.length,
      totalCollected: payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0),
      payments
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments - Process payment (Receptionist / Admin)
router.post('/', verifyToken, checkRole(['Admin', 'Receptionist']), (req: AuthRequest, res: Response) => {
  try {
    const { orderId, amount, method } = req.body;

    if (!orderId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and payment method are required.'
      });
    }

    const order = labDb.orders.find(o => o.orderId === orderId || o._id === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const paymentNum = labDb.payments.length + 301;
    const newPayment: IPayment = {
      _id: `pay_${Date.now()}`,
      paymentId: `PAY-${paymentNum}`,
      orderId: order.orderId,
      patientName: order.patientName,
      amount: Number(amount),
      method: method || 'UPI',
      status: 'Completed',
      transactionDate: new Date().toISOString()
    };

    labDb.payments.unshift(newPayment);

    // Update order payment status
    order.paymentStatus = 'Paid';

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully!',
      payment: newPayment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
