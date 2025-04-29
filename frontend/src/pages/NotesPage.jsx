import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Stack,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [viewMode, setViewMode] = useState('card');
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchNotes = async () => {
    try {
      const res = await axios.get('/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
      setFilteredNotes(res.data);
    } catch (err) {
      console.error('❌ 載入筆記失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tagsSet = new Set();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagsSet.add(tag));
    });
    setAllTags([...tagsSet]);
  }, [notes]);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    let results = [...notes];
    if (searchText) {
      results = results.filter(note =>
        note.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedTag) {
      results = results.filter(note => note.tags?.includes(selectedTag));
    }

    results.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    setFilteredNotes(results);
  }, [searchText, sortOrder, selectedTag, notes]);

  const handleNewNote = () => navigate('/notes/new');
  const handleOpenNote = (id) => navigate(`/notes/${id}`);

  const handleDeleteNote = async () => {
    try {
      await axios.delete(`/api/notes/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(prev => prev.filter((n) => n.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('❌ 刪除筆記失敗:', err);
    }
  };

  const extractFirstImage = (markdown) => {
    const match = markdown.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : null;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 6 }}>
      <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
        <Typography variant="h4" fontWeight="bold">我們的筆記(重要內容❤️請自行備份)</Typography>
        <Button variant="contained" onClick={handleNewNote}>➕ 新增筆記</Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="搜尋標題或內容"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <TextField
          select
          label="排序"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          sx={{ width: 160 }}
        >
          <MenuItem value="newest">最新筆記</MenuItem>
          <MenuItem value="oldest">最舊筆記</MenuItem>
        </TextField>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, value) => value && setViewMode(value)}
          sx={{ ml: 'auto' }}
        >
          <ToggleButton value="card">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          select
          label="依標籤篩選"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          sx={{ width: 160 }}
        >
          <MenuItem value="">全部</MenuItem>
          {allTags.map((tag) => (
            <MenuItem key={tag} value={tag}>{tag}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Typography>載入中...</Typography>
      ) : filteredNotes.length === 0 ? (
        <Typography color="text-warning" align="center">查無符合的筆記</Typography>
      ) : viewMode === 'card' ? (
        <Grid container spacing={3}>
          {filteredNotes.map((note) => {
            const imageUrl = extractFirstImage(note.content);
            return (
              <Grid key={note.id} item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    position: 'relative',
                    height: 360,
                    width: 320,
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >

                  {imageUrl ? (
                    <CardMedia component="img" height="140" image={imageUrl} alt="Note preview" />
                  ) : (
                    <Box height="140px" sx={{ bgcolor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ color: '#000000'}}>無預覽圖片</Typography>
                    </Box>
                  )}

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(note.id);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 10,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  <CardContent
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleOpenNote(note.id)}
                  >
                    <Typography variant="h6" noWrap gutterBottom>{note.title || '（未命名筆記）'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      👤 {note.User?.email || '未知'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      🕒 {new Date(note.createdAt).toLocaleString()}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                      }}
                    >
                      {note.content.replace(/!\[.*?\]\(.*?\)/g, '')}
                    </Typography>

                    {note.tags?.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {note.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" color="primary" />
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <List>
          {filteredNotes.map((note) => (
            <ListItem
              key={note.id}
              sx={{ borderBottom: '1px solid #ddd', cursor: 'pointer' }}
              onClick={() => handleOpenNote(note.id)}
              secondaryAction={
                <IconButton edge="end" onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(note.id);
                }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar>{note.title?.charAt(0).toUpperCase() || '?'}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={note.title || '（未命名筆記）'}
                secondary={
                  <>
                    👤 {note.User?.email || '未知'}｜🕒 {new Date(note.createdAt).toLocaleString()}
                    <br />
                    {note.content.replace(/!\[.*?\]\(.*?\)/g, '').slice(0, 100)}...
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <DialogContentText>你確定要刪除這筆筆記嗎？刪除後無法復原。</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>取消</Button>
          <Button color="error" onClick={handleDeleteNote}>刪除</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotesPage;
