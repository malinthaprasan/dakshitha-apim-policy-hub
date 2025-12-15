import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Policy } from '@/lib/types';
import { formatDate, isLatestVersion, routes } from '@/lib/utils';

interface VersionSelectorProps {
  policyName: string;
  versions: Policy[];
  currentVersion: string;
  latestVersion?: string;
  onChange: (version: string) => void;
  isLoading?: boolean;
}

export function VersionSelector({
  policyName,
  versions,
  currentVersion,
  latestVersion,
  onChange,
  isLoading = false,
}: VersionSelectorProps) {
  const isCurrentLatest = isLatestVersion(currentVersion, latestVersion);
  const showOlderVersionWarning = latestVersion && !isCurrentLatest;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: showOlderVersionWarning ? 2 : 0,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }} disabled={isLoading}>
          <InputLabel>Version</InputLabel>
          <Select
            value={currentVersion}
            label="Version"
            onChange={(e) => onChange(e.target.value as string)}
          >
            {versions.map((version) => (
              <MenuItem key={version.version} value={version.version}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {version.version}
                    {isLatestVersion(version.version, latestVersion) && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          ml: 1,
                          color: 'success.main',
                          fontWeight: 600,
                        }}
                      >
                        (Latest)
                      </Typography>
                    )}
                  </Typography>
                  {version.releaseDate && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {formatDate(version.releaseDate)}
                    </Typography>
                  )}
                  {version.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: 'text.secondary',
                        mt: 0.25,
                      }}
                    >
                      {version.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            {versions.length} version{versions.length !== 1 ? 's' : ''} available
          </Typography>
        </Box>
      </Box>
      
      {showOlderVersionWarning && (
        <Alert
          severity="info"
          sx={{
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          <Typography variant="body2">
            You are viewing an older version of this policy. The latest version is{' '}
            <Link
              component={RouterLink}
              to={routes.policyDetail(policyName)}
              sx={{ fontWeight: 600 }}
            >
              {latestVersion}
            </Link>
            .
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
