import mongoose, { Document, Schema, Types } from 'mongoose';

export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface IStageHistory {
  stage: ApplicationStage;
  movedBy: Types.ObjectId;
  movedAt: Date;
}

export interface IApplication extends Document {
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  resumeUrl: string;
  coverNote?: string;
  stage: ApplicationStage;
  stageHistory: IStageHistory[];
  atsScore?: any; // Will use ATSScore type from atsScorer
  createdAt: Date;
  updatedAt: Date;
}

const StageHistorySchema = new Schema(
  {
    stage: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
      required: true,
    },
    movedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ATSScoreSchema = new Schema(
  {
    matchScore: { type: Number, required: true },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    sectionFlags: {
      hasContactInfo: { type: Boolean, required: true },
      hasSkillsSection: { type: Boolean, required: true },
      hasExperienceSection: { type: Boolean, required: true },
      hasEducationSection: { type: Boolean, required: true },
    },
    summary: { type: String, required: true },
    scoredBy: { type: String, enum: ['gemini', 'keyword-fallback'], required: true },
    scoredAt: { type: Date, required: true },
  },
  { _id: false }
);

const ApplicationSchema: Schema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required'],
    },
    coverNote: {
      type: String,
    },
    stage: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
      default: 'applied',
    },
    stageHistory: [StageHistorySchema],
    atsScore: {
      type: ATSScoreSchema,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications by the same candidate to the same job
ApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

// Index for getting all applications for a specific job quickly
ApplicationSchema.index({ jobId: 1, stage: 1 });

export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
