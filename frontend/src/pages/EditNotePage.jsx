import { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Autocomplete,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markdown';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageIcon from '@mui/icons-material/Image';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import EventIcon from '@mui/icons-material/Event';
import TableChartIcon from '@mui/icons-material/TableChart';

const EditNotePage = () => {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [mode, setMode] = useState('split');

  const uploadedImages = new Map();

  // 編輯器高亮
  const highlightMarkdown = (code) => {
    return Prism.highlight(code, Prism.languages.markdown, 'markdown');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入');
      navigate('/login');
      return;
    }

    // 載入草稿
    const savedDraft = localStorage.getItem(`draft_${id || 'new'}`);
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      setTitle(draftData.title || '');
      setContent(draftData.content || '');
      setTags(draftData.tags || []);
    }

    const fetchNoteAndTags = async () => {
      try {
        if (!isNew && id) {
          const noteRes = await axios.get(`/api/notes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const note = noteRes.data;
          setTitle(note.title || '');
          setContent(note.content || '');
          setTags(note.tags || []);
        }

        const tagRes = await axios.get('/api/tags', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cleanTags = tagRes.data
          .map((t) => (typeof t.name === 'string' ? t.name.trim() : ''))
          .filter((name) => name !== '');
        setAllTags(cleanTags);
      } catch (err) {
        alert('載入資料失敗');
        console.error('❌ 載入失敗:', err);
        navigate('/notes');
      }
    };

    fetchNoteAndTags();
  }, [id, isNew, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = {
        title,
        content,
        tags,
      };
      localStorage.setItem(`draft_${id || 'new'}`, JSON.stringify(draft));
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content, tags, id]);

  const insertAtCursor = (template, wrapper = false) => {
    const textarea = document.getElementById('codeArea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    let insertText = '';
    if (wrapper && selected) {
      insertText = template.replace(/\$text/g, selected);
    } else {
      insertText = template.replace(/\$text/g, '');
    }

    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = before + insertText + after;

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + insertText.length;
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
    }, 0);
  };

  const calculateFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    if (crypto?.subtle?.digest) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      return sha256(buffer);
    }
  };

  const uploadImageIfNeeded = async (file) => {
    const hash = await calculateFileHash(file);
    if (uploadedImages.has(hash)) {
      return uploadedImages.get(hash);
    }

    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('token');

    const res = await axios.post('/api/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const imageUrl = res.data.url;
    uploadedImages.set(hash, imageUrl);
    return imageUrl;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const imageUrl = await uploadImageIfNeeded(file);
      insertAtCursor(`\n\n![](${imageUrl})\n\n`);
    } catch (err) {
      alert('圖片上傳失敗');
      console.error(err);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handlePasteImage = async (e) => {
    const items = e.clipboardData.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (!file) continue;

        try {
          const imageUrl = await uploadImageIfNeeded(file);
          insertAtCursor(`\n\n![](${imageUrl})\n\n`);
        } catch (err) {
          alert('圖片貼上失敗');
          console.error('❌ 貼圖錯誤:', err);
        }
      }
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImageIfNeeded(file);
      insertAtCursor(`\n\n![](${imageUrl})\n\n`);
    } catch (err) {
      alert('圖片上傳失敗');
      console.error(err);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const data = { title, content, tags };

    try {
      if (isNew) {
        await axios.post('/api/notes', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.put(`/api/notes/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // 儲存成功後清除草稿
      localStorage.removeItem(`draft_${id || 'new'}`);
      navigate('/notes');
    } catch (err) {
      alert('儲存失敗');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" color="white">
          {isNew ? '新增筆記' : '編輯筆記'}
        </Typography>
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(e, newMode) => newMode && setMode(newMode)}
            size="small"
            color="primary"
          >
            <ToggleButton value="edit">編輯</ToggleButton>
            <ToggleButton value="preview">預覽</ToggleButton>
            <ToggleButton value="split">編輯＋預覽</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" color="success" onClick={handleSave}>
            💾 儲存
          </Button>
        </Stack>
      </Stack>

      <TextField
        label="標題"
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        InputProps={{ style: { color: '#fff' } }}
        InputLabelProps={{ style: { color: '#ccc' } }}
      />

      <Autocomplete
        multiple
        freeSolo
        options={allTags}
        value={tags}
        getOptionLabel={(option) => (typeof option === 'string' ? option : '')}
        onChange={(e, value) => {
          const filtered = value
            .map((tag) => tag.trim())
            .filter((tag) => tag !== '');
          setTags(filtered);
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const chipProps = getTagProps({ index });
            return <Chip key={option || index} label={option} {...chipProps} />;
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="標籤"
            variant="outlined"
            placeholder="輸入標籤後按 Enter"
            InputProps={{
              ...params.InputProps,
              style: { color: '#fff' },
            }}
            InputLabelProps={{ style: { color: '#ccc' } }}
            sx={{ mb: 2 }}
          />
        )}
      />

      <Box sx={{ mb: 2 }}>
        <Typography color="gray" gutterBottom>
          上傳圖片（會自動插入到內容）
        </Typography>
        <input type="file" accept="image/*" onChange={handleUploadImage} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: mode === 'split' ? 'row' : 'column', gap: 2 }}>
        {(mode === 'edit' || mode === 'split') && (
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" color="gray" gutterBottom>
                內容 (Markdown)
              </Typography>
              <div className='icon-block'>
                {/* Icon群 */}
                <Tooltip title="粗體 (Ctrl+B)"><IconButton size="small" onClick={() => insertAtCursor('**$text**', true)} color="primary"><FormatBoldIcon /></IconButton></Tooltip>
                <Tooltip title="斜體 (Ctrl+I)"><IconButton size="small" onClick={() => insertAtCursor('_$text_', true)} color="primary"><FormatItalicIcon /></IconButton></Tooltip>
                <Tooltip title="插入連結"><IconButton size="small" onClick={() => insertAtCursor('[連結文字](https://)', true)} color="primary"><InsertLinkIcon /></IconButton></Tooltip>
                <Tooltip title="插入圖片"><IconButton size="small" onClick={() => insertAtCursor('![]()', false)} color="primary"><ImageIcon /></IconButton></Tooltip>
                <Tooltip title="清單項目"><IconButton size="small" onClick={() => insertAtCursor('- ', false)} color="primary"><FormatListBulletedIcon /></IconButton></Tooltip>
                <Tooltip title="程式碼區塊"><IconButton size="small" onClick={() => insertAtCursor('```js\n$text\n```', true)} color="primary"><CodeIcon /></IconButton></Tooltip>
                <Tooltip title="引用文字"><IconButton size="small" onClick={() => insertAtCursor('> $text', true)} color="primary"><FormatQuoteIcon /></IconButton></Tooltip>
                <Tooltip title="分隔線"><IconButton size="small" onClick={() => insertAtCursor('---', false)} color="primary"><HorizontalRuleIcon /></IconButton></Tooltip>
                <Tooltip title="表格模板"><IconButton size="small" onClick={() => insertAtCursor('| Header 1 | Header 2 |\n| -------- | -------- |\n| Data 1  | Data 2  |')} color="primary"><TableChartIcon /></IconButton></Tooltip>
                <Tooltip title="插入日期"><IconButton size="small" onClick={() => insertAtCursor(new Date().toLocaleDateString())} color="primary"><EventIcon /></IconButton></Tooltip>
              </div>
            </Box>

            {/* 改成 react-simple-code-editor */}
            <Editor
              id="codeArea"
              value={content}
              onValueChange={(code) => setContent(code)}
              highlight={highlightMarkdown}
              padding={16}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onPaste={handlePasteImage}
              style={{
                width: '100%',
                backgroundColor: '#121212',
                border: '1px solid #555',
                borderRadius: '4px',
                fontSize: '1rem',
                color: '#fff',
                fontFamily: 'inherit',
                minHeight: '400px',
                marginBottom: '32px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            />
          </Box>
        )}

        {(mode === 'preview' || mode === 'split') && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" color="gray" gutterBottom>
              預覽
            </Typography>
            <Box
              sx={{
                bgcolor: '#1e1e1e',
                border: '1px solid #444',
                borderRadius: 2,
                padding: 2,
                minHeight: '400px',
                width: '100%',
                marginBottom: '32px',
                color: 'white',
                wordBreak: 'break-word',
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default EditNotePage;
