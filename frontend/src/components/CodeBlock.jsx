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
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('複製失敗', err);
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
