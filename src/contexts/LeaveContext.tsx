import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LeaveRequest, LeaveApproval, ApprovalStage } from '@/types/leave';

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'approvals' | 'currentStage' | 'status'>) => void;
  approveLeave: (leaveId: string, approverId: string, approverName: string, stage: ApprovalStage, comment?: string) => void;
  rejectLeave: (leaveId: string, approverId: string, approverName: string, stage: ApprovalStage, comment: string) => void;
  getLeavesByStudent: (studentId: string) => LeaveRequest[];
  getPendingApprovals: (stage: ApprovalStage) => LeaveRequest[];
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

// Mock initial data
const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Student',
    department: 'Computer Science',
    fromDate: '2024-12-10',
    toDate: '2024-12-12',
    reason: 'Family function - Sister\'s wedding ceremony',
    currentStage: 2,
    status: 'pending',
    createdAt: '2024-12-05',
    approvals: [
      { id: 'a1', leaveId: '1', approverId: '2', approverName: 'Dr. Sarah Advisor', stageNumber: 1, decision: 'approved', comment: 'Approved. Valid reason.', decidedAt: '2024-12-05' }
    ]
  },
  {
    id: '2',
    studentId: '1',
    studentName: 'John Student',
    department: 'Computer Science',
    fromDate: '2024-11-20',
    toDate: '2024-11-22',
    reason: 'Medical emergency - Hospitalization',
    currentStage: 3,
    status: 'approved',
    createdAt: '2024-11-18',
    approvals: [
      { id: 'a2', leaveId: '2', approverId: '2', approverName: 'Dr. Sarah Advisor', stageNumber: 1, decision: 'approved', decidedAt: '2024-11-18' },
      { id: 'a3', leaveId: '2', approverId: '3', approverName: 'Dr. Michael HOD', stageNumber: 2, decision: 'approved', decidedAt: '2024-11-19' },
      { id: 'a4', leaveId: '2', approverId: '4', approverName: 'Prof. Elizabeth Principal', stageNumber: 3, decision: 'approved', comment: 'Final approval granted.', decidedAt: '2024-11-19' }
    ]
  },
  {
    id: '3',
    studentId: '1',
    studentName: 'John Student',
    department: 'Computer Science',
    fromDate: '2024-12-01',
    toDate: '2024-12-01',
    reason: 'Personal work',
    currentStage: 1,
    status: 'rejected',
    createdAt: '2024-11-28',
    approvals: [
      { id: 'a5', leaveId: '3', approverId: '2', approverName: 'Dr. Sarah Advisor', stageNumber: 1, decision: 'rejected', comment: 'Reason not sufficient. Please provide more details.', decidedAt: '2024-11-28' }
    ]
  },
];

export function LeaveProvider({ children }: { children: ReactNode }) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);

  const addLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'approvals' | 'currentStage' | 'status'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      currentStage: 1,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      approvals: [],
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
  };

  const approveLeave = (leaveId: string, approverId: string, approverName: string, stage: ApprovalStage, comment?: string) => {
    setLeaveRequests(prev => prev.map(leave => {
      if (leave.id !== leaveId) return leave;

      const newApproval: LeaveApproval = {
        id: Date.now().toString(),
        leaveId,
        approverId,
        approverName,
        stageNumber: stage,
        decision: 'approved',
        comment,
        decidedAt: new Date().toISOString().split('T')[0],
      };

      const nextStage = stage < 3 ? (stage + 1) as ApprovalStage : 3;
      const newStatus = stage === 3 ? 'approved' : 'pending';

      return {
        ...leave,
        currentStage: nextStage,
        status: newStatus,
        approvals: [...leave.approvals, newApproval],
      };
    }));
  };

  const rejectLeave = (leaveId: string, approverId: string, approverName: string, stage: ApprovalStage, comment: string) => {
    setLeaveRequests(prev => prev.map(leave => {
      if (leave.id !== leaveId) return leave;

      const newApproval: LeaveApproval = {
        id: Date.now().toString(),
        leaveId,
        approverId,
        approverName,
        stageNumber: stage,
        decision: 'rejected',
        comment,
        decidedAt: new Date().toISOString().split('T')[0],
      };

      return {
        ...leave,
        status: 'rejected',
        approvals: [...leave.approvals, newApproval],
      };
    }));
  };

  const getLeavesByStudent = (studentId: string) => {
    return leaveRequests.filter(leave => leave.studentId === studentId);
  };

  const getPendingApprovals = (stage: ApprovalStage) => {
    return leaveRequests.filter(
      leave => leave.status === 'pending' && leave.currentStage === stage
    );
  };

  return (
    <LeaveContext.Provider value={{ 
      leaveRequests, 
      addLeaveRequest, 
      approveLeave, 
      rejectLeave, 
      getLeavesByStudent, 
      getPendingApprovals 
    }}>
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
}
