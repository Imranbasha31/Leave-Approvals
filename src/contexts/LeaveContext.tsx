import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { LeaveRequest, LeaveApproval, ApprovalStage } from '@/types/leave';
import { useAuth } from './AuthContext';

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  pendingApprovals: LeaveRequest[];
  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'approvals' | 'currentStage' | 'status'>) => Promise<string>;
  approveLeave: (leaveId: string, comment?: string) => Promise<void>;
  rejectLeave: (leaveId: string, comment: string) => Promise<void>;
  getLeavesByStudent: (studentId: string) => LeaveRequest[];
  fetchPendingApprovals: (stage: ApprovalStage) => Promise<void>;
  fetchAllLeaveRequests: () => Promise<void>;
  loading: boolean;
  error: string | null;
  fetchLeaveRequests: () => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function LeaveProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const fetchLeaveRequests = useCallback(async () => {
    if (!user) return;
    
    console.log(`[fetchLeaveRequests] Fetching requests for student: ${user.email}`);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/leave/requests/my`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch leave requests');

      const data = await response.json();
      console.log(`[fetchLeaveRequests] Received ${data.length} leave requests`);
      setLeaveRequests(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Fetch leave requests error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAllLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/leave/requests/all`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch all leave requests');

      const data = await response.json();
      setLeaveRequests(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Fetch all leave requests error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      console.log(`User loaded: ${user.name}, Role: ${user.role}`);
      // Fetch all requests for admin/approver roles, otherwise fetch user's own requests
      if (user.role === 'admin' || user.role === 'advisor' || user.role === 'hod' || user.role === 'principal') {
        console.log(`Fetching all requests for ${user.role}`);
        fetchAllLeaveRequests();
      } else if (user.role === 'student') {
        console.log(`Fetching student's own requests for ${user.email}`);
        fetchLeaveRequests();
      }
    }
  }, [user, fetchLeaveRequests, fetchAllLeaveRequests]);

  const fetchPendingApprovals = useCallback(async (stage: ApprovalStage) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/leave/approvals/stage/${stage}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch pending approvals');

      const data = await response.json();
      setPendingApprovals(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Fetch pending approvals error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLeaveRequest = useCallback(async (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'approvals' | 'currentStage' | 'status'>) => {
    try {
      const response = await fetch(`${API_URL}/leave/requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error('Failed to create leave request');

      const newRequest = await response.json();
      setLeaveRequests(prev => [newRequest, ...prev]);
      setError(null);
      return newRequest.id;
    } catch (err) {
      setError((err as Error).message);
      console.error('Add leave request error:', err);
      throw err;
    }
  }, []);

  const approveLeave = useCallback(async (leaveId: string, comment?: string) => {
    try {
      const response = await fetch(`${API_URL}/leave/requests/${leaveId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) throw new Error('Failed to approve leave request');

      const updatedRequest = await response.json();
      setLeaveRequests(prev => prev.map(lr => (lr.id === leaveId ? updatedRequest : lr)));
      setPendingApprovals(prev => prev.filter(pa => pa.id !== leaveId));
      setError(null);
      
      // Refetch all requests to ensure counts are updated
      setTimeout(() => fetchAllLeaveRequests(), 500);
    } catch (err) {
      setError((err as Error).message);
      console.error('Approve leave error:', err);
      throw err;
    }
  }, [fetchAllLeaveRequests]);

  const rejectLeave = useCallback(async (leaveId: string, comment: string) => {
    try {
      const response = await fetch(`${API_URL}/leave/requests/${leaveId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) throw new Error('Failed to reject leave request');

      const updatedRequest = await response.json();
      setLeaveRequests(prev => prev.map(lr => (lr.id === leaveId ? updatedRequest : lr)));
      setPendingApprovals(prev => prev.filter(pa => pa.id !== leaveId));
      setError(null);
      
      // Refetch all requests to ensure counts are updated
      setTimeout(() => fetchAllLeaveRequests(), 500);
    } catch (err) {
      setError((err as Error).message);
      console.error('Reject leave error:', err);
      throw err;
    }
  }, [fetchAllLeaveRequests]);

  const getLeavesByStudent = (studentId: string) => {
    return leaveRequests.filter(leave => leave.studentId === studentId);
  };

  return (
    <LeaveContext.Provider value={{ 
      leaveRequests, 
      pendingApprovals,
      addLeaveRequest, 
      approveLeave, 
      rejectLeave, 
      getLeavesByStudent, 
      fetchPendingApprovals,
      fetchAllLeaveRequests,
      loading,
      error,
      fetchLeaveRequests,
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
