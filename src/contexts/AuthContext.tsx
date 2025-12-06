import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/leave';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: User[] = [
  { id: '1', name: 'John Student', email: 'student@college.edu', role: 'student', department: 'Computer Science', studentId: 'CS2024001' },
  { id: '2', name: 'Dr. Sarah Advisor', email: 'advisor@college.edu', role: 'advisor', department: 'Computer Science' },
  { id: '3', name: 'Dr. Michael HOD', email: 'hod@college.edu', role: 'hod', department: 'Computer Science' },
  { id: '4', name: 'Prof. Elizabeth Principal', email: 'principal@college.edu', role: 'principal' },
  { id: '5', name: 'Admin User', email: 'admin@college.edu', role: 'admin' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
