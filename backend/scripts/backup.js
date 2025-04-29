const { exec } = require('child_process');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs');

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
  const backupPath = path.join(BACKUP_DIR, `pg-backup-${date}.sql`);

  const cmd = `pg_dump -U ${DB_USER} -h ${DB_HOST} -d ${DB_NAME} -F c -f ${backupPath}`;

  console.log(`📦 執行備份命令：${cmd}`);
  exec(cmd, { env: process.env }, (err) => {
    if (err) {
      console.error('❌ PostgreSQL 備份失敗:', err.message);
    } else {
      console.log(`✅ 備份完成：${backupPath}`);
    }
  });
};

// 每天凌晨 1 點備份
cron.schedule('0 1 * * *', runBackup);

// 預先執行一次（第一次啟動也會備份）
runBackup();

module.exports = runBackup;
