import { Router, Response } from 'express';
import { labDb, IPatient } from '../db/mockDb.ts';
import { verifyToken, checkRole, AuthRequest } from '../middleware/authMiddleware.ts';

const router = Router();

// GET /api/patients - Get all patients with search filter
router.get('/', verifyToken, (req: AuthRequest, res: Response) => {
  try {
    const search = ((req.query.search as string) || '').toLowerCase();
    
    let filtered = labDb.patients;

    // If patient is logged in, only return their own record
    if (req.user?.role === 'Patient') {
      filtered = filtered.filter(p => p.email.toLowerCase() === req.user?.email.toLowerCase());
    } else if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.patientId.toLowerCase().includes(search) ||
        p.phone.includes(search) ||
        p.bloodGroup.toLowerCase().includes(search)
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      patients: filtered
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/patients - Register a new patient (Receptionist or Admin)
router.post('/', verifyToken, checkRole(['Admin', 'Receptionist']), (req: AuthRequest, res: Response) => {
  try {
    const { name, age, gender, phone, email, address, bloodGroup } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Patient name and phone number are required.'
      });
    }

    const nextIdNum = labDb.patients.length + 101;
    const newPatient: IPatient = {
      _id: `pat_${Date.now()}`,
      patientId: `PAT-${nextIdNum}`,
      name,
      age: Number(age) || 0,
      gender: gender || 'Male',
      phone,
      email: email || '',
      address: address || '',
      bloodGroup: bloodGroup || 'O+',
      createdAt: new Date().toISOString()
    };

    labDb.patients.unshift(newPatient);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully!',
      patient: newPatient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/patients/:id - Delete patient (Admin only)
router.delete('/:id', verifyToken, checkRole(['Admin']), (req: AuthRequest, res: Response) => {
  const index = labDb.patients.findIndex(p => p._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  labDb.patients.splice(index, 1);
  res.json({ success: true, message: 'Patient record removed successfully' });
});

export default router;
