
import { useMemo } from 'react';
import {
  Container,
  Alert,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAsyncData } from '@/hooks/data/useAsyncData';
import { apiClient } from '@/lib/apiClient';
import { usePolicyVersions } from '@/hooks/data/usePolicyVersions';
import { usePolicyNavigation } from '@/hooks/domain/usePolicyNavigation';
import { routes } from '@/lib/utils';
import { ROUTES, MESSAGES } from '@/lib/constants';
import { Breadcrumb } from '@/components/nav/Breadcrumb';
import { PolicyHeader } from '@/components/policies/PolicyHeader';
import { VersionSelector } from '@/components/policies/VersionSelector';
import { DocsTabView } from '@/components/policies/DocsTabView';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';

export function PolicyVersionPage() {
  const { name, version } = useParams<{ name: string; version: string }>();

  if (!name || !version) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorDisplay
          error="Both policy name and version are required."
          title="Invalid Policy Version"
          variant="standard"
          severity="error"
        />
      </Container>
    );
  }

  // Use shared hooks for versions and navigation
  const { versions, latestVersion, versionsLoading, versionsError } = usePolicyVersions(name);
  const { handleVersionChange } = usePolicyNavigation(name, latestVersion);

  // Fetch specific version details
  const {
    data: versionResponse,
    loading: versionLoading,
    error: versionError,
  } = useAsyncData(
    () => apiClient.getPolicyVersionDetail(name, version),
    [name, version],
    { immediate: true, cacheKey: `version-detail-${name}-${version}` }
  );

  // Get version detail
  const versionDetail = useMemo(
    () => (versionResponse?.success ? versionResponse.data : null),
    [versionResponse]
  );

  const isLoading = versionsLoading || versionLoading;
  const hasError = versionsError || versionError;

  if (hasError && !isLoading) {
    const isVersionNotFound = versionError && !versionsError;
    
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">
            {isVersionNotFound ? MESSAGES.VERSION_NOT_FOUND : MESSAGES.POLICY_NOT_FOUND}
          </Typography>
          <Typography>
            {versionError?.message || versionsError?.message || 
             'An error occurred while loading the policy version.'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      {!isLoading && versionDetail && (
        <Breadcrumb
          items={[
            { label: 'Home', path: ROUTES.HOME },
            { label: 'Policies', path: ROUTES.POLICIES },
            { 
              label: versionDetail.displayName, 
              path: routes.policyDetail(name) 
            },
            { label: `Version ${version}`, current: true },
          ]}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <LoadingSkeleton variant="detail" />
      )}

      {/* Policy Content */}
      {!isLoading && versionDetail && (
        <>
          {/* Policy Header */}
          <PolicyHeader
            summary={versionDetail}
            versionDetail={versionDetail}
          />

          {/* Version Selector */}
          {versions.length > 0 && (
            <VersionSelector
              policyName={name}
              versions={versions}
              currentVersion={version}
              latestVersion={latestVersion}
              onChange={handleVersionChange}
              isLoading={versionsLoading}
            />
          )}

          {/* Documentation */}
          <DocsTabView
            policyName={name}
            version={version}
            initialPage="overview"
          />
        </>
      )}
    </Container>
  );
}
