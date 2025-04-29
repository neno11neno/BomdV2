const express = require('express');
const { Note, User } = require('../models');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await Note.findAll({
      include: [{ model: User, attributes: ['email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(notes);
  } catch (err) {
    console.error('❌ 取得所有筆記失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const note = await Note.create({ title, content, tags, userId: req.user.userId });
  res.json(note);
});

router.get('/:id', verifyToken, async (req, res) => {
  const note = await Note.findByPk(req.params.id, {
    include: [{ model: User, attributes: ['email'] }],
  });
  if (!note) return res.sendStatus(404);
  res.json(note);
});

router.put('/:id', verifyToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const note = await Note.findByPk(req.params.id);
  if (!note) return res.sendStatus(404);
  await note.update({ title, content, tags });
  res.json(note);
});

router.delete('/:id', verifyToken, async (req, res) => {
  const note = await Note.findByPk(req.params.id);
  if (!note) return res.sendStatus(404);
  await note.destroy();
  res.json({ message: '刪除成功' });
});

module.exports = router;
