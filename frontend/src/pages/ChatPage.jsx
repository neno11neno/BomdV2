import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/chat', { message });
      setReply(res.data.reply);
    } catch (err) {
      setReply('⚠️ 回覆失敗，請確認伺服器有啟動。');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" gutterBottom>
          阿拉丁世界
        </Typography>

        <TextField
          label="輸入你的問題"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={4}
          fullWidth
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSend}
            disabled={loading}
          >
            發送
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 2, minHeight: '100px' }}>
          <Typography variant="subtitle1" color="text.secondary">
            神燈精靈回覆：
          </Typography>
          {loading ? (
            <Box sx={{ mt: 1 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {reply || '（尚無回覆）'}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ChatPage;
