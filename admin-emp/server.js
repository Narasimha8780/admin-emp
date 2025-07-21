const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'tl', 'employee'], required: true },
  tlId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For employees
  createdAt: { type: Date, default: Date.now }
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  screenTime: { type: Number, default: 0 }, // in minutes
  idleTime: { type: Number, default: 0 }, // in minutes
  activeTime: { type: Number, default: 0 }, // in minutes
  date: { type: Date, default: Date.now },
  applications: [{
    name: String,
    timeSpent: Number, // in minutes
    installTime: Date
  }]
});

// App Installation Schema
const appInstallSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appName: String,
  installTime: { type: Date, default: Date.now },
  systemInfo: {
    os: String,
    version: String,
    hostname: String
  },
  notified: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
const Activity = mongoose.model('Activity', activitySchema);
const AppInstall = mongoose.model('AppInstall', appInstallSchema);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (role) => {
    socket.join(role);
    console.log(`User joined ${role} room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Employee Monitoring System API' });
});

// Authentication route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ username, password, role });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      success: true, 
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        tlId: user.tlId 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Determine role based on email domain or pattern
    let role = 'employee';
    if (email.endsWith('@tlcompany.com')) {
      role = 'tl';
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      username: email,
      password,
      role,
      firstName,
      lastName
    });

    await newUser.save();

    res.json({ success: true, message: 'User registered successfully', user: { id: newUser._id, username: newUser.username, role: newUser.role } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get users by role
app.get('/api/users/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get employees under a TL
app.get('/api/tl/:tlId/employees', async (req, res) => {
  try {
    const { tlId } = req.params;
    const employees = await User.find({ tlId, role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit activity data
app.post('/api/activity', async (req, res) => {
  try {
    const { employeeId, screenTime, idleTime, activeTime, applications } = req.body;
    
    const activity = new Activity({
      employeeId,
      screenTime,
      idleTime,
      activeTime,
      applications
    });
    
    await activity.save();
    
    // Notify TL and Admin via socket
    io.to('admin').emit('activity-update', { employeeId, activity });
    io.to('tl').emit('activity-update', { employeeId, activity });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activity data
app.get('/api/activity/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const activities = await Activity.find({ employeeId }).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// App installation notification
app.post('/api/app-install', async (req, res) => {
  try {
    const { employeeId, appName, systemInfo } = req.body;
    
    const appInstall = new AppInstall({
      employeeId,
      appName,
      systemInfo
    });
    
    await appInstall.save();
    
    // Get employee details
    const employee = await User.findById(employeeId);
    
    // Notify TL and Admin
    const notification = {
      employeeId,
      employeeName: employee.username,
      appName,
      installTime: new Date(),
      systemInfo
    };
    
    io.to('admin').emit('app-installed', notification);
    io.to('tl').emit('app-installed', notification);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get app installations
app.get('/api/app-installs', async (req, res) => {
  try {
    const installs = await AppInstall.find()
      .populate('employeeId', 'username')
      .sort({ installTime: -1 });
    res.json(installs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create default users
async function createDefaultUsers() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Default admin created');
    }

    const tlExists = await User.findOne({ role: 'tl' });
    if (!tlExists) {
      const tl = new User({
        username: 'tl1',
        password: 'tl123',
        role: 'tl'
      });
      await tl.save();
      console.log('Default TL created');
    }

    const empExists = await User.findOne({ role: 'employee' });
    if (!empExists) {
      const tl = await User.findOne({ role: 'tl' });
      const employee = new User({
        username: 'employee1',
        password: 'emp123',
        role: 'employee',
        tlId: tl._id
      });
      await employee.save();
      console.log('Default employee created');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultUsers();
});
