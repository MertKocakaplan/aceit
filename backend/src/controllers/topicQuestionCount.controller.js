const topicQuestionCountService = require('../services/topicQuestionCount.service');
const logger = require('../utils/logger');
const prisma = require('../config/database');

/**
 * Yıla göre getir
 * GET /api/admin/topic-question-counts?examYearId=xxx
 */
exports.getByExamYear = async (req, res, next) => {
  try {
    const { examYearId } = req.query;

    if (!examYearId) {
      return res.status(400).json({
        success: false,
        message: 'examYearId gerekli',
      });
    }

    const counts = await topicQuestionCountService.getByExamYear(examYearId);

    res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    logger.error(`getByExamYear controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Konuya göre getir
 * GET /api/admin/topic-question-counts/by-topic/:topicId
 */
exports.getByTopic = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const counts = await topicQuestionCountService.getByTopic(topicId);

    res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    logger.error(`getByTopic controller error: ${error.message}`);
    next(error);
  }
};

/**
 * Toplu güncelleme
 * POST /api/admin/topic-question-counts/bulk
 * Body: { examYearId, data: [{ topicId, questionCount }] }
 */
exports.upsertBulk = async (req, res, next) => {
  try {
    const { examYearId, data } = req.body;

    if (!examYearId || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'examYearId ve data array gerekli',
      });
    }

    const result = await topicQuestionCountService.upsertBulk(examYearId, data);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    logger.error(`upsertBulk controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Tek kayıt güncelle/oluştur
 * PUT /api/admin/topic-question-counts
 * Body: { topicId, examYearId, questionCount }
 */
exports.upsert = async (req, res, next) => {
  try {
    const { topicId, examYearId, questionCount } = req.body;

    if (!topicId || !examYearId || questionCount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'topicId, examYearId ve questionCount gerekli',
      });
    }

    const count = await topicQuestionCountService.upsert(
      topicId,
      examYearId,
      questionCount
    );

    res.status(200).json({
      success: true,
      message: 'Soru sayısı güncellendi',
      data: count,
    });
  } catch (error) {
    logger.error(`upsert controller error: ${error.message}`);
    error.statusCode = 400;
    next(error);
  }
};

/**
 * Sil
 * DELETE /api/admin/topic-question-counts/:id
 */
exports.deleteCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    await topicQuestionCountService.deleteCount(id);

    res.status(200).json({
      success: true,
      message: 'Soru sayısı silindi',
    });
  } catch (error) {
    logger.error(`deleteCount controller error: ${error.message}`);
    next(error);
  }
};

/**
 * CSV ile toplu yükleme
 * POST /api/admin/topic-question-counts/upload-csv
 * Body: { csvData: "string" }
 */
exports.uploadCSV = async (req, res, next) => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({
        success: false,
        message: 'CSV verisi gerekli',
      });
    }

    const lines = csvData.trim().split('\n');

    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz CSV formatı',
      });
    }

    const dataLines = lines.slice(1);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const line of dataLines) {
      try {
        const parts = line.split(',').map(p => p.trim());

        if (parts.length < 9) {
          continue;
        }

        const [dersAdi, konuAdi, ...yillar] = parts;

        if (konuAdi === 'Toplam Soru') {
          continue;
        }

        const subjectCode = getSubjectCode(dersAdi);
        if (!subjectCode) {
          errors.push(`Ders bulunamadı: ${dersAdi}`);
          errorCount++;
          continue;
        }

        const subject = await prisma.subject.findUnique({
          where: { code: subjectCode },
        });

        if (!subject) {
          errors.push(`Ders bulunamadı: ${subjectCode}`);
          errorCount++;
          continue;
        }

        const topicCode = konuAdi.toUpperCase().replace(/\s+/g, '_');
        let topic = await prisma.topic.findFirst({
          where: {
            subjectId: subject.id,
            name: konuAdi,
          },
        });

        if (!topic) {
          topic = await prisma.topic.create({
            data: {
              subjectId: subject.id,
              name: konuAdi,
              code: topicCode,
              order: 0,
            },
          });
        }

        const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
        
        for (let i = 0; i < years.length && i < yillar.length; i++) {
          const year = years[i];
          const questionCount = parseInt(yillar[i]) || 0;

          let examYear = await prisma.examYear.findUnique({
            where: { year },
          });

          if (!examYear) {
            examYear = await prisma.examYear.create({
              data: {
                year,
                isActive: year === 2024,
              },
            });
          }

          await prisma.topicQuestionCount.upsert({
            where: {
              topicId_examYearId: {
                topicId: topic.id,
                examYearId: examYear.id,
              },
            },
            update: {
              questionCount,
            },
            create: {
              topicId: topic.id,
              examYearId: examYear.id,
              questionCount,
            },
          });
        }

        successCount++;
      } catch (error) {
        logger.error(`CSV line error: ${error.message}`);
        errorCount++;
        errors.push(`Satır hatası: ${line.substring(0, 50)}...`);
      }
    }

    // Ortalama güncelle
    const allTopics = await prisma.topic.findMany({ select: { id: true } });
    await topicQuestionCountService.updateTopicAverages(allTopics.map(t => t.id));

    // ← RESPONSE BURASI (try bloğunun içinde)
    res.status(200).json({
      success: true,
      message: `CSV yüklendi: ${successCount} başarılı, ${errorCount} hata`,
      data: {
        successCount,
        errorCount,
        errors: errors.slice(0, 10),
      },
    });
  } catch (error) {
    logger.error(`uploadCSV controller error: ${error.message}`);
    next(error);
  }
};

// Helper: Ders adından kod üret
function getSubjectCode(dersAdi) {
  const mapping = {
    'TÜRKÇE': 'TYT_TURKCE',
    'MATEMATİK': 'TYT_MATEMATIK',
    'GEOMETRİ': 'TYT_GEOMETRI',
    'FİZİK': 'TYT_FIZIK',
    'KİMYA': 'TYT_KIMYA',
    'BİYOLOJİ': 'TYT_BIYOLOJI',
    'TARİH': 'TYT_TARIH',
    'COĞRAFYA': 'TYT_COGRAFYA',
    'FELSEFE': 'TYT_FELSEFE',
    'DİN KÜLTÜRÜ VE AHLAK BİLGİSİ': 'TYT_DIN',
    // AYT için ekle
    'AYT MATEMATİK': 'AYT_MATEMATIK',
    'AYT GEOMETRİ': 'AYT_GEOMETRI',
    'AYT FİZİK': 'AYT_FIZIK',
    'AYT KİMYA': 'AYT_KIMYA',
    'AYT BİYOLOJİ': 'AYT_BIYOLOJI',
    'AYT EDEBİYAT': 'AYT_EDEBIYAT',
    'AYT TARİH': 'AYT_TARIH',
    'AYT COĞRAFYA': 'AYT_COGRAFYA',
    'AYT FELSEFE': 'AYT_FELSEFE',
    'AYT DİN KÜLTÜRÜ VE AHLAK BİLGİSİ': 'AYT_DIN',
  };

  return mapping[dersAdi.toUpperCase()] || null;
}