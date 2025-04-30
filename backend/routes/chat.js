const fetch = require('node-fetch');

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  const ollamaHost = process.env.OLLAMA_API || 'http://localhost:11434';
  const response = await fetch(`${ollamaHost}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral', // 或其他你已 pull 的模型
      prompt: message,
      stream: false,
    }),
  });

  const result = await response.json();
  res.json({ reply: result.response });
});
