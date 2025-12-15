import { useMemo } from 'react';
import {
  Container,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { usePolicyVersions } from '@/hooks/data/usePolicyVersions';
import { usePolicyNavigation } from '@/hooks/domain/usePolicyNavigation';
import { ROUTES, MESSAGES } from '@/lib/constants';
import { Breadcrumb } from '@/components/nav/Breadcrumb';
import { PolicyHeader } from '@/components/policies/PolicyHeader';
import { VersionSelector } from '@/components/policies/VersionSelector';
import { DocsTabView } from '@/components/policies/DocsTabView';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';

export function PolicyDetailPage() {
  const { name } = useParams<{ name: string }>();

  if (!name) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorDisplay
          error="Policy name is required."
          title="Invalid Policy"
          variant="standard"
          severity="error"
        />
      </Container>
    );
  }

  // Use shared hooks for versions and navigation
  const { versions, latestVersion, versionsLoading, versionsError } = usePolicyVersions(name);
  const { handleVersionChange } = usePolicyNavigation(name, latestVersion);

  // Get latest version detail
  const latestVersionDetail = useMemo(
    () => versions.find((v) => v.isLatest) || versions[0],
    [versions]
  );
  
  const isLoading = versionsLoading;
  const hasError = versionsError;

  if (hasError && !isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorDisplay
          error={versionsError || 'An error occurred while loading the policy.'}
          title={MESSAGES.POLICY_NOT_FOUND}
          variant="standard"
          severity="error"
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      {!isLoading && latestVersionDetail && (
        <Breadcrumb
          items={[
            { label: 'Home', path: ROUTES.HOME },
            { label: 'Policies', path: ROUTES.POLICIES },
            { label: latestVersionDetail.displayName, current: true },
          ]}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <LoadingSkeleton variant="detail" />
      )}

      {/* Policy Content */}
      {!isLoading && latestVersionDetail && (
        <>
          {/* Policy Header */}
          <PolicyHeader
            summary={latestVersionDetail}
            versionDetail={latestVersionDetail}
          />

          {/* Version Selector */}
          {versions.length > 0 && latestVersion && (
            <VersionSelector
              policyName={name}
              versions={versions}
              currentVersion={latestVersion}
              latestVersion={latestVersion}
              onChange={handleVersionChange}
              isLoading={versionsLoading}
            />
          )}

          {/* Documentation */}
          {latestVersion && (
            <DocsTabView
              policyName={name}
              version={latestVersion}
              initialPage="overview"
            />
          )}
        </>
      )}
    </Container>
  );
}
