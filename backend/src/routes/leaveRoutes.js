import express from 'express';
import {
  createLeaveRequest,
  getStudentLeaveRequests,
  getPendingApprovalsForStage,
  approveLeave,
  rejectLeave,
  getAllLeaveRequests,
} from '../controllers/leaveController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/requests', createLeaveRequest);
router.get('/requests/my', getStudentLeaveRequests);
router.get('/requests/all', getAllLeaveRequests);
router.get('/approvals/stage/:stage', getPendingApprovalsForStage);
router.post('/requests/:leaveId/approve', approveLeave);
router.post('/requests/:leaveId/reject', rejectLeave);

export default router;
