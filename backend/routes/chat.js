// routes/chat.js
const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: '請提供 message 內容' });
  }

  try {
    const response = await fetch(`${process.env.OLLAMA_API || 'http://localhost:11434'}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: message,
        stream: false,
      }),
    });

    const result = await response.json();
    res.json({ reply: result.response });
  } catch (err) {
    console.error('呼叫 Ollama 失敗：', err.message);
    res.status(500).json({ error: 'Ollama 模型無法連線' });
  }
});

module.exports = router;
