const openaiClient = require('../../config/openai');
const logger = require('../../utils/logger');

/**
 * OpenAI Service - Responses API Wrapper
 * GPT-5.1 ile çalışır
 */
class OpenAIService {
  constructor() {
    this.defaultModel = process.env.OPENAI_MODEL || 'gpt-5.1';
  }

  /**
   * Responses API - Yeni Standart
   * @param {Object} options
   * @param {string} options.model - 'gpt-5.1'
   * @param {Array} options.input - Messages array
   * @param {Object} options.text - Text format options (json_schema, etc.)
   * @param {string} options.reasoning_effort - 'minimal', 'low', 'medium', 'high'
   * @param {string} options.verbosity - 'low', 'medium', 'high'
   * @param {number} options.max_output_tokens
   * @param {number} options.temperature
   * @param {boolean} options.stream
   */
  async createResponse(options) {
    const client = openaiClient.getClient();

    const {
      model = this.defaultModel,
      input,
      text,
      reasoning_effort = 'medium',
      verbosity = 'medium',
      max_output_tokens = 8000,
      stream = false,
    } = options;

    if (!input || !Array.isArray(input)) {
      throw new Error('input array is required');
    }

    try {
      const requestPayload = {
        model,
        input,
        reasoning: {
          effort: reasoning_effort,
        },
        text: {
          verbosity: verbosity,
        },
        max_output_tokens,
        stream,
      };

      // Eğer text parametresi varsa, onu kullan ama verbosity'yi koru
      if (text) {
        requestPayload.text = {
          ...text,
          verbosity: verbosity,
        };
      }

      logger.info('OpenAI API Request', {
        model,
        reasoning_effort,
        verbosity,
        inputLength: input.length,
      });

      const startTime = Date.now();
      const response = await client.responses.create(requestPayload);
      const duration = Date.now() - startTime;

      logger.info('OpenAI API Response', {
        model: response.model,
        tokensUsed: response.usage?.total_tokens,
        duration: `${duration}ms`,
      });

      return {
        output_text: response.output_text,
        usage: response.usage,
        model: response.model,
        duration,
      };
    } catch (error) {
      logger.error('OpenAI API Error', {
        error: error.message,
        code: error.code,
        type: error.type,
      });

      // User-friendly error messages
      if (error.code === 'insufficient_quota') {
        throw new Error('AI servisi kotası doldu. Lütfen daha sonra tekrar deneyin.');
      } else if (error.code === 'rate_limit_exceeded') {
        throw new Error('Çok fazla istek gönderildi. Lütfen biraz bekleyin.');
      } else if (error.code === 'invalid_api_key') {
        throw new Error('AI servisi yapılandırma hatası.');
      } else if (error.code === 'context_length_exceeded') {
        throw new Error('Soru çok uzun. Lütfen kısaltın.');
      } else {
        throw new Error('AI servisi geçici olarak kullanılamıyor.');
      }
    }
  }

  /**
   * Legacy Chat Completions API (hala destekleniyor)
   * Gerekirse kullanılabilir
   */
  async createChatCompletion(messages, options = {}) {
    const client = openaiClient.getClient();

    const {
      model = this.defaultModel,
      max_tokens = 2000,
      temperature = 0.7,
      tools,
      tool_choice,
    } = options;

    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        max_tokens,
        temperature,
        tools,
        tool_choice,
      });

      return response;
    } catch (error) {
      logger.error('Chat Completion Error', error);
      throw error;
    }
  }

  /**
   * Streaming response için
   */
  async *streamResponse(options) {
    const client = openaiClient.getClient();

    const response = await this.createResponse({
      ...options,
      stream: true,
    });

    for await (const chunk of response) {
      if (chunk.output_text) {
        yield chunk.output_text;
      }
    }
  }

  /**
   * AI hazır mı kontrol et
   */
  isReady() {
    return openaiClient.isReady();
  }
}

module.exports = new OpenAIService();
