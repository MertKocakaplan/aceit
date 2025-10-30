const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { apiLimiter } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const pomodoroRoutes = require('./routes/pomodoro.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Cache kontrolü - development için
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting
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
const examYearRoutes = require('./routes/examYear.routes');
const topicQuestionCountRoutes = require('./routes/topicQuestionCount.routes');
const userRoutes = require('./routes/user.routes');
const adminStatsRoutes = require('./routes/adminStats.routes');
const spacedRepetitionRoutes = require('./routes/spacedRepetition.routes');
const studyPlanAnalysisRoutes = require('./routes/studyPlanAnalysis.routes');

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin/exam-years', examYearRoutes);
app.use('/api/admin/topic-question-counts', topicQuestionCountRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/spaced-repetition', spacedRepetitionRoutes);
app.use('/api/study-plan', studyPlanAnalysisRoutes);


// 404 handler (route bulunamazsa)
app.use(notFound);

// Error handler (en sonda olmalı)
app.use(errorHandler);

module.exports = app;