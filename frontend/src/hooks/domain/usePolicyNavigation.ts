import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/lib/utils';

interface UsePolicyNavigationReturn {
  handleVersionChange: (version: string) => void;
}

/**
 * Hook for handling policy version navigation
 * Extracts shared navigation logic from PolicyDetailPage and PolicyVersionPage
 */
export function usePolicyNavigation(
  policyName: string,
  latestVersion: string | undefined
): UsePolicyNavigationReturn {
  const navigate = useNavigate();

  const handleVersionChange = useCallback(
    (version: string) => {
      if (version === latestVersion) {
        navigate(routes.policyDetail(policyName));
      } else {
        navigate(routes.policyVersion(policyName, version));
      }
    },
    [latestVersion, policyName, navigate]
  );

  return {
    handleVersionChange,
  };
}
