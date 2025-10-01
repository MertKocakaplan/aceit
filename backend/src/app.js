const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { apiLimiter } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting (tüm API'ye uygula)
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'AceIt API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require('./routes/auth.routes');
const subjectRoutes = require('./routes/subject.routes');
const studySessionRoutes = require('./routes/studySession.routes');
const statsRoutes = require('./routes/stats.routes');

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler (route bulunamazsa)
app.use(notFound);

// Error handler (en sonda olmalı)
app.use(errorHandler);

module.exports = app;