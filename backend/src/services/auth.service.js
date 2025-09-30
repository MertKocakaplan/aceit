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
            theme: 'light',
            notifications: true,
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
 * Kullanıcıyı ID ile bul
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

module.exports = {
  createUser,
  loginUser,
  getUserById,
};