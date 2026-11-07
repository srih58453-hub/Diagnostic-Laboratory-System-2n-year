import { Router, Request, Response } from 'express';
import { labDb, ITest } from '../db/mockDb.ts';
import { verifyToken, checkRole, AuthRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/tests - Get all available diagnostic tests
router.get('/', (req: Request, res: Response) => {
  const category = req.query.category as string;
  let tests = labDb.tests;
  if (category && category !== 'All') {
    tests = tests.filter(t => t.category === category);
  }
  res.json({
    success: true,
    tests
  });
});

// POST /api/tests - Add a new diagnostic test (Admin / Lab Technician)
router.post('/', verifyToken, checkRole(['Admin', 'Lab Technician']), (req: AuthRequest, res: Response) => {
  try {
    const { testName, category, price, sampleType, normalRange, unit, turnaroundHours, storageTempMin, storageTempMax } = req.body;

    if (!testName || !price || !sampleType) {
      return res.status(400).json({
        success: false,
        message: 'Test name, price, and sample type are required.'
      });
    }

    const newTest: ITest = {
      _id: `t_${Date.now()}`,
      testCode: `LAB-${Math.floor(100 + Math.random() * 900)}`,
      testName,
      category: category || 'Biochemistry',
      price: Number(price),
      sampleType: sampleType || 'Blood',
      normalRange: normalRange || 'N/A',
      unit: unit || 'N/A',
      turnaroundHours: Number(turnaroundHours) || 4,
      storageTempMin: Number(storageTempMin) || 2,
      storageTempMax: Number(storageTempMax) || 8,
    };

    labDb.tests.push(newTest);

    res.status(201).json({
      success: true,
      message: 'Diagnostic test added to catalog successfully!',
      test: newTest
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/tests/:id - Remove test (Admin only)
router.delete('/:id', verifyToken, checkRole(['Admin']), (req: AuthRequest, res: Response) => {
  const index = labDb.tests.findIndex(t => t._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Test not found' });
  }
  labDb.tests.splice(index, 1);
  res.json({ success: true, message: 'Test deleted successfully from catalog' });
});

export default router;
