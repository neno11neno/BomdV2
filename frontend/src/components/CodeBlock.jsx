import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import CopyAllIcon from '@mui/icons-material/CopyAll';

const CodeBlock = ({ inline, className, children, ...props }) => {
    const [copied, setCopied] = useState(false);

    const code = React.Children.toArray(children)
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('')
        .trim();

    const handleCopy = async () => {
        try {
            // 優先使用 Clipboard API（通常需 HTTPS）
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
                return;
            }

            // Fallback：使用隱藏 textarea + execCommand('copy')，在 HTTP 下可用
            const textarea = document.createElement('textarea');
            textarea.value = code;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);

            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);

            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            } else {
                throw new Error('execCommand copy failed');
            }
        } catch (err) {
            console.error('複製失敗', err);
            alert('複製失敗，請手動選取');
        }
    };

    if (inline) {
        return (
            <code style={{
                background: '#333',
                padding: '2px 6px',
                borderRadius: 4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}>
                {code}
            </code>
        );
    }

    return (
        <Box
            sx={{
                position: 'relative',
                backgroundColor: '#2d2d2d',
                borderRadius: 1,
                padding: 2,
                mb: 2,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: '#fff',
                overflowX: 'visible',
            }}
        >
            <Tooltip title={copied ? '已複製' : '複製'}>
                <IconButton
                    onClick={handleCopy}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#ccc',
                        '&:hover': { color: 'white' },
                    }}
                >
                    <CopyAllIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <pre style={{
                margin: 0,
                minHeight: '1.5em',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowX: 'visible',
            }}>
                <code className={className} {...props}>{code}</code>
            </pre>
        </Box>
    );
};

export default CodeBlock;