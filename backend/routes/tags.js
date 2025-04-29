const express = require('express');
const router = express.Router();
const { Note } = require('../models');
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
  try {
    const notes = await Note.findAll({ where: { userId: req.user.userId } });
    const tags = new Set();
    notes.forEach((note) => {
      (note.tags || []).forEach((tag) => tags.add(tag));
    });
    res.json([...tags]);
  } catch (err) {
    res.status(500).json({ error: '取得標籤失敗' });
  }
});

module.exports = router;
