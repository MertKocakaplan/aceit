const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Tüm sınav yıllarını getir
 */
const getAllExamYears = async () => {
  try {
    const examYears = await prisma.examYear.findMany({
      include: {
        _count: {
          select: {
            topicStats: true,
          },
        },
      },
      orderBy: { year: 'desc' },
    });

    return examYears;
  } catch (error) {
    logger.error(`getAllExamYears error: ${error.message}`);
    throw error;
  }
};

/**
 * Yıl detayı getir
 */
const getExamYearById = async (id) => {
  try {
    const examYear = await prisma.examYear.findUnique({
      where: { id },
      include: {
        topicStats: {
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!examYear) {
      throw new Error('Sınav yılı bulunamadı');
    }

    return examYear;
  } catch (error) {
    logger.error(`getExamYearById error: ${error.message}`);
    throw error;
  }
};

/**
 * Yeni sınav yılı oluştur
 */
const createExamYear = async (data) => {
  try {
    // Aynı yıl var mı kontrol et
    const existing = await prisma.examYear.findUnique({
      where: { year: data.year },
    });

    if (existing) {
      throw new Error('Bu yıl zaten kayıtlı');
    }

    const examYear = await prisma.examYear.create({
      data: {
        year: data.year,
        examDate: data.examDate ? new Date(data.examDate) : null,
        isActive: data.isActive || false,
      },
    });

    logger.info(`Yeni sınav yılı oluşturuldu: ${examYear.year}`);
    return examYear;
  } catch (error) {
    logger.error(`createExamYear error: ${error.message}`);
    throw error;
  }
};

/**
 * Sınav yılını güncelle
 */
const updateExamYear = async (id, data) => {
  try {
    const examYear = await prisma.examYear.update({
      where: { id },
      data: {
        examDate: data.examDate ? new Date(data.examDate) : undefined,
        isActive: data.isActive,
      },
    });

    logger.info(`Sınav yılı güncellendi: ${examYear.year}`);
    return examYear;
  } catch (error) {
    logger.error(`updateExamYear error: ${error.message}`);
    throw error;
  }
};

/**
 * Aktif yılı değiştir
 */
const setActiveYear = async (id) => {
  try {
    // Önce tüm yılları pasif yap
    await prisma.examYear.updateMany({
      data: { isActive: false },
    });

    // Seçilen yılı aktif yap
    const examYear = await prisma.examYear.update({
      where: { id },
      data: { isActive: true },
    });

    logger.info(`Aktif yıl değiştirildi: ${examYear.year}`);
    return examYear;
  } catch (error) {
    logger.error(`setActiveYear error: ${error.message}`);
    throw error;
  }
};

/**
 * Sınav yılını sil
 */
const deleteExamYear = async (id) => {
  try {
    await prisma.examYear.delete({
      where: { id },
    });

    logger.info(`Sınav yılı silindi: ${id}`);
    return { message: 'Sınav yılı başarıyla silindi' };
  } catch (error) {
    logger.error(`deleteExamYear error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getAllExamYears,
  getExamYearById,
  createExamYear,
  updateExamYear,
  setActiveYear,
  deleteExamYear,
};