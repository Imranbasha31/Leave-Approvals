import mongoose from 'mongoose';

const leaveApprovalSchema = new mongoose.Schema(
  {
    leaveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveRequest',
      required: true,
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approverName: {
      type: String,
      required: true,
    },
    stageNumber: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },
    decision: {
      type: String,
      enum: ['approved', 'rejected', 'pending'],
      default: 'pending',
    },
    comment: {
      type: String,
      default: null,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const leaveRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    proofFile: {
      type: String,
      default: null,
    },
    currentStage: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvals: [leaveApprovalSchema],
  },
  {
    timestamps: true,
  }
);

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export const LeaveApproval = mongoose.model('LeaveApproval', leaveApprovalSchema);
