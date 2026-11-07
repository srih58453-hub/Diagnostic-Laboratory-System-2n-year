import { Router, Response } from 'express';
import { labDb, ITestOrder } from '../db/mockDb.ts';
import { verifyToken, checkRole, AuthRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/orders - Get orders with status filter, search, and pagination
router.get('/', verifyToken, (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string;
    const search = ((req.query.search as string) || '').toLowerCase();

    let orders = [...labDb.orders];

    // If role is Patient, restrict to their orders
    if (req.user?.role === 'Patient') {
      orders = orders.filter(o => {
        const patient = labDb.patients.find(p => p.patientId === o.patientId || p.email.toLowerCase() === req.user?.email.toLowerCase());
        return o.patientId === patient?.patientId || o.patientName.toLowerCase() === req.user?.name.toLowerCase();
      });
    }

    if (status && status !== 'All') {
      orders = orders.filter(o => o.status === status);
    }

    if (search) {
      orders = orders.filter(o =>
        o.orderId.toLowerCase().includes(search) ||
        o.patientName.toLowerCase().includes(search) ||
        o.patientId.toLowerCase().includes(search)
      );
    }

    // Sort by newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders - Create a new test order (Receptionist / Admin)
router.post('/', verifyToken, checkRole(['Admin', 'Receptionist']), (req: AuthRequest, res: Response) => {
  try {
    const { patientId, testIds, doctorName, notes, paymentMethod } = req.body;

    if (!patientId || !testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid patient and at least one test.'
      });
    }

    const patient = labDb.patients.find(p => p.patientId === patientId || p._id === patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Calculate total amount and resolve test names
    const selectedTests = labDb.tests.filter(t => testIds.includes(t._id));
    const totalAmount = selectedTests.reduce((sum, t) => sum + t.price, 0);
    const testNames = selectedTests.map(t => t.testName);

    const orderNum = labDb.orders.length + 1;
    const orderId = `ORD-2026-${String(orderNum).padStart(3, '0')}`;

    const newOrder: ITestOrder = {
      _id: `ord_${Date.now()}`,
      orderId,
      patientId: patient.patientId,
      patientName: patient.name,
      testIds,
      testNames,
      totalAmount,
      status: 'Pending',
      paymentStatus: paymentMethod ? 'Paid' : 'Pending',
      doctorName: doctorName || 'Self / Referral',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    labDb.orders.unshift(newOrder);

    // If payment was made immediately at booking
    if (paymentMethod) {
      labDb.payments.unshift({
        _id: `pay_${Date.now()}`,
        paymentId: `PAY-${Math.floor(100 + Math.random() * 900)}`,
        orderId: newOrder.orderId,
        patientName: patient.name,
        amount: totalAmount,
        method: paymentMethod,
        status: 'Completed',
        transactionDate: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Test order booked successfully!',
      order: newOrder
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/orders/:id/status - Update order status (Lab Tech / Admin)
router.patch('/:id/status', verifyToken, checkRole(['Admin', 'Lab Technician']), (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const order = labDb.orders.find(o => o._id === req.params.id || o.orderId === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  res.json({ success: true, message: `Order status updated to ${status}`, order });
});

export default router;
