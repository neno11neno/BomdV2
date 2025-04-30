import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';
import EditNotePage from './pages/EditNotePage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import LinkPage from './pages/LinkPage';
import ChatPage from './pages/ChatPage';
import Header from './components/Header';

// 黑色主題
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function Layout({ children }) {
  return (
    <>
      <Header />
      <Box sx={{ padding: 2 }}>{children}</Box>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* 套用 MUI 主題背景色 */}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Layout>
                  <NotesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditNotePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="link"
            element={
              <ProtectedRoute>
                <Layout>
                  <LinkPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChatPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
