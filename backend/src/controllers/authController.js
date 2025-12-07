import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, studentId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role required' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const existingStudentId = studentId ? await User.findOne({ studentId: studentId.trim() }) : null;
    if (existingStudentId) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department: department || null,
      studentId: studentId ? studentId.trim() : null,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'studentId') {
        return res.status(400).json({ error: 'Student ID must be unique' });
      }
      return res.status(400).json({ error: `${field} must be unique` });
    }
    
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, studentId } = req.body;

    console.log('[createUser] Request received:', { name, email, role, department, studentId, userId: req.userId });

    if (!name || !email || !password || !role || !studentId) {
      console.log('[createUser] Missing required fields');
      return res.status(400).json({ error: 'Name, email, password, role, and student ID are required' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      console.log('[createUser] Email already exists:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const existingStudentId = await User.findOne({ studentId: studentId.trim() });
    if (existingStudentId) {
      console.log('[createUser] Student ID already exists:', studentId);
      return res.status(400).json({ error: 'User with this student ID already exists' });
    }

    console.log('[createUser] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[createUser] Creating new user in database...');
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      department: department || null,
      studentId: studentId.trim(),
    });

    await user.save();
    console.log('[createUser] User saved successfully:', user._id);

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
    });
  } catch (error) {
    console.error('[createUser] Error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'studentId') {
        return res.status(400).json({ error: 'Student ID must be unique' });
      }
      return res.status(400).json({ error: `${field} must be unique` });
    }
    
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json(
      users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
      }))
    );
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('[deleteUser] Delete request for userId:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      console.log('[deleteUser] User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('[deleteUser] User deleted successfully:', user.email);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[deleteUser] Error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
