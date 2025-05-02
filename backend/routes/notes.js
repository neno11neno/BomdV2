const express = require('express');
const { Note, User } = require('../models');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// 取得所有筆記 (過濾私人筆記)
router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { isPrivate: false }, // 只顯示公開筆記
      include: [{ model: User, attributes: ['email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(notes);
  } catch (err) {
    console.error('❌ 取得所有筆記失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 新增筆記
router.post('/', verifyToken, async (req, res) => {
  const { title, content, tags, image, isPrivate } = req.body; // 新增 isPrivate 欄位
  try {
    const note = await Note.create({
      title,
      content,
      tags,
      image,
      isPrivate: isPrivate || false, // 預設為公開筆記
      userId: req.user.userId,
    });
    res.json(note);
  } catch (err) {
    console.error('❌ 新增筆記失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 取得單筆筆記
router.get('/:id', verifyToken, async (req, res) => {
  const note = await Note.findByPk(req.params.id, {
    include: [{ model: User, attributes: ['email'] }],
  });

  if (!note) return res.sendStatus(404);

  // 如果筆記是私人且不是當前使用者擁有，返回 403
  if (note.isPrivate && note.userId !== req.user.userId) {
    return res.status(403).json({ message: '您無法查看這個私人筆記' });
  }

  res.json(note);
});

// 更新筆記
router.put('/:id', verifyToken, async (req, res) => {
  const { title, content, tags, image, isPrivate } = req.body; // 接收 isPrivate 欄位
  const note = await Note.findByPk(req.params.id);

  if (!note) return res.sendStatus(404);

  // 只有筆記的擁有者才能更新筆記
  if (note.userId !== req.user.userId) {
    return res.status(403).json({ message: '您無權編輯這個筆記' });
  }

  await note.update({ title, content, tags, image, isPrivate });
  res.json(note);
});

// 刪除筆記
router.delete('/:id', verifyToken, async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (!note) return res.sendStatus(404);

  // 只有筆記的擁有者才能刪除筆記
  if (note.userId !== req.user.userId) {
    return res.status(403).json({ message: '您無權刪除這個筆記' });
  }

  await note.destroy();
  res.json({ message: '刪除成功' });
});

module.exports = router;
