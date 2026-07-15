import express from 'express';
import { z } from 'zod';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { upload } from '../lib/cloudinary';
import { getIo } from '../index'; 
import { extractTextFromUrl } from '../lib/resumeParser';
import { scoreApplication } from '../lib/atsScorer';
import redisClient from '../lib/redis';

const router = express.Router();

const stageSchema = z.object({
  stage: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']),
});

// POST /api/applications - candidate only
router.post('/', requireAuth, requireRole(['candidate']), (req, res, next) => {
  console.log('Cloudinary Config Check:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    has_api_key: !!process.env.CLOUDINARY_API_KEY,
    has_api_secret: !!process.env.CLOUDINARY_API_SECRET
  });
  
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req: AuthRequest, res) => {
  try {
    const { jobId, coverNote } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Resume is required' });
    }

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    // Check if job exists
    const job = await Job.findOne({ _id: jobId, status: 'open', deletedAt: null });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or not open' });
    }

    const application = new Application({
      candidateId: req.user!.id,
      jobId,
      resumeUrl: req.file.path,
      coverNote,
      stage: 'applied',
      stageHistory: [{
        stage: 'applied',
        movedBy: req.user!.id,
      }],
      atsScore: null // Initially null
    });

    await application.save();
    res.status(201).json(application);

    // Asynchronously run ATS Scoring (non-blocking)
    (async () => {
      try {
        const resumeText = await extractTextFromUrl(application.resumeUrl);
        const atsScore = await scoreApplication(resumeText, job.description || '');
        
        // Update DB
        application.atsScore = atsScore;
        await application.save();

        // Update Redis Cache if connected
        try {
          if (redisClient.isOpen) {
            const redisKey = `ats:${application._id}`;
            await redisClient.set(redisKey, JSON.stringify(atsScore), {
              EX: 86400 // 24 hours TTL
            });
          }
        } catch (redisErr) {
          console.warn('Redis cache failed (non-fatal):', redisErr);
        }

        // Notify recruiter via Socket.io if connected
        const io = getIo();
        if (io) {
          io.to(`job_${jobId}`).emit('application:scored', application);
        }
      } catch (err) {
        console.error('Background ATS scoring failed:', err);
      }
    })();
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already applied to this job.' });
    }
    console.error('Error applying to job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/applications/me - candidate only
router.get('/me', requireAuth, requireRole(['candidate']), async (req: AuthRequest, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user!.id })
      .populate('jobId', 'title department location')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id/applications - recruiter/admin only
router.get('/jobs/:jobId', requireAuth, requireRole(['recruiter', 'admin']), async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'name email avatar initials')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/applications/:id/stage - recruiter/admin only
router.patch('/:id/stage', requireAuth, requireRole(['recruiter', 'admin']), async (req: AuthRequest, res) => {
  try {
    const { stage } = stageSchema.parse(req.body);
    
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    application.stage = stage;
    application.stageHistory.push({
      stage,
      movedBy: req.user!.id as any,
      movedAt: new Date()
    });

    await application.save();

    // Populate candidate for the socket event
    await application.populate('candidateId', 'name email avatar initials');

    // Emit socket event
    const io = getIo();
    if (io) {
      io.to(`job_${application.jobId}`).emit('application:stage-changed', application);
    }

    res.json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('Error updating application stage:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
