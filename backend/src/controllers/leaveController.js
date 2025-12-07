import { LeaveRequest, LeaveApproval } from '../models/LeaveRequest.js';
import { User } from '../models/User.js';

export const createLeaveRequest = async (req, res) => {
  try {
    const { studentName, department, fromDate, toDate, reason, proofFile } = req.body;

    if (!studentName || !department || !fromDate || !toDate || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const leaveRequest = new LeaveRequest({
      studentId: req.userId,
      studentName,
      department,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      proofFile: proofFile || null,
      currentStage: 1,
      status: 'pending',
      approvals: [],
    });

    await leaveRequest.save();

    res.status(201).json({
      id: leaveRequest._id,
      studentId: leaveRequest.studentId,
      studentName: leaveRequest.studentName,
      department: leaveRequest.department,
      fromDate: leaveRequest.fromDate,
      toDate: leaveRequest.toDate,
      reason: leaveRequest.reason,
      proofFile: leaveRequest.proofFile,
      currentStage: leaveRequest.currentStage,
      status: leaveRequest.status,
      createdAt: leaveRequest.createdAt,
      approvals: leaveRequest.approvals,
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

export const getStudentLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ studentId: req.userId });

    res.json(
      leaveRequests.map((request) => ({
        id: request._id,
        studentId: request.studentId,
        studentName: request.studentName,
        department: request.department,
        fromDate: request.fromDate,
        toDate: request.toDate,
        reason: request.reason,
        proofFile: request.proofFile,
        currentStage: request.currentStage,
        status: request.status,
        createdAt: request.createdAt,
        approvals: request.approvals,
      }))
    );
  } catch (error) {
    console.error('Get student leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

export const getPendingApprovalsForStage = async (req, res) => {
  try {
    const { stage } = req.params;
    const stageNum = parseInt(stage, 10);

    if (![1, 2, 3].includes(stageNum)) {
      return res.status(400).json({ error: 'Invalid stage number' });
    }

    const leaveRequests = await LeaveRequest.find({
      currentStage: stageNum,
      status: 'pending',
    });

    res.json(
      leaveRequests.map((request) => ({
        id: request._id,
        studentId: request.studentId,
        studentName: request.studentName,
        department: request.department,
        fromDate: request.fromDate,
        toDate: request.toDate,
        reason: request.reason,
        proofFile: request.proofFile,
        currentStage: request.currentStage,
        status: request.status,
        createdAt: request.createdAt,
        approvals: request.approvals,
      }))
    );
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { comment } = req.body;

    const leaveRequest = await LeaveRequest.findById(leaveId);

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const user = await User.findById(req.userId);

    const approval = {
      leaveId: leaveRequest._id,
      approverId: req.userId,
      approverName: user.name,
      stageNumber: leaveRequest.currentStage,
      decision: 'approved',
      comment: comment || null,
      decidedAt: new Date(),
    };

    leaveRequest.approvals.push(approval);

    // Move to next stage or mark as approved
    if (leaveRequest.currentStage < 3) {
      leaveRequest.currentStage += 1;
    } else {
      leaveRequest.status = 'approved';
    }

    await leaveRequest.save();

    res.json({
      id: leaveRequest._id,
      studentId: leaveRequest.studentId,
      studentName: leaveRequest.studentName,
      department: leaveRequest.department,
      fromDate: leaveRequest.fromDate,
      toDate: leaveRequest.toDate,
      reason: leaveRequest.reason,
      proofFile: leaveRequest.proofFile,
      currentStage: leaveRequest.currentStage,
      status: leaveRequest.status,
      createdAt: leaveRequest.createdAt,
      approvals: leaveRequest.approvals,
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const leaveRequest = await LeaveRequest.findById(leaveId);

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const user = await User.findById(req.userId);

    const approval = {
      leaveId: leaveRequest._id,
      approverId: req.userId,
      approverName: user.name,
      stageNumber: leaveRequest.currentStage,
      decision: 'rejected',
      comment,
      decidedAt: new Date(),
    };

    leaveRequest.approvals.push(approval);
    leaveRequest.status = 'rejected';

    await leaveRequest.save();

    res.json({
      id: leaveRequest._id,
      studentId: leaveRequest.studentId,
      studentName: leaveRequest.studentName,
      department: leaveRequest.department,
      fromDate: leaveRequest.fromDate,
      toDate: leaveRequest.toDate,
      reason: leaveRequest.reason,
      proofFile: leaveRequest.proofFile,
      currentStage: leaveRequest.currentStage,
      status: leaveRequest.status,
      createdAt: leaveRequest.createdAt,
      approvals: leaveRequest.approvals,
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ error: 'Failed to reject leave request' });
  }
};

export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find().populate('studentId', 'name email');

    res.json(
      leaveRequests.map((request) => ({
        id: request._id,
        studentId: request.studentId,
        studentName: request.studentName,
        department: request.department,
        fromDate: request.fromDate,
        toDate: request.toDate,
        reason: request.reason,
        proofFile: request.proofFile,
        currentStage: request.currentStage,
        status: request.status,
        createdAt: request.createdAt,
        approvals: request.approvals,
      }))
    );
  } catch (error) {
    console.error('Get all leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch all leave requests' });
  }
};
