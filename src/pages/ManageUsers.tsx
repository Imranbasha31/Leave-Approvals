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
import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

// Mock users for demonstration
const INITIAL_USERS = [
  { id: '1', name: 'John Student', email: 'student@college.edu', role: 'student' as UserRole, department: 'Computer Science' },
  { id: '2', name: 'Dr. Sarah Advisor', email: 'advisor@college.edu', role: 'advisor' as UserRole, department: 'Computer Science' },
  { id: '3', name: 'Dr. Michael HOD', email: 'hod@college.edu', role: 'hod' as UserRole, department: 'Computer Science' },
  { id: '4', name: 'Prof. Elizabeth Principal', email: 'principal@college.edu', role: 'principal' as UserRole },
  { id: '5', name: 'Admin User', email: 'admin@college.edu', role: 'admin' as UserRole },
  { id: '6', name: 'Jane Doe', email: 'jane@college.edu', role: 'student' as UserRole, department: 'Electronics' },
  { id: '7', name: 'Mike Johnson', email: 'mike@college.edu', role: 'student' as UserRole, department: 'Mechanical' },
];

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
  const [users, setUsers] = useState(INITIAL_USERS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
    department: ''
  });
  const { toast } = useToast();

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        title: "Missing fields",
        description: "Please fill in name, email, and role.",
        variant: "destructive"
      });
      return;
    }

    const user = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as UserRole,
      department: newUser.department || undefined
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: '', department: '' });
    setIsDialogOpen(false);
    toast({
      title: "User added",
      description: `${user.name} has been added successfully.`
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: "User deleted",
      description: "User has been removed."
    });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Manage Users</h1>
          <p className="text-muted-foreground mt-1">Add, edit, and manage system users</p>
        </div>
        <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
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
                      <Button variant="ghost" size="icon">
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
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account in the system.
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
              <Label htmlFor="department">Department (Optional)</Label>
              <Input
                id="department"
                placeholder="Enter department"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}