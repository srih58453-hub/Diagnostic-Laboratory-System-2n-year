import { Router, Response } from 'express';
import { labDb, IReport } from '../db/mockDb.ts';
import { verifyToken, checkRole, AuthRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/reports - Get all reports
router.get('/', verifyToken, (req: AuthRequest, res: Response) => {
  try {
    let reports = [...labDb.reports];

    // If Patient is logged in, only return reports for this patient
    if (req.user?.role === 'Patient') {
      const patient = labDb.patients.find(p => p.email.toLowerCase() === req.user?.email.toLowerCase());
      reports = reports.filter(r => r.patientId === patient?.patientId || r.patientName.toLowerCase() === req.user?.name.toLowerCase());
    }

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/:id - Get complete printable report details with results
router.get('/:id', verifyToken, (req: AuthRequest, res: Response) => {
  const report = labDb.reports.find(r => r._id === req.params.id || r.reportId === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const order = labDb.orders.find(o => o.orderId === report.orderId);
  const patient = labDb.patients.find(p => p.patientId === report.patientId);
  const results = labDb.results.filter(r => r.orderId === report.orderId);
  const samples = labDb.samples.filter(s => s.orderId === report.orderId);

  res.json({
    success: true,
    report,
    order,
    patient,
    results,
    samples
  });
});

// POST /api/reports/verify - Verify and finalize a report (Admin or Lab Technician)
router.post('/verify', verifyToken, checkRole(['Admin', 'Lab Technician']), (req: AuthRequest, res: Response) => {
  try {
    const { orderId, doctorName, summary } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = labDb.orders.find(o => o.orderId === orderId || o._id === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if report already exists for this order
    let report = labDb.reports.find(r => r.orderId === order.orderId);

    if (report) {
      report.status = 'Verified';
      report.verifiedBy = req.user?.name || 'Pathologist';
      report.summary = summary || report.summary;
      report.verifiedDate = new Date().toISOString();
      report.pdfGenerated = true;
    } else {
      const repNum = labDb.reports.length + 901;
      report = {
        _id: `rep_${Date.now()}`,
        reportId: `REP-${repNum}`,
        orderId: order.orderId,
        patientId: order.patientId,
        patientName: order.patientName,
        doctorName: doctorName || order.doctorName || 'Dr. Suresh Kumar, MD (Path)',
        verifiedBy: req.user?.name || 'Pathologist',
        summary: summary || 'All sample investigations completed and reviewed.',
        status: 'Verified',
        verifiedDate: new Date().toISOString(),
        pdfGenerated: true
      };
      labDb.reports.unshift(report);
    }

    // Mark order as Completed!
    order.status = 'Completed';

    res.status(201).json({
      success: true,
      message: 'Report verified and issued! Patient can now view and download.',
      report
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
