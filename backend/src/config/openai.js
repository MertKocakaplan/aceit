const OpenAI = require('openai');
const logger = require('../utils/logger');

/**
 * OpenAI Client Singleton
 */
class OpenAIClient {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('⚠️  OPENAI_API_KEY is not set in environment variables');
      this.client = null;
      return;
    }

    if (process.env.OPENAI_API_KEY === 'sk-proj-BURAYA_API_KEY_GELECEK') {
      logger.warn('⚠️  Please set a valid OPENAI_API_KEY in .env file');
      this.client = null;
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 120000, // 2 dakika timeout (AI analiz uzun sürebilir)
        maxRetries: 2, // 2 kere retry
      });

      logger.info('✅ OpenAI client initialized successfully');
    } catch (error) {
      logger.error(`❌ OpenAI client initialization error: ${error.message}`);
      this.client = null;
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('OpenAI client is not initialized. Please check your OPENAI_API_KEY.');
    }
    return this.client;
  }

  isReady() {
    return this.client !== null;
  }
}

// Export singleton instance
module.exports = new OpenAIClient();
