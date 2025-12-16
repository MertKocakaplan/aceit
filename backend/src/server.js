require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT;

console.log('PORT =>', PORT);
console.log('NODE_ENV =>', process.env.NODE_ENV);

if (!PORT) {
  console.error('❌ PORT is undefined');
  process.exit(1);
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
