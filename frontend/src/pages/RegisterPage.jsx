import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!email || !password || !confirm) {
      return setError('請填寫所有欄位');
    }
    if (password !== confirm) {
      return setError('密碼與確認密碼不一致');
    }

    try {
      await axios.post('/api/auth/register', { email, password });
      setSuccess('註冊成功，將跳轉到登入頁...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '註冊失敗');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4, bgcolor: '#1e1e1e' }}>
        <Typography variant="h5" color="white" gutterBottom>
          註冊帳號
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{ style: { color: '#fff' } }}
          InputLabelProps={{ style: { color: '#ccc' } }}
        />
        <TextField
          label="密碼"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{ style: { color: '#fff' } }}
          InputLabelProps={{ style: { color: '#ccc' } }}
        />
        <TextField
          label="確認密碼"
          type="password"
          fullWidth
          variant="outlined"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{ style: { color: '#fff' } }}
          InputLabelProps={{ style: { color: '#ccc' } }}
        />

        <Button variant="contained" fullWidth onClick={handleRegister}>
          註冊
        </Button>

        <Box mt={2} textAlign="center">
          <Typography
            variant="body2"
            color="gray"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            已有帳號？點我登入
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
