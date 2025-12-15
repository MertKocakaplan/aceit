const Joi = require('joi');
const { createValidator } = require('./validationFactory');

/**
 * Kayıt (Register) validasyonu
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Geçerli bir email adresi giriniz',
      'any.required': 'Email adresi zorunludur',
    }),
  
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Kullanıcı adı sadece harf ve rakam içerebilir',
      'string.min': 'Kullanıcı adı en az 3 karakter olmalıdır',
      'string.max': 'Kullanıcı adı en fazla 30 karakter olabilir',
      'any.required': 'Kullanıcı adı zorunludur',
    }),
  
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Şifre en az 8 karakter olmalıdır',
      'any.required': 'Şifre zorunludur',
    }),
  
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Ad Soyad en az 2 karakter olmalıdır',
      'string.max': 'Ad Soyad en fazla 100 karakter olabilir',
      'any.required': 'Ad Soyad zorunludur',
    }),
  
  examType: Joi.string()
    .valid('LGS', 'YKS_SAYISAL', 'YKS_ESIT_AGIRLIK', 'YKS_SOZEL', 'YKS_DIL')
    .required()
    .messages({
      'any.only': 'Geçersiz sınav türü. Geçerli değerler: LGS, YKS_SAYISAL, YKS_ESIT_AGIRLIK, YKS_SOZEL, YKS_DIL',
      'any.required': 'Sınav türü zorunludur',
    }),
  targetDate: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Geçersiz tarih formatı',
    }),
  
  targetScore: Joi.number()
    .integer()
    .min(0)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Hedef skor sayı olmalıdır',
      'number.min': 'Hedef skor 0\'dan büyük olmalıdır',
    }),
});

/**
 * Giriş (Login) validasyonu
 */
const loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Email veya kullanıcı adı zorunludur',
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Şifre zorunludur',
    }),
});

module.exports = {
  validateRegister: createValidator(registerSchema),
  validateLogin: createValidator(loginSchema),
};