import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROLE_LABELS, UserRole } from '@/types/leave';
import { 
  Search, 
  Plus, 
  User, 
  Mail, 
  Building,
  Edit,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const DEPARTMENTS = [
  'Bsc Computer Science',
  'Bsc Information Technology',
  'Bsc ISM',
  'Bachelor of Computer Application',
];

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'admin': return 'default';
    case 'principal': return 'success';
    case 'hod': return 'warning';
    case 'advisor': return 'pending';
    default: return 'secondary';
  }
};

export default function ManageUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as UserRole | '',
    department: '',
    studentId: ''
  });
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // Fetch all users from backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.studentId) {
      toast({
        title: "Missing fields",
        description: "Please fill in name, email, role, and student ID.",
        variant: "destructive"
      });
      return;
    }

    if (!isEditMode && !newUser.password) {
      toast({
        title: "Missing password",
        description: "Password is required for new users.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate studentId (unless in edit mode for same user)
    const duplicateStudentId = users.find(u => 
      u.studentId?.toLowerCase() === newUser.studentId.toLowerCase() && 
      u.id !== editingUserId
    );
    if (duplicateStudentId) {
      toast({
        title: "Duplicate Student ID",
        description: `Student ID "${newUser.studentId}" is already assigned to ${duplicateStudentId.name}`,
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate email
    const duplicateEmail = users.find(u => 
      u.email.toLowerCase() === newUser.email.toLowerCase() && 
      u.id !== editingUserId
    );
    if (duplicateEmail) {
      toast({
        title: "Duplicate Email",
        description: `Email "${newUser.email}" is already in use`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/create-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          department: newUser.department || null,
          studentId: newUser.studentId || null,
        }),
      });

      if (response.ok) {
        const createdUser = await response.json();
        console.log('Created user response:', createdUser);
        
        if (isEditMode && editingUserId) {
          // Update user in list
          setUsers(users.map(u => u.id === editingUserId ? createdUser : u));
          toast({
            title: "User updated",
            description: `${newUser.name} has been updated successfully.`
          });
        } else {
          // Add new user to list and refetch to ensure sync with backend
          const updatedUsers = [...users, createdUser];
          setUsers(updatedUsers);
          console.log('Users state after adding:', updatedUsers);
          
          // Refetch users from backend after a brief delay to ensure database write completes
          setTimeout(() => {
            fetchUsers();
          }, 1000);
          
          toast({
            title: "User added",
            description: `${newUser.name} has been added successfully.`
          });
        }

        setNewUser({ name: '', email: '', password: '', role: '', department: '', studentId: '' });
        setIsDialogOpen(false);
        setIsEditMode(false);
        setEditingUserId(null);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add user",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive"
      });
      console.error('Add user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      studentId: user.studentId || ''
    });
    setEditingUserId(user.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setNewUser({ name: '', email: '', password: '', role: '', department: '', studentId: '' });
    setIsEditMode(false);
    setEditingUserId(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setNewUser({ name: '', email: '', password: '', role: '', department: '', studentId: '' });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete user",
          variant: "destructive"
        });
        return;
      }

      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: "User deleted",
        description: "User has been removed."
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">You don't have permission to manage users. Only administrators can access this page.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Manage Users</h1>
          <p className="text-muted-foreground mt-1">Add, edit, and manage system users</p>
        </div>
        <Button variant="hero" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display">All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.department ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        {user.department}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update user information.' : 'Create a new user account in the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="advisor">Class Advisor</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department (Optional)</Label>
              <RadioGroup 
                value={newUser.department} 
                onValueChange={(value) => setNewUser({ ...newUser, department: value })}
              >
                <div className="space-y-2">
                  {DEPARTMENTS.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <RadioGroupItem value={dept} id={dept} />
                      <Label htmlFor={dept} className="font-normal cursor-pointer">
                        {dept}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID (Optional)</Label>
              <Input
                id="studentId"
                placeholder="Enter student ID"
                value={newUser.studentId}
                onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
