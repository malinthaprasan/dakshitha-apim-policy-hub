import {
  Box,
  Container,
  Typography,
  Paper,
  Link,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { ROUTES } from '@/lib/constants';
import { Breadcrumb } from '@/components/nav/Breadcrumb';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export function CustomPolicyGuidePage() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let ongoingRequest: Promise<void> | null = null;

    const loadContent = async () => {
      // Prevent duplicate requests
      if (ongoingRequest) {
        return ongoingRequest;
      }

      ongoingRequest = (async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/src/content/custom-policy-guide.md');
          if (!response.ok) {
            throw new Error('Failed to load guide content');
          }
          const text = await response.text();
          if (!cancelled) {
            setContent(text);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Failed to load content');
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
          ongoingRequest = null;
        }
      })();

      return ongoingRequest;
    };

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', path: ROUTES.HOME },
          { label: 'Custom Policy Guide', current: true },
        ]}
      />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 600, mb: 2 }}
        >
          Custom Policy Development Guide
        </Typography>
        
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Learn how to create, package, and publish custom policies for the WSO2 API Platform
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            This guide provides comprehensive instructions for developing custom policies. 
            For questions or support, visit our{' '}
            <Link
              href="https://stackoverflow.com/questions/tagged/wso2"
              target="_blank"
              rel="noopener noreferrer"
            >
              community forums
            </Link>
            {' '}or check the{' '}
            <Link
              href="https://docs.wso2.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              official documentation
            </Link>
            .
          </Typography>
        </Alert>
      </Box>

      {/* Content */}
      <Paper
        variant="outlined"
        sx={{
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 4 }}>
          {isLoading && (
            <LoadingSkeleton variant="detail" count={10} />
          )}
          
          {error && (
            <Alert severity="error">
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          )}
          
          {!isLoading && !error && content && (
            <MarkdownRenderer content={content} />
          )}
        </Box>
      </Paper>
    </Container>
  );
}
