const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { sequelize } = require('./models');
const createAdmin = require('./createAdmin');
const runBackup = require('./scripts/backup');

const authRoute = require('./routes/auth');
const notesRoute = require('./routes/notes');
const tagsRoute = require('./routes/tags');
const uploadRoute = require('./routes/upload');
const chatRoute = require('./routes/chat');
const verifyToken = require('./middleware/verifyToken');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoute);
app.use('/api/auth', authRoute);
app.use('/api/notes', verifyToken, notesRoute);
app.use('/api/tags', tagsRoute);
app.use('/api/chat', chatRoute);

const startApp = async () => {
  let retries = 10;
  while (retries) {
    try {
      console.log('⏳ 等待 PostgreSQL 連線中...');
      await sequelize.authenticate();
      console.log('✅ PostgreSQL 已連線');

      await sequelize.sync();
      await createAdmin();
      runBackup();

      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 Server 伺服器啟動於 http://localhost:${PORT}`);
      });

      break;
    } catch (err) {
      retries--;
      console.log(`❌ PostgreSQL 連線失敗，重試中... 剩餘次數 ${retries}`);
      console.error(err.message);
      await delay(3000);
    }
  }

  if (!retries) {
    console.error('🚫 無法連上資料庫，請檢查 md-postgres 是否正常');
    process.exit(1);
  }
};

startApp();
