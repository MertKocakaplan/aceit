/**
 * Logger Utility
 *
 * Merkezi log yönetim sistemi. Production ve development ortamları için
 * farklı log seviyeleri sağlar.
 *
 * Log Seviyeleri:
 * - DEBUG: Detaylı debug bilgileri (sadece development'ta gösterilir)
 * - INFO: Genel bilgilendirme mesajları
 * - WARN: Uyarı mesajları
 * - ERROR: Hata mesajları
 *
 * Kullanım:
 * ```javascript
 * import logger from '@/utils/logger';
 *
 * logger.debug('Detaylı debug bilgisi', { data });
 * logger.info('Bilgilendirme mesajı');
 * logger.warn('Uyarı mesajı', error);
 * logger.error('Hata oluştu', error);
 * ```
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

// Environment'a göre log seviyesi belirleme
const getLogLevel = () => {
  const env = import.meta.env.MODE || 'development';

  // Production'da sadece WARN ve ERROR göster
  if (env === 'production') {
    return LOG_LEVELS.WARN;
  }

  // Development'ta tüm logları göster
  return LOG_LEVELS.DEBUG;
};

const currentLogLevel = getLogLevel();

/**
 * Zaman damgası formatla
 */
const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
};

/**
 * Log prefix oluştur
 */
const createPrefix = (level, color) => {
  const timestamp = formatTimestamp();
  return [`%c[${timestamp}] ${level}`, `color: ${color}; font-weight: bold`];
};

/**
 * Logger sınıfı
 */
class Logger {
  /**
   * Debug seviyesinde log
   * @param {string} message - Log mesajı
   * @param {...any} args - Ek parametreler
   */
  debug(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      const [prefix, style] = createPrefix('DEBUG', '#6B7280');
      console.log(prefix, message, ...args);
      console.groupEnd?.();
    }
  }

  /**
   * Info seviyesinde log
   * @param {string} message - Log mesajı
   * @param {...any} args - Ek parametreler
   */
  info(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      const [prefix, style] = createPrefix('INFO', '#3B82F6');
      console.log(prefix, message, ...args);
    }
  }

  /**
   * Warning seviyesinde log
   * @param {string} message - Log mesajı
   * @param {...any} args - Ek parametreler
   */
  warn(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      const [prefix, style] = createPrefix('WARN', '#F59E0B');
      console.warn(prefix, message, ...args);
    }
  }

  /**
   * Error seviyesinde log
   * @param {string} message - Log mesajı
   * @param {...any} args - Ek parametreler
   */
  error(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      const [prefix, style] = createPrefix('ERROR', '#EF4444');
      console.error(prefix, message, ...args);

      // Stack trace varsa göster
      if (args.length > 0 && args[0] instanceof Error) {
        console.error('Stack trace:', args[0].stack);
      }
    }
  }

  /**
   * Grup başlat (ilgili logları grupla)
   * @param {string} label - Grup etiketi
   */
  group(label) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.group(`🔵 ${label}`);
    }
  }

  /**
   * Daraltılmış grup başlat
   * @param {string} label - Grup etiketi
   */
  groupCollapsed(label) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.groupCollapsed(`🔵 ${label}`);
    }
  }

  /**
   * Grubu kapat
   */
  groupEnd() {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.groupEnd();
    }
  }

  /**
   * Tablo formatında log
   * @param {Array|Object} data - Tablo verisi
   */
  table(data) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.table(data);
    }
  }

  /**
   * Performans ölçümü başlat
   * @param {string} label - Ölçüm etiketi
   */
  time(label) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.time(label);
    }
  }

  /**
   * Performans ölçümünü bitir
   * @param {string} label - Ölçüm etiketi
   */
  timeEnd(label) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.timeEnd(label);
    }
  }
}

// Singleton instance
const logger = new Logger();

export default logger;
