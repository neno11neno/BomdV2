import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homeback = () => {
    navigate('/notes');
  };

  const bookmark = () => {
    navigate('/link');
  };


  if (!user) return null;

  return (
    <AppBar position="static" color="default" sx={{ bgcolor: '#1e1e1e' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} onClick={homeback}>
          📝 BoboMD
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ color: '#90caf9' }}>
            {user.email}
          </Typography>
          <Button color="Secondary" variant="contained" onClick={homeback}>
            Node
          </Button>
          <Button color="primary" variant="contained" onClick={bookmark}>
            Bookmark
          </Button>
          <Button color="error" variant="contained" onClick={handleLogout}>
            登出
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
