require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Arya Niwas Hotel Management Server running on port ${PORT}`);
  console.log(`Backend API available at: http://localhost:${PORT}/api`);
});

