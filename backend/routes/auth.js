const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const { User } = require('../models');


const router = express.Router();

// 註冊
router.post('/register', async (req, res) => {
  const { email, password, isAdmin = false } = req.body;
  if (!email || !password) return res.status(400).json({ message: '缺少帳號或密碼' });

  try {
    const exist = await User.findOne({ where: { email } });
    if (exist) return res.status(409).json({ message: '帳號已存在' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, isAdmin });
    res.status(201).json({ message: '註冊成功' });
  } catch (err) {
    console.error('❌ 註冊失敗:', err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 登入
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: '帳號不存在' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: '密碼錯誤' });

  const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// 取得使用者資料
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findByPk(req.user.userId, { attributes: { exclude: ['password'] } });
  res.json(user);
});

module.exports = router;
