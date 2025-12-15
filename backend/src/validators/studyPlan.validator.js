const Joi = require('joi');
const { createValidator } = require('./validationFactory');

/**
 * Plan oluşturma validasyonu
 */
const createPlanSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.empty': 'Başlık gereklidir',
      'string.max': 'Başlık en fazla 200 karakter olabilir',
      'any.required': 'Başlık gereklidir'
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Açıklama en fazla 500 karakter olabilir'
    }),

  startDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Geçerli bir tarih formatı giriniz',
      'any.required': 'Başlangıç tarihi gereklidir'
    }),

  endDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Geçerli bir tarih formatı giriniz',
      'any.required': 'Bitiş tarihi gereklidir'
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive boolean olmalıdır'
    })
});

/**
 * Plan güncelleme validasyonu
 */
const updatePlanSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Başlık en fazla 200 karakter olabilir'
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Açıklama en fazla 500 karakter olabilir'
    }),

  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Geçerli bir tarih formatı giriniz'
    }),

  endDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Geçerli bir tarih formatı giriniz'
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive boolean olmalıdır'
    })
})
  .min(1)
  .messages({
    'object.min': 'Güncellenecek en az bir alan belirtmelisiniz'
  });

/**
 * AI plan generation validasyonu
 */
const generateAISchema = Joi.object({
  startDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Geçerli bir tarih formatı giriniz',
      'any.required': 'Başlangıç tarihi gereklidir'
    }),

  endDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Geçerli bir tarih formatı giriniz',
      'any.required': 'Bitiş tarihi gereklidir'
    }),

  dailyStudyHours: Joi.number()
    .integer()
    .min(1)
    .max(16)
    .optional()
    .default(5)
    .messages({
      'number.base': 'Günlük çalışma saati sayı olmalıdır',
      'number.min': 'Günlük çalışma saati en az 1 olmalıdır',
      'number.max': 'Günlük çalışma saati en fazla 16 olabilir'
    }),

  preferredStartTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .default('09:00')
    .messages({
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)'
    }),

  preferredEndTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .default('22:00')
    .messages({
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)'
    }),

  breakDuration: Joi.number()
    .integer()
    .min(5)
    .max(60)
    .optional()
    .default(15)
    .messages({
      'number.base': 'Mola süresi sayı olmalıdır',
      'number.min': 'Mola süresi en az 5 dakika olmalıdır',
      'number.max': 'Mola süresi en fazla 60 dakika olabilir'
    }),

  focusOnWeakTopics: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'focusOnWeakTopics boolean olmalıdır'
    }),

  includeReviewSessions: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'includeReviewSessions boolean olmalıdır'
    }),

  prioritySubjects: Joi.array()
    .items(Joi.string().uuid())
    .optional()
    .default([])
    .messages({
      'array.base': 'prioritySubjects bir array olmalıdır',
      'string.guid': 'Geçersiz subject ID formatı'
    })
});

/**
 * Day oluşturma validasyonu
 */
const createDaySchema = Joi.object({
  date: Joi.date()
    .required()
    .messages({
      'date.base': 'Geçerli bir tarih formatı giriniz',
      'any.required': 'Tarih gereklidir'
    }),

  dailyGoalMinutes: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Günlük hedef dakika sayı olmalıdır',
      'number.min': 'Günlük hedef 0\'dan küçük olamaz'
    })
});

/**
 * Slot oluşturma validasyonu
 */
const createSlotSchema = Joi.object({
  subjectId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Geçerli bir UUID giriniz',
      'any.required': 'Ders ID gereklidir'
    }),

  topicId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Geçerli bir UUID giriniz'
    }),

  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)',
      'any.required': 'Başlangıç saati gereklidir'
    }),

  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)',
      'any.required': 'Bitiş saati gereklidir'
    }),

  priority: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .default(3)
    .messages({
      'number.base': 'Öncelik sayı olmalıdır',
      'number.min': 'Öncelik en az 1 olmalıdır',
      'number.max': 'Öncelik en fazla 5 olabilir'
    }),

  slotType: Joi.string()
    .valid('study', 'break', 'review', 'practice')
    .optional()
    .default('study')
    .messages({
      'any.only': 'Geçerli bir slot tipi giriniz'
    }),

  notes: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Notlar en fazla 500 karakter olabilir'
    })
});

/**
 * Slot güncelleme validasyonu
 */
const updateSlotSchema = Joi.object({
  subjectId: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'Geçerli bir UUID giriniz'
    }),

  topicId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Geçerli bir UUID giriniz'
    }),

  startTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .messages({
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)'
    }),

  endTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .messages({
      'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM)'
    }),

  priority: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.base': 'Öncelik sayı olmalıdır',
      'number.min': 'Öncelik en az 1 olmalıdır',
      'number.max': 'Öncelik en fazla 5 olabilir'
    }),

  notes: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Notlar en fazla 500 karakter olabilir'
    }),

  isCompleted: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isCompleted boolean olmalıdır'
    })
})
  .min(1)
  .messages({
    'object.min': 'Güncellenecek en az bir alan belirtmelisiniz'
  });

/**
 * Slot tamamlama validasyonu
 */
const markSlotCompleteSchema = Joi.object({
  completed: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Tamamlanma durumu boolean olmalıdır',
      'any.required': 'Tamamlanma durumu gereklidir'
    }),

  questionsCorrect: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Doğru soru sayısı sayı olmalıdır',
      'number.min': 'Doğru soru sayısı 0\'dan küçük olamaz'
    }),

  questionsWrong: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Yanlış soru sayısı sayı olmalıdır',
      'number.min': 'Yanlış soru sayısı 0\'dan küçük olamaz'
    }),

  questionsEmpty: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Boş soru sayısı sayı olmalıdır',
      'number.min': 'Boş soru sayısı 0\'dan küçük olamaz'
    })
});

module.exports = {
  validateCreatePlan: createValidator(createPlanSchema),
  validateUpdatePlan: createValidator(updatePlanSchema),
  validateGenerateAI: createValidator(generateAISchema),
  validateCreateDay: createValidator(createDaySchema),
  validateCreateSlot: createValidator(createSlotSchema),
  validateUpdateSlot: createValidator(updateSlotSchema),
  validateMarkSlotComplete: createValidator(markSlotCompleteSchema)
};
