const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const initDatabase = require('./config/init');

// Load environment variables
dotenv.config();

// Initialize database
initDatabase();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const materialRoutes = require('./routes/materialRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/materials', materialRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to LMS API' });
});

// Lightweight health endpoint (no DB touch)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Extra lightweight ping (separate from /api/health)
app.get('/api/ping', (req, res) => res.type('text').send('pong'));

// Enhanced full health (includes DB best-effort)
app.get('/api/health/full', async (req, res) => {
  const start = Date.now();
  let dbOk = true;
  try {
    const { sequelize } = require('./models');
    await sequelize.query('SELECT 1');
  } catch (e) {
    dbOk = false;
  }
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'reachable' : 'error',
    uptimeSec: Math.floor(process.uptime()),
    memoryRssMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
    pid: process.pid,
    responseTimeMs: Date.now() - start,
    timestamp: new Date().toISOString()
  });
});

const requestedPort = parseInt(process.env.PORT, 10) || 5000;
const candidatePorts = [requestedPort, 5001, 5002];
let listenAttempt = 0;

const startServer = (port) => {
  server.listen(port, '127.0.0.1', () => {
    const addr = server.address();
    console.log(`Server is running on http://${addr.address}:${addr.port}`);
  });
};

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && listenAttempt < candidatePorts.length - 1) {
    console.warn(`[startup] Port ${candidatePorts[listenAttempt]} in use. Retrying on ${candidatePorts[listenAttempt + 1]}...`);
    listenAttempt += 1;
    setTimeout(() => startServer(candidatePorts[listenAttempt]), 300);
  } else {
    console.error('[startup] Failed to bind server:', err);
    process.exit(1);
  }
});

startServer(candidatePorts[listenAttempt]);

// Heartbeat to confirm process is alive (every 30s)
setInterval(() => {
  process.stdout.write('[heartbeat] ' + new Date().toISOString() + '\n');
}, 30000);

// Diagnostics for unexpected exits
process.on('exit', (code) => {
  console.log('[process exit] code=', code);
});
process.on('SIGTERM', () => {
  console.log('[signal] SIGTERM received');
});
process.on('SIGINT', () => {
  console.log('[signal] SIGINT received');
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});