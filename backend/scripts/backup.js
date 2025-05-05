const { exec } = require('child_process');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs');
const zlib = require('zlib');

const BACKUP_DIR = path.join(__dirname, '..', 'backup');
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;

// 確保備份資料夾存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const runBackup = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const backupFile = `pg-backup-${date}.sql`;
  const backupPath = path.join(BACKUP_DIR, backupFile);
  const zipPath = `${backupPath}.gz`;

  // 使用 plain text 格式，才能進行 gzip 壓縮
  const cmd = `pg_dump -U ${DB_USER} -h ${DB_HOST} -d ${DB_NAME} -f ${backupPath}`;

  console.log(`📦 執行備份命令：${cmd}`);
  exec(cmd, { env: process.env }, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ PostgreSQL 備份失敗:', err.message);
      console.error('📄 詳細錯誤：', stderr);
      return;
    }

    console.log(`📄 備份文件已生成：${backupPath}`);

    const gzip = zlib.createGzip();
    const source = fs.createReadStream(backupPath);
    const destination = fs.createWriteStream(zipPath);

    source.on('error', (err) => {
      console.error('❌ 讀取備份檔失敗:', err.message);
    });

    destination.on('error', (err) => {
      console.error('❌ 寫入壓縮檔失敗:', err.message);
    });

    destination.on('finish', () => {
      console.log(`✅ 備份完成並壓縮：${zipPath}`);
      fs.unlinkSync(backupPath); // 刪除原始 SQL 文件
      cleanOldBackups();
    });

    source.pipe(gzip).pipe(destination);
  });
};

const cleanOldBackups = () => {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();

  files.forEach((file) => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

    console.log(`📁 檢查備份檔：${file}，年齡：${ageInDays.toFixed(2)} 天`);
    if (ageInDays > 3) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ 已刪除過期備份：${filePath}`);
    }
  });
};

// 每天凌晨 1 點執行備份
cron.schedule('0 1 * * *', runBackup);

// 啟動時就先備份一次
runBackup();

// 匯出給其他模組使用（如果需要）
module.exports = runBackup;
