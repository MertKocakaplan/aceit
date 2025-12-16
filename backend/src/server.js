require('dotenv').config(); // Bunu yorum satırına almanızı şiddetle tavsiye ederim.
console.log('--- 1. require dotenv geçildi ---'); // Yorum satırı ise, silin.

const app = require('./app');
console.log('--- 2. app.js başarıyla require edildi ---'); // Eğer bunu görmüyorsak, hata app.js içindedir.

const logger = require('./utils/logger');
console.log('--- 3. Logger başarıyla require edildi ---'); // Eğer bunu görmüyorsak, hata logger.js içindedir.

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  console.log('--- 4. app.listen BAŞARILI ---'); // Eğer burayı görmüyorsak, çöküş ondan öncedir.
});