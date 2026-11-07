import { Router, Response } from 'express';
import { labDb, ISample } from '../db/mockDb.ts';
import { verifyToken, checkRole, AuthRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/samples - Get all collected samples
router.get('/', verifyToken, (req: AuthRequest, res: Response) => {
  try {
    const search = ((req.query.search as string) || '').toLowerCase();
    let samples = [...labDb.samples];

    if (search) {
      samples = samples.filter(s =>
        s.sampleId.toLowerCase().includes(search) ||
        s.barcode.toLowerCase().includes(search) ||
        s.patientName.toLowerCase().includes(search) ||
        s.orderId.toLowerCase().includes(search)
      );
    }

    res.json({
      success: true,
      count: samples.length,
      samples
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/samples/collect - Collect sample for an order (Lab Technician / Admin)
router.post('/collect', verifyToken, checkRole(['Admin', 'Lab Technician']), (req: AuthRequest, res: Response) => {
  try {
    const { orderId, sampleType, storageUnit } = req.body;

    if (!orderId || !sampleType) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and sample type are required.'
      });
    }

    const order = labDb.orders.find(o => o.orderId === orderId || o._id === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const sampleNum = labDb.samples.length + 501;
    const barcodeNum = Math.floor(100000 + Math.random() * 900000);

    const newSample: ISample = {
      _id: `smp_${Date.now()}`,
      sampleId: `SMP-${sampleNum}`,
      orderId: order.orderId,
      patientName: order.patientName,
      sampleType,
      barcode: `BC-${barcodeNum}`,
      storageUnit: storageUnit || 'ESP32 Cold Unit #1',
      status: 'Stored in Cold Unit',
      collectedAt: new Date().toISOString(),
      collectedBy: req.user?.name || 'Lab Technician'
    };

    labDb.samples.unshift(newSample);

    // Update order status to 'Sample Collected' if it was 'Pending'
    if (order.status === 'Pending') {
      order.status = 'Sample Collected';
    }

    res.status(201).json({
      success: true,
      message: 'Sample collected and safely placed into ESP32 Monitored Cold Unit!',
      sample: newSample
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/samples/:id/status - Update sample status (e.g. to Processed)
router.patch('/:id/status', verifyToken, checkRole(['Admin', 'Lab Technician']), (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const sample = labDb.samples.find(s => s._id === req.params.id || s.sampleId === req.params.id);

  if (!sample) {
    return res.status(404).json({ success: false, message: 'Sample not found' });
  }

  sample.status = status;
  res.json({ success: true, message: `Sample status marked as ${status}`, sample });
});

export default router;
