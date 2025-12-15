import { Box, IconButton, Snackbar, Alert } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useState, isValidElement } from 'react';
import { copyToClipboard } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  const handleCopy = async (code: string) => {
    const success = await copyToClipboard(code);
    setIsCopySuccess(success);
  };

  return (
    <>
      <Box
        className={className}
        sx={{
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontWeight: 600,
            mt: 3,
            mb: 2,
            '&:first-of-type': {
              mt: 0,
            },
          },
          '& h1': { fontSize: '2rem' },
          '& h2': { fontSize: '1.5rem', borderBottom: 1, borderColor: 'divider', pb: 1 },
          '& h3': { fontSize: '1.25rem' },
          '& h4': { fontSize: '1.125rem' },
          '& p': {
            mb: 2,
            lineHeight: 1.7,
          },
          '& ul, & ol': {
            pl: 3,
            mb: 2,
          },
          '& li': {
            mb: 0.5,
          },
          '& blockquote': {
            borderLeft: 4,
            borderColor: 'primary.main',
            pl: 2,
            ml: 0,
            fontStyle: 'italic',
            bgcolor: 'background.default',
            py: 1,
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            mb: 2,
            '& th, & td': {
              border: 1,
              borderColor: 'divider',
              p: 1,
              textAlign: 'left',
            },
            '& th': {
              bgcolor: 'background.default',
              fontWeight: 600,
            },
          },
          '& code': {
            bgcolor: 'action.hover',
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontSize: '0.875em',
            fontFamily: 'monospace',
          },
          '& pre': {
            position: 'relative',
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            mb: 2,
            '& code': {
              bgcolor: 'transparent',
              p: 0,
              color: 'inherit',
            },
          },
          '& a': {
            color: 'primary.main',
            textDecoration: 'underline',
            '&:hover': {
              textDecoration: 'none',
            },
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
          },
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            pre: ({ children, ...props }) => {
              // Extract code content from children
              let code = '';
              if (isValidElement(children) && children.props) {
                const childProps = children.props as any;
                if (typeof childProps.children === 'string') {
                  code = childProps.children;
                } else if (Array.isArray(childProps.children) && typeof childProps.children[0] === 'string') {
                  code = childProps.children[0];
                }
              }
              
              return (
                <Box component="pre" sx={{ position: 'relative' }} {...(props as any)}>
                  {typeof code === 'string' && (
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(code)}
                      sx={
                        {
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'text.primary',
                            bgcolor: 'action.hover',
                          },
                        }
                      }
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  )}
                  {children}
                </Box>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </Box>
      
      <Snackbar
        open={isCopySuccess}
        autoHideDuration={2000}
        onClose={() => setIsCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setIsCopySuccess(false)}>
          Code copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
