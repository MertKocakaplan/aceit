const Joi = require('joi');

/**
 * Study Session oluşturma validasyonu
 */
const createStudySessionSchema = Joi.object({
  subjectId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Geçersiz ders ID formatı',
      'any.required': 'Ders seçimi zorunludur',
    }),

  topicId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Geçersiz konu ID formatı',
    }),

  date: Joi.date()
    .optional()
    .default(() => new Date())
    .messages({
      'date.base': 'Geçersiz tarih formatı',
    }),

  duration: Joi.number()
    .integer()
    .min(1)
    .max(1440) // Maksimum 24 saat (1440 dakika)
    .required()
    .messages({
      'number.base': 'Çalışma süresi sayı olmalıdır',
      'number.min': 'Çalışma süresi en az 1 dakika olmalıdır',
      'number.max': 'Çalışma süresi en fazla 1440 dakika (24 saat) olabilir',
      'any.required': 'Çalışma süresi zorunludur',
    }),

  questionsCorrect: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Doğru soru sayısı sayı olmalıdır',
      'number.min': 'Doğru soru sayısı 0\'dan küçük olamaz',
    }),

  questionsWrong: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Yanlış soru sayısı sayı olmalıdır',
      'number.min': 'Yanlış soru sayısı 0\'dan küçük olamaz',
    }),

  questionsEmpty: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Boş soru sayısı sayı olmalıdır',
      'number.min': 'Boş soru sayısı 0\'dan küçük olamaz',
    }),

  notes: Joi.string()
    .max(1000)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Notlar en fazla 1000 karakter olabilir',
    }),
});

/**
 * Study Session güncelleme validasyonu
 */
const updateStudySessionSchema = Joi.object({
  subjectId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'Geçersiz ders ID formatı',
    }),

  topicId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Geçersiz konu ID formatı',
    }),

  date: Joi.date()
    .optional()
    .messages({
      'date.base': 'Geçersiz tarih formatı',
    }),

  duration: Joi.number()
    .integer()
    .min(1)
    .max(1440)
    .optional()
    .messages({
      'number.base': 'Çalışma süresi sayı olmalıdır',
      'number.min': 'Çalışma süresi en az 1 dakika olmalıdır',
      'number.max': 'Çalışma süresi en fazla 1440 dakika olabilir',
    }),

  questionsCorrect: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Doğru soru sayısı sayı olmalıdır',
      'number.min': 'Doğru soru sayısı 0\'dan küçük olamaz',
    }),

  questionsWrong: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Yanlış soru sayısı sayı olmalıdır',
      'number.min': 'Yanlış soru sayısı 0\'dan küçük olamaz',
    }),

  questionsEmpty: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Boş soru sayısı sayı olmalıdır',
      'number.min': 'Boş soru sayısı 0\'dan küçük olamaz',
    }),

  notes: Joi.string()
    .max(1000)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Notlar en fazla 1000 karakter olabilir',
    }),
})
  .min(1)
  .messages({
    'object.min': 'Güncellenecek en az bir alan belirtmelisiniz',
  });

/**
 * Validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validateCreateStudySession: validate(createStudySessionSchema),
  validateUpdateStudySession: validate(updateStudySessionSchema),
};