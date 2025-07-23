const { exec } = require('child_process');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs');


const BACKUP_DIR = path.join(__dirname, '..', 'backup');
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_HOST = process.env.DB_HOST;
const MAX_BACKUPS = 7; 


if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const cleanOldBackups = () => {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(name => name.endsWith('.sql'))
    .map(name => ({
      name,
      time: fs.statSync(path.join(BACKUP_DIR, name)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time); 

  const oldBackupFiles = files.slice(MAX_BACKUPS); 

  oldBackupFiles.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file.name);
    fs.unlinkSync(filePath);
    console.log(`🗑️ 刪除舊備份：${file.name}`);
  });
};


const runBackup = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const backupPath = path.join(BACKUP_DIR, `pg-backup-${date}.sql`);

  const cmd = `pg_dump -U ${DB_USER} -h ${DB_HOST} -d ${DB_NAME} -f ${backupPath}`;
  const env = {
  env: process.env,
  PGPASSWORD: process.env.DB_PASSWORD};

  console.log(`執行備份命令：${cmd}`);

  
  exec(cmd, {env}, (err) => {
    if (err) {
      console.error('❌ PostgreSQL 備份失敗:', err.message);
    } else {
      console.log(`✅ 備份完成：${backupPath}`);
      cleanOldBackups(); // 備份成功後清理舊檔
    }
  });
};

// 每天凌晨 1 點備份
cron.schedule('0 1 * * *', runBackup);

// 預先執行一次（第一次啟動也會備份）
runBackup();

module.exports = runBackup;
