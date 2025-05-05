const express = require('express');
const { Group, User } = require('../models');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// 確認是否為管理員
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: '無權限' });
  next();
};

// 新增群組
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: '群組名稱不能為空' });

  try {
    const group = await Group.create({ name });
    res.status(201).json(group);
  } catch (err) {
    console.error('❌ 新增群組失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 取得所有群組
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (err) {
    console.error('❌ 取得群組失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 更新群組
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  try {
    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: '群組不存在' });

    await group.update({ name });
    res.json(group);
  } catch (err) {
    console.error('❌ 更新群組失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 刪除群組
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: '群組不存在' });

    await group.destroy();
    res.json({ message: '群組已刪除' });
  } catch (err) {
    console.error('❌ 刪除群組失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;