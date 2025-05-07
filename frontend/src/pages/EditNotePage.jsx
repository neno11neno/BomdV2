// 📦 React 與基本函式庫
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 路由參數與導頁
import axios from 'axios';                                 // HTTP 請求工具
import { sha256 } from 'js-sha256';                        // SHA-256 加密

// 🧱 MUI 元件庫：常用 UI 元件
import {
  Container, TextField, Button, Typography, Box,
  ToggleButton, ToggleButtonGroup, Stack, Autocomplete,
  Chip, Tooltip, IconButton
} from '@mui/material';

// 🧾 Markdown 解析與支援套件
import ReactMarkdown from 'react-markdown';   // 渲染 Markdown
import remarkGfm from 'remark-gfm';           // 支援 GFM 語法
import rehypeRaw from 'rehype-raw';           // 支援 raw HTML
import remarkBreaks from 'remark-breaks';     // 換行支援

// ✏️ CodeMirror 編輯器與主題
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

// 🛠️ Markdown 工具列圖示
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
import CopyAllIcon from '@mui/icons-material/CopyAll';

// ⚙️ 快速操作選單（SpeedDial）
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MarkdownIcon from '@mui/icons-material/Note';

// 📄 HTML 匯出為圖片/PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 📦 自訂套件
import CodeBlock from '../components/CodeBlock'; 



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
  const uploadedImages = useRef(new Map());
  const previewRef = useRef(null);

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

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title || 'note'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!previewRef.current) return;

    const canvas = await html2canvas(previewRef.current, {
      scale: 2, // 提高清晰度
      backgroundColor: '#1e1e1e', // 預覽背景
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${title || 'note'}.pdf`);
  };


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
          上傳圖片（會自動插入到內容）
        </Typography>
        <input type="file" accept="image/*" onChange={handleUploadImage} />
      </Box>

      <Box sx={{
        display: 'flex', flexDirection: mode === 'split' ? 'row' : 'column'
      }}>
        {(mode === 'edit' || mode === 'split') && (
          <Box sx={{ flex: 1, maxWidth: '100%' }}>
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
              minHeight="700px"
              theme={oneDark}
              extensions={[markdown(), EditorView.lineWrapping,]}
              onChange={(value) => setContent(value)}
              onDrop={handleDrop}
              onPaste={handlePasteImage}
              style={{
                width: '100%',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            />
          </Box>
        )}

        {(mode === 'preview' || mode === 'split') && (
          <Box sx={{
            flex: 1, backgroundColor: '#1e1e1e', padding: 2, borderRadius: 2, color: 'white', overflowWrap: 'break-word',
          }}>
            <Typography variant="subtitle1" color="gray" gutterBottom>
              預覽
            </Typography>
            <div ref={previewRef}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  img: ({ ...props }) => (
                    <img
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '4px',
                        transition: 'transform 0.3s ease',
                        cursor: 'zoom-in',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.5)';
                        e.currentTarget.style.zIndex = '10';
                        e.currentTarget.style.position = 'relative';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '0';
                      }}
                      {...props}
                    />
                  ),
                  code: CodeBlock,
                }}
              >
                {content}
              </ReactMarkdown>

            </div>
          </Box>
        )}
      </Box>
      <SpeedDial
        ariaLabel="下載選項"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<SpeedDialIcon icon={<FileDownloadIcon />} />}
      >
        <SpeedDialAction
          icon={<MarkdownIcon />}
          tooltipTitle="下載 Markdown"
          onClick={downloadMarkdown}
        />
        <SpeedDialAction
          icon={<PictureAsPdfIcon />}
          tooltipTitle="下載 PDF"
          onClick={downloadPdf}
        />
      </SpeedDial>

    </Container>
  );
};

export default EditNotePage;
