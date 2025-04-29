import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Container,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, token } = useAuth();


  useEffect(() => {
    if (token) {
      navigate('/notes');
    }
  }, [token]);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token);
      await login(res.data.token);
      navigate('/notes');
    } catch (err) {
      setError(err.response?.data?.message || '登入失敗，請確認帳號密碼');
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'black',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            bgcolor: '#1e1e1e',
            color: '#fff',
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            使用者登入
          </Typography>

          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{ style: { color: '#aaa' } }}
              InputProps={{ style: { color: '#fff' } }}
            />
            <TextField
              label="密碼"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ style: { color: '#aaa' } }}
              InputProps={{
                style: { color: '#fff' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      sx={{ color: '#aaa' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack spacing={2} mt={3}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                登入
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none' }}
              >
                註冊新帳號
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
