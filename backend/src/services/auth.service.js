const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * Yeni kullanıcı oluştur
 */
const createUser = async (userData) => {
  try {
    // Email veya username zaten var mı kontrol et
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new Error('Bu email adresi zaten kullanılıyor');
      }
      if (existingUser.username === userData.username) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor');
      }
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Kullanıcı ve UserPreference'ı birlikte oluştur
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        fullName: userData.fullName,
        examType: userData.examType,
        targetScore: userData.targetScore || null,
        targetDate: userData.targetDate || null,
        preferences: {
          create: {
            theme: 'SYSTEM',
            notifications: true,
            soundEnabled: true,
            pomodoroWork: 25,
            pomodoroBreak: 5,
            pomodoroLongBreak: 15,
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        examType: true,
        role: true,
        targetScore: true,
        targetDate: true,
        createdAt: true,
      },
    });

    logger.info(`Yeni kullanıcı oluşturuldu: ${user.email}`);
    return user;
  } catch (error) {
    logger.error(`createUser error: ${error.message}`);
    throw error;
  }
};

/**
 * Kullanıcı girişi (login)
 */
const loginUser = async (identifier, password) => {
  try {
    // Email veya username ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      throw new Error('Email/Kullanıcı adı veya şifre hatalı');
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email/Kullanıcı adı veya şifre hatalı');
    }

    // Son giriş zamanını güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Token'ları oluştur
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role, // Role ekle
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    // Şifreyi response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`Kullanıcı giriş yaptı: ${user.email}`);

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error(`loginUser error: ${error.message}`);
    throw error;
  }
};

/**
 * Kullanıcıyı ID ile bul (Normal kullanıcı için)
 */
const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        examType: true,
        role: true,
        targetScore: true,
        targetDate: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return user;
  } catch (error) {
    logger.error(`getUserById error: ${error.message}`);
    throw error;
  }
};

// ==================== ADMIN FONKSİYONLARI ====================

/**
 * Admin: Tüm kullanıcıları getir
 */
const getAllUsers = async (filters = {}) => {
  try {
    const { role, examType, search, page = 1, limit = 50 } = filters;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (examType) {
      where.examType = examType;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          examType: true,
          role: true,
          targetScore: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              studySessions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: skip,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    logger.error(`getAllUsers error: ${error.message}`);
    throw error;
  }
};

/**
 * Admin: Kullanıcı detayı (Detaylı)
 */
const getUserByIdAdmin = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        examType: true,
        role: true,
        targetScore: true,
        targetDate: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
        _count: {
          select: {
            studySessions: true,
            studyPlans: true,
            achievements: true,
            pomodoroSessions: true,
            aiQuestions: true,
            examAttempts: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    return user;
  } catch (error) {
    logger.error(`getUserByIdAdmin error: ${error.message}`);
    throw error;
  }
};

/**
 * Admin: Kullanıcı rolü güncelle
 */
const updateUserRole = async (userId, role) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
      },
    });

    logger.info(`Kullanıcı rolü güncellendi: ${user.email} -> ${role}`);
    return user;
  } catch (error) {
    logger.error(`updateUserRole error: ${error.message}`);
    throw error;
  }
};

/**
 * Admin: Kullanıcı sil
 */
const deleteUser = async (userId) => {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(`Kullanıcı silindi: ${userId}`);
    return { message: 'Kullanıcı başarıyla silindi' };
  } catch (error) {
    logger.error(`deleteUser error: ${error.message}`);
    throw error;
  }
};

/**
 * Admin: İstatistikler
 */
const getAdminStats = async () => {
  try {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      adminCount,
      todayUsers,
      totalSessions,
      activeUsers,
      aiStats,
      todayAiStats,
      last30DaysAiStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.studySession.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Son 7 gün
          },
        },
      }),
      // Toplam AI kullanımı
      prisma.aIQuestionLog.aggregate({
        _count: true,
        _sum: {
          tokensUsed: true,
        },
        _avg: {
          tokensUsed: true,
          responseTime: true,
        },
      }),
      // Bugünkü AI kullanımı
      prisma.aIQuestionLog.aggregate({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
        _count: true,
        _sum: {
          tokensUsed: true,
        },
      }),
      // Son 30 günlük AI kullanımı
      prisma.aIQuestionLog.aggregate({
        where: {
          createdAt: {
            gte: last30Days,
          },
        },
        _count: true,
        _sum: {
          tokensUsed: true,
        },
      }),
    ]);

    // Sınav türüne göre dağılım
    const examTypeDistribution = await prisma.user.groupBy({
      by: ['examType'],
      _count: true,
    });

    // Günlük token kullanımı trend (son 30 gün)
    const dailyTokenUsage = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*)::int as questions,
        COALESCE(SUM("tokensUsed"), 0)::int as tokens
      FROM "AIQuestionLog"
      WHERE "createdAt" >= ${last30Days}
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 30
    `;

    return {
      totalUsers,
      adminCount,
      todayUsers,
      totalSessions,
      activeUsers,
      examTypeDistribution,
      aiUsage: {
        totalQuestions: aiStats._count || 0,
        totalTokens: aiStats._sum.tokensUsed || 0,
        avgTokensPerQuestion: aiStats._avg.tokensUsed ? Math.round(aiStats._avg.tokensUsed) : 0,
        avgResponseTime: aiStats._avg.responseTime ? Math.round(aiStats._avg.responseTime) : 0,
        todayQuestions: todayAiStats._count || 0,
        todayTokens: todayAiStats._sum.tokensUsed || 0,
        last30DaysQuestions: last30DaysAiStats._count || 0,
        last30DaysTokens: last30DaysAiStats._sum.tokensUsed || 0,
        dailyUsage: dailyTokenUsage,
      },
    };
  } catch (error) {
    logger.error(`getAdminStats error: ${error.message}`);
    throw error;
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  const { fullName, email, examType, currentPassword, newPassword } = updateData;

  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('Kullanıcı bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  // If changing password, verify current password
  if (newPassword) {
    if (!currentPassword) {
      const error = new Error('Mevcut şifre gereklidir');
      error.statusCode = 400;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      const error = new Error('Mevcut şifre yanlış');
      error.statusCode = 401;
      throw error;
    }
  }

  // Prepare update data
  const dataToUpdate = {};
  if (fullName) dataToUpdate.fullName = fullName;
  if (email && email !== user.email) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      const error = new Error('Bu email zaten kullanılıyor');
      error.statusCode = 409;
      throw error;
    }
    dataToUpdate.email = email;
  }
  if (examType) dataToUpdate.examType = examType;
  if (newPassword) {
    dataToUpdate.password = await bcrypt.hash(newPassword, 10);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      examType: true,
      role: true,
      targetScore: true,
      targetDate: true,
      createdAt: true,
      lastLoginAt: true,
    }
  });

  logger.info(`Kullanıcı profili güncellendi: ${updatedUser.email}`);
  return updatedUser;
};

module.exports = {
  createUser,
  loginUser,
  getUserById,
  updateUserProfile,
  // Admin fonksiyonları
  getAllUsers,
  getUserByIdAdmin,
  updateUserRole,
  deleteUser,
  getAdminStats,
};