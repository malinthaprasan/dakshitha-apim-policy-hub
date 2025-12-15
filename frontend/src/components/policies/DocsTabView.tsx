import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Alert,
  Typography,
} from '@mui/material';
import { DocsPageName, DocsSingleResponse } from '@/lib/types';
import { DOC_PAGES, DOC_PAGE_LABELS, MESSAGES } from '@/lib/constants';
import { apiClient } from '@/lib/apiClient';
import { Tabs } from '@/components/nav/Tabs';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useAsyncData } from '@/hooks/data/useAsyncData';

interface DocsTabViewProps {
  policyName: string;
  version: string;
  initialPage?: DocsPageName;
}

export function DocsTabView({
  policyName,
  version,
  initialPage = 'overview',
}: DocsTabViewProps) {
  const [currentPage, setCurrentPage] = useState<DocsPageName>(initialPage);
  const [docsData, setDocsData] = useState<Record<DocsPageName, DocsSingleResponse | null>>({} as Record<DocsPageName, DocsSingleResponse | null>);

  // Data fetching
  const {
    data: allDocs,
    loading: allDocsLoading,
    error: allDocsError,
  } = useAsyncData(
    () => apiClient.getAllDocs(policyName, version),
    [policyName, version],
    { immediate: true, cacheKey: `docs-${policyName}-${version}` }
  );

  // Effects
  useEffect(() => {
    if (allDocs?.success && allDocs.data) {
      const docsMap: Record<DocsPageName, DocsSingleResponse | null> = {
        overview: null,
        configuration: null,
        examples: null,
        faq: null,
      };

      allDocs.data.forEach((doc) => {
        if (doc.page in docsMap) {
          docsMap[doc.page] = doc;
        }
      });

      setDocsData(docsMap);
    }
  }, [allDocs]);

  // Event handlers
  const handlePageChange = useCallback((page: string) => {
    const newPage = page as DocsPageName;
    setCurrentPage(newPage);
  }, []);

  // Derived state
  const tabs = useMemo(() => {
    return Object.values(DOC_PAGES).map((page) => {
      const docPage = page as DocsPageName;
      const hasDoc = docsData[docPage] !== null;

      return {
        label: DOC_PAGE_LABELS[docPage],
        value: docPage,
        disabled: !hasDoc && !allDocsLoading,
      };
    });
  }, [docsData, allDocsLoading]);

  const currentDoc = useMemo(() => docsData[currentPage], [docsData, currentPage]);
  const isCurrentLoading = allDocsLoading;
  const currentError = allDocsError;

  return (
    <Box>
      <Tabs
        value={currentPage}
        onChange={handlePageChange}
        items={tabs}
        variant="scrollable"
      />
      
      <Paper
        variant="outlined"
        sx={{
          minHeight: 400,
          p: 0,
          overflow: 'hidden',
        }}
      >
        {isCurrentLoading && (
          <Box sx={{ p: 4 }}>
            <LoadingSkeleton variant="text" count={8} />
          </Box>
        )}
        
        {currentError && (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">
              <Typography variant="h6" gutterBottom>
                {MESSAGES.ERROR_LOADING_DOCS}
              </Typography>
              <Typography variant="body2">
                {currentError.message || 'An unexpected error occurred while loading the documentation.'}
              </Typography>
            </Alert>
          </Box>
        )}
        
        {!isCurrentLoading && !currentError && !currentDoc && (
          <Box sx={{ p: 4 }}>
            <Alert severity="info">
              <Typography variant="h6" gutterBottom>
                {MESSAGES.DOCS_NOT_AVAILABLE}
              </Typography>
              <Typography variant="body2">
                The {DOC_PAGE_LABELS[currentPage].toLowerCase()} documentation is not available for this version.
              </Typography>
            </Alert>
          </Box>
        )}
        
        {!isCurrentLoading && !currentError && currentDoc && (
          <Box sx={{ p: 4 }}>
            <MarkdownRenderer content={currentDoc.content} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
