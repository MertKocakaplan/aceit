const prisma = require('../../config/database');
const logger = require('../../utils/logger');
const openaiService = require('./openai.service');
const sharp = require('sharp');

/**
 * AI Question Solver Service
 * Handles text and image-based question solving with LaTeX formatting
 */

const SYSTEM_PROMPT = `Sen Türkiye'deki LGS, TYT ve AYT sınavlarına hazırlanan öğrencilere yardımcı olan uzman bir öğretmensin.

Soruları dikkatlice analiz edip adım adım çöz. Her adımı açıkla ve öğretici ol. Doğal ve akıcı bir anlatım kullan.

LaTeX FORMATLAMA KURALLARI - ÇOK ÖNEMLİ:
- Satır içi formüller için SADECE $formül$ formatını kullan
  Örnek: $x^2 + 5x + 6 = 0$
- Blok formüller için SADECE $$formül$$ formatını kullan
  Örnek: $$\\frac{a}{b} = \\frac{c}{d}$$

KRİTİK: \\[ ve \\] ASLA KULLANMA! Bunlar çalışmıyor. Sadece $ ve $$ kullan.

FORMÜL ÖRNEKLERİ:
- Köklü ifadeler: $\\sqrt{x}$ veya $\\sqrt[3]{x}$
- Kesirler: $\\frac{pay}{payda}$
- Üslü ifadeler: $x^2$ veya $x^{10}$
- Alt simge: $x_1$ veya $x_{12}$
- Yunan harfleri: $\\alpha, \\beta, \\theta, \\pi$
- Trigonometrik: $\\sin\\theta, \\cos\\theta, \\tan\\theta$
- Logaritma: $\\log_a{b}$ veya $\\ln{x}$
- Limitler: $\\lim_{x \\to \\infty}$
- İntegraller: $\\int_a^b f(x)dx$
- Türevler: $\\frac{df}{dx}$ veya $f'(x)$
- Matrisler: $$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$

ANLATIM KURALLARI:
- Gereksiz başlıklar (1. Soru Analizi, 2. Çözüm Adımları gibi) kullanma
- Doğrudan soruyu analiz et ve çözmeye başla
- Adımları "İlk olarak...", "Şimdi...", "Son olarak..." gibi doğal bağlaçlarla akıcı şekilde anlat
- Paragraflar arası tek satır boşluk bırak, fazla boşluk kullanma
- Sonucu net bir şekilde vurgula
- Öğrenciye yönelik teşvik edici ve öğretici ol
- Çözümün tamamını eksik bırakmadan bitir`;

/**
 * Görüntüyü işle ve base64 formatına çevir
 */
async function processImage(imageBuffer) {
  try {
    // Görüntüyü optimize et (max 2048px genişlik/yükseklik, 85% kalite)
    const processedBuffer = await sharp(imageBuffer)
      .resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Base64'e çevir
    const base64 = processedBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    logger.error(`Image processing error: ${error.message}`);
    throw new Error('Görüntü işlenirken hata oluştu');
  }
}

/**
 * Soruyu çöz (metin veya görüntü)
 * @param {string} userId - Kullanıcı ID
 * @param {string} questionText - Soru metni (opsiyonel)
 * @param {Buffer} imageBuffer - Görüntü buffer (opsiyonel)
 * @returns {Object} Çözüm ve metadata
 */
async function solveQuestion(userId, questionText = null, imageBuffer = null) {
  try {
    if (!questionText && !imageBuffer) {
      throw new Error('Soru metni veya görüntüsü gereklidir');
    }

    // Input array oluştur (GPT-5.1 Responses API format)
    const input = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];

    // User message content array
    const userContent = [];

    // Görüntü varsa ekle (Responses API image format)
    let imageBase64 = null;
    if (imageBuffer) {
      imageBase64 = await processImage(imageBuffer);

      userContent.push({
        type: 'input_image', // ✅ Doğru: 'input_image' ('image' değil)
        image_url: imageBase64, // data:image/jpeg;base64,... formatında
      });
    }

    // Soru metni ekle
    const questionPrompt = questionText
      ? `Soru: ${questionText}`
      : 'Yukarıdaki görseldeki soruyu çöz.';

    userContent.push({
      type: 'input_text', // ✅ Doğru: 'input_text' ('text' değil)
      text: questionPrompt,
    });

    // User message'ı ekle
    input.push({
      role: 'user',
      content: userContent,
    });

    logger.info('Solving question with OpenAI', {
      userId,
      hasText: !!questionText,
      hasImage: !!imageBuffer,
    });

    // GPT-5.1 Responses API çağrısı
    const startTime = Date.now();
    const response = await openaiService.createResponse({
      model: 'gpt-5.1',
      input,
      reasoning_effort: 'medium', // Matematiksel düşünme
      verbosity: 'medium', // Detaylı ama aşırı uzun değil
      max_output_tokens: 8000, // Uzun çözümler için yeterli
    });

    const duration = Date.now() - startTime;

    // Responses API response formatı
    let aiResponse = response.output_text;

    // Fazla satır atlamalarını temizle (max 2 newline)
    aiResponse = aiResponse.replace(/\n{3,}/g, '\n\n');

    // \[...\] formatını $$...$$ formatına çevir (frontend uyumluluğu)
    aiResponse = aiResponse.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');

    const tokensUsed = response.usage?.total_tokens || 0;
    const modelUsed = response.model;

    // Veritabanına kaydet
    const aiQuestionLog = await prisma.aIQuestionLog.create({
      data: {
        userId,
        questionText: questionText || '[Görüntü Sorusu]',
        questionImage: imageBase64,
        aiResponse: aiResponse,
        aiModel: modelUsed,
        tokensUsed: tokensUsed,
        responseTime: duration,
        rating: null, // Kullanıcı daha sonra değerlendirecek
      },
    });

    logger.info('Question solved successfully', {
      logId: aiQuestionLog.id,
      tokensUsed: tokensUsed,
      duration: `${duration}ms`,
    });

    return {
      id: aiQuestionLog.id,
      solution: aiResponse,
      model: modelUsed,
      tokensUsed: tokensUsed,
      duration,
      createdAt: aiQuestionLog.createdAt,
    };
  } catch (error) {
    logger.error(`Question solver error: ${error.message}`);
    throw error;
  }
}

/**
 * Kullanıcının soru geçmişini getir
 */
async function getUserQuestionHistory(userId, limit = 20, page = 1) {
  try {
    const skip = (page - 1) * limit;

    const [questions, totalCount] = await Promise.all([
      prisma.aIQuestionLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: skip,
        select: {
          id: true,
          questionText: true,
          questionImage: true,
          aiResponse: true,
          aiModel: true,
          rating: true,
          tokensUsed: true,
          responseTime: true,
          createdAt: true,
        },
      }),
      prisma.aIQuestionLog.count({ where: { userId } }),
    ]);

    return {
      questions,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    logger.error(`Get question history error: ${error.message}`);
    throw error;
  }
}

/**
 * Tek bir soru çözümünü getir
 */
async function getQuestionById(questionId, userId) {
  try {
    const question = await prisma.aIQuestionLog.findFirst({
      where: {
        id: questionId,
        userId,
      },
    });

    if (!question) {
      throw new Error('Soru bulunamadı');
    }

    return question;
  } catch (error) {
    logger.error(`Get question by ID error: ${error.message}`);
    throw error;
  }
}

/**
 * Soru çözümünü değerlendir (1-5 yıldız)
 */
async function rateQuestion(questionId, userId, rating) {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Değerlendirme 1-5 arası olmalıdır');
    }

    const question = await prisma.aIQuestionLog.findFirst({
      where: {
        id: questionId,
        userId,
      },
    });

    if (!question) {
      throw new Error('Soru bulunamadı');
    }

    const updatedQuestion = await prisma.aIQuestionLog.update({
      where: { id: questionId },
      data: { rating: parseInt(rating) },
    });

    logger.info(`Question rated: ${questionId} - ${rating} stars`);

    return updatedQuestion;
  } catch (error) {
    logger.error(`Rate question error: ${error.message}`);
    throw error;
  }
}

/**
 * Kullanıcının AI kullanım istatistiklerini getir
 */
async function getUserAIStats(userId) {
  try {
    const stats = await prisma.aIQuestionLog.aggregate({
      where: { userId },
      _count: true,
      _sum: {
        tokensUsed: true,
        responseTime: true,
      },
      _avg: {
        rating: true,
        tokensUsed: true,
        responseTime: true,
      },
    });

    const ratingDistribution = await prisma.aIQuestionLog.groupBy({
      by: ['rating'],
      where: {
        userId,
        rating: { not: null },
      },
      _count: true,
    });

    // Son 7 gün aktivitesi
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.aIQuestionLog.count({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    return {
      totalQuestions: stats._count,
      totalTokensUsed: stats._sum.tokensUsed || 0,
      totalResponseTime: stats._sum.responseTime || 0,
      averageRating: stats._avg.rating ? parseFloat(stats._avg.rating.toFixed(2)) : null,
      averageTokensPerQuestion: stats._avg.tokensUsed
        ? Math.round(stats._avg.tokensUsed)
        : 0,
      averageResponseTime: stats._avg.responseTime
        ? Math.round(stats._avg.responseTime)
        : 0,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        if (item.rating !== null) {
          acc[item.rating] = item._count;
        }
        return acc;
      }, {}),
      questionsLast7Days: recentActivity,
    };
  } catch (error) {
    logger.error(`Get AI stats error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  solveQuestion,
  getUserQuestionHistory,
  getQuestionById,
  rateQuestion,
  getUserAIStats,
};
