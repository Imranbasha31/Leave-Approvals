import { useAuth } from '@/contexts/AuthContext';
import { useLeave } from '@/contexts/LeaveContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeaveRequestCard } from '@/components/LeaveRequestCard';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ApprovalStage } from '@/types/leave';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { leaveRequests, getLeavesByStudent, pendingApprovals, fetchPendingApprovals } = useLeave();

  const getStageForRole = (): ApprovalStage => {
    switch (user?.role) {
      case 'advisor': return 1;
      case 'hod': return 2;
      case 'principal': return 3;
      default: return 1;
    }
  };

  useEffect(() => {
    if (user?.role !== 'student') {
      const stage = getStageForRole();
      fetchPendingApprovals(stage);
    }
  }, [user?.role, fetchPendingApprovals]);

  // Re-fetch approvals when component mounts (e.g., navigating back from Approvals page)
  useEffect(() => {
    if (user?.role !== 'student') {
      const stage = getStageForRole();
      fetchPendingApprovals(stage);
    }
  }, []);

  // Student stats
  const studentLeaves = leaveRequests;  // API already filters by student ID
  const pendingCount = studentLeaves.filter(l => l.status === 'pending').length;
  const approvedCount = studentLeaves.filter(l => l.status === 'approved').length;
  const rejectedCount = studentLeaves.filter(l => l.status === 'rejected').length;

  // Approver stats
  const approvalsCount = pendingApprovals.length;

  // Admin stats
  const totalRequests = leaveRequests.length;
  const totalPending = leaveRequests.filter(l => l.status === 'pending').length;
  const totalApproved = leaveRequests.filter(l => l.status === 'approved').length;

  // Helper function to get display name with qualification
  const getDisplayNameWithQualification = (fullName?: string) => {
    if (!fullName) return 'User';
    // Keep the full name as is (with title/qualification)
    return fullName.trim();
  };

  const renderStudentDashboard = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Welcome back, {getDisplayNameWithQualification(user?.name)}!</h1>
          <p className="text-muted-foreground mt-1">Track and manage your leave requests</p>
        </div>
        <Button asChild variant="hero">
          <Link to="/dashboard/apply">
            <Plus className="h-4 w-4" />
            Apply for Leave
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold">Recent Requests</h2>
          <Button variant="ghost" asChild>
            <Link to="/dashboard/my-requests">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          {studentLeaves.slice(0, 3).map((request) => (
            <LeaveRequestCard key={request.id} request={request} />
          ))}
          {studentLeaves.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No leave requests yet</p>
                <Button asChild variant="subtle" className="mt-4">
                  <Link to="/dashboard/apply">Apply for your first leave</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );

  const renderApproverDashboard = () => (
    <>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Welcome, {getDisplayNameWithQualification(user?.name)}!</h1>
        <p className="text-muted-foreground mt-1">Review and approve leave requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{approvalsCount}</p>
                <p className="text-sm opacity-90">Pending Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalApproved}</p>
                <p className="text-sm text-muted-foreground">Total Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold">Pending Approvals</h2>
          {approvalsCount > 0 && (
            <Button variant="ghost" asChild>
              <Link to="/dashboard/approvals">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {pendingApprovals.slice(0, 3).map((request) => (
            <LeaveRequestCard key={request.id} request={request} showTimeline />
          ))}
          {approvalsCount === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">All caught up! No pending approvals.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage users and monitor leave requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRequests}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalApproved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leaveRequests.filter(l => l.status === 'rejected').length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold">Recent Requests</h2>
          <Button variant="ghost" asChild>
            <Link to="/dashboard/all-requests">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          {leaveRequests.slice(0, 3).map((request) => (
            <LeaveRequestCard key={request.id} request={request} />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout>
      {user?.role === 'student' && renderStudentDashboard()}
      {(user?.role === 'advisor' || user?.role === 'hod' || user?.role === 'principal') && renderApproverDashboard()}
      {user?.role === 'admin' && renderAdminDashboard()}
    </DashboardLayout>
  );
}
