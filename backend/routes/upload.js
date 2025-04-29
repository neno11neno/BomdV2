const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// 改成先暫存在記憶體
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '沒有檔案' });

    // 1. 計算檔案的 hash（用 buffer 計算）
    const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // 2. 用 hash + 副檔名 當作檔名
    const ext = path.extname(req.file.originalname);
    const fileName = `${hash}${ext}`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    const fileUrl = `/uploads/${fileName}`;

    // 3. 如果檔案不存在才寫入
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, req.file.buffer);
      console.log(`✅ 新圖片儲存: ${fileName}`);
    } else {
      console.log(`⚠️ 檔案已存在: ${fileName}`);
    }

    res.json({ url: fileUrl });
  } catch (err) {
    console.error('❌ 圖片儲存失敗:', err);
    res.status(500).json({ message: '圖片儲存錯誤' });
  }
});

module.exports = router;
