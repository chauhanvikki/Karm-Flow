import express from 'express';
import { z } from 'zod';
import { Job } from '../models/Job';
import { requireAuth, requireRole, optionalAuth, AuthRequest } from '../middleware/auth';
const router = express.Router();

const jobSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  department: z.string().min(2, 'Department is required'),
  location: z.string().min(2, 'Location is required'),
  employmentType: z.enum(['Remote', 'Onsite', 'Hybrid']),
  summary: z.string().min(10, 'Summary is required'),
  description: z.string().min(50, 'Description needs to be more detailed'),
  requirements: z.array(z.string()).default([]),
  status: z.enum(['draft', 'open', 'closed']).optional().default('draft'),
});

const partialJobSchema = jobSchema.partial();

// POST /api/jobs - recruiter/admin only
router.post('/', requireAuth, requireRole(['recruiter', 'admin']), async (req: AuthRequest, res) => {
  try {
    const validatedData = jobSchema.parse(req.body);

    const job = new Job({
      ...validatedData,
      createdBy: req.user!.id,
    });

    await job.save();

    // Cache disabled

    res.status(201).json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs - public if mine is false/omitted, otherwise auth required
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const mine = req.query.mine === 'true';

    if (mine) {
      if (!req.user || (req.user.role !== 'recruiter' && req.user.role !== 'admin')) {
        return res.status(401).json({ message: 'Unauthorized to view own jobs' });
      }
      
      const jobs = await Job.find({ createdBy: req.user.id, deletedAt: null }).sort({ createdAt: -1 });
      return res.json(jobs);
    }

    // Cache disabled

    const jobs = await Job.find({ status: 'open', deletedAt: null }).sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id - public if open, else requires recruiter/admin auth
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, deletedAt: null });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status === 'open') {
      return res.json(job);
    }

    if (!req.user || (req.user.role !== 'recruiter' && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/jobs/:id - recruiter/admin only
router.patch('/:id', requireAuth, requireRole(['recruiter', 'admin']), async (req: AuthRequest, res) => {
  try {
    const validatedData = partialJobSchema.parse(req.body);
    
    const job = await Job.findOne({ _id: req.params.id, deletedAt: null });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own jobs' });
    }

    Object.assign(job, validatedData);
    await job.save();

    // Cache disabled

    res.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
