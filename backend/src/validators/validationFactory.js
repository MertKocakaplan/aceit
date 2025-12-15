/**
 * Validation Middleware Factory
 *
 * Joi schema'larını Express middleware'e dönüştürür.
 * Tüm validator dosyalarında ortak olarak kullanılır.
 */

/**
 * Validation middleware oluşturur
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const createValidator = (schema) => {
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

module.exports = { createValidator };
