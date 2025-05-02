import React, { useState, useEffect, useRef } from 'react';
import {
  Container, TextField, Button, Typography, Box, ToggleButton,
  ToggleButtonGroup, Stack, Autocomplete, Chip, Tooltip, IconButton, Switch
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
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
import { EditorView } from '@codemirror/view';


const EditNotePage = () => {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [mode, setMode] = useState('split');
  const editorRef = useRef(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const uploadedImages = useRef(new Map());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('請先登入');
      navigate('/login');
      return;
    }

    const savedDraft = localStorage.getItem(`draft_${id || 'new'}`);
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      setTitle(draftData.title || '');
      setContent(draftData.content || '');
      setTags(draftData.tags || []);
      setIsPrivate(note.isPrivate || false);
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
        console.error(err);
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
    const view = editorRef.current?.view;
    if (!view) return;

    const state = view.state;
    const { from, to } = state.selection.main;
    const selected = state.doc.sliceString(from, to);
    let insertText = wrapper && selected ? template.replace(/\$text/g, selected) : template.replace(/\$text/g, '');

    view.dispatch({
      changes: { from, to, insert: insertText },
      selection: { anchor: from + insertText.length },
    });
    view.focus();
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
    if (uploadedImages.current.has(hash)) return uploadedImages.current.get(hash);

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
    uploadedImages.current.set(hash, imageUrl);
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
          console.error(err);
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

    const data = { title, content, tags, isPrivate };
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
        <Typography variant="h5" color="white">{isNew ? '新增筆記' : '編輯筆記'}</Typography>
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
          <Button variant="contained" color="success" onClick={handleSave}>💾 儲存</Button>
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
        onChange={(e, value) => setTags(value.map(tag => tag.trim()).filter(Boolean))}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip key={index} label={option} {...getTagProps({ index })} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="標籤"
            variant="outlined"
            placeholder="輸入標籤後按 Enter"
            sx={{ mb: 2 }}
            InputProps={{ ...params.InputProps, style: { color: '#fff' } }}
            InputLabelProps={{ style: { color: '#ccc' } }}
          />
        )}
      />

      <Box sx={{ mb: 2 }}>
        <Typography color="gray" gutterBottom>
          設為私人
        </Typography>
        <Switch
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          color="primary"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography color="gray" gutterBottom>
          上傳圖片（會自動插入到內容）
        </Typography>
        <input type="file" accept="image/*" onChange={handleUploadImage} />
      </Box>

      <Box sx={{
        display: 'flex', flexDirection: mode === 'split' ? 'row' : 'column', gap: 2, whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {(mode === 'edit' || mode === 'split') && (
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title="粗體"><IconButton onClick={() => insertAtCursor('**$text**', true)}><FormatBoldIcon /></IconButton></Tooltip>
              <Tooltip title="斜體"><IconButton onClick={() => insertAtCursor('_$text_', true)}><FormatItalicIcon /></IconButton></Tooltip>
              <Tooltip title="連結"><IconButton onClick={() => insertAtCursor('[連結文字](https://)', true)}><InsertLinkIcon /></IconButton></Tooltip>
              <Tooltip title="圖片"><IconButton onClick={() => insertAtCursor('![]()', false)}><ImageIcon /></IconButton></Tooltip>
              <Tooltip title="清單"><IconButton onClick={() => insertAtCursor('- ', false)}><FormatListBulletedIcon /></IconButton></Tooltip>
              <Tooltip title="程式碼區塊"><IconButton onClick={() => insertAtCursor('```js\n$text\n```', true)}><CodeIcon /></IconButton></Tooltip>
              <Tooltip title="引用"><IconButton onClick={() => insertAtCursor('> $text', true)}><FormatQuoteIcon /></IconButton></Tooltip>
              <Tooltip title="分隔線"><IconButton onClick={() => insertAtCursor('---', false)}><HorizontalRuleIcon /></IconButton></Tooltip>
              <Tooltip title="表格"><IconButton onClick={() => insertAtCursor('| Header 1 | Header 2 |\n| -------- | -------- |\n| Data 1 | Data 2 |')}><TableChartIcon /></IconButton></Tooltip>
              <Tooltip title="插入日期"><IconButton onClick={() => insertAtCursor(new Date().toLocaleDateString())}><EventIcon /></IconButton></Tooltip>
            </Box>

            <CodeMirror
              ref={editorRef}
              value={content}
              height="100%"
              theme={oneDark}
              extensions={[markdown(), EditorView.lineWrapping,]}
              onChange={(value) => setContent(value)}
              onDrop={handleDrop}
              onPaste={handlePasteImage}
              style={{
                width: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            />
          </Box>
        )}

        {(mode === 'preview' || mode === 'split') && (
          <Box sx={{ flex: 1, backgroundColor: '#1e1e1e', padding: 2, borderRadius: 2, color: 'white' }}>
            <Typography variant="subtitle1" color="gray" gutterBottom>
              預覽
            </Typography>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {content}
            </ReactMarkdown>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default EditNotePage;
