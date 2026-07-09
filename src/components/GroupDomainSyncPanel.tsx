import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { red, green } from '@mui/material/colors';
import { GroupHostsResponse, DomainVersionComparison } from '../libs/interfaces';

interface DomainRow {
  domain: string;
  versions: Map<string, string>;
  isSynced: boolean;
}

export default function GroupDomainSyncPanel() {
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [hosts, setHosts] = useState<any[]>([]);
  const [domainComparisons, setDomainComparisons] = useState<Map<string, DomainVersionComparison>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get('/api/groups');
        setGroups(data);
        if (data.length > 0) {
          setSelectedGroup(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch groups');
        console.error(err);
      }
    };
    fetchGroups();
  }, []);

  // Fetch group data when selected group changes
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/groups/${selectedGroup}`);
        setHosts(data.hosts || []);

        // Fetch domain comparisons for all domains
        const comparisonsMap = new Map<string, DomainVersionComparison>();
        if (data.hosts && data.hosts.length > 0) {
          // Extract unique domains from all hosts, skip "default" (never has a version)
          const uniqueDomains = new Set<string>();
          data.hosts.forEach((host: any) => {
            host.Domains?.forEach((d: any) => {
              if (d.domain !== 'default') {
                uniqueDomains.add(d.domain);
              }
            });
          });

          // Fetch comparison for each domain
          for (const domain of uniqueDomains) {
            try {
              const { data: comparison } = await axios.get(
                `/api/groups/${selectedGroup}/domains/${domain}`
              );
              comparisonsMap.set(domain, comparison);
            } catch (err) {
              console.error(`Failed to fetch comparison for domain ${domain}:`, err);
            }
          }
        }
        setDomainComparisons(comparisonsMap);
      } catch (err) {
        setError('Failed to fetch group data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [selectedGroup]);

  if (loading) {
    return <CircularProgress />;
  }

  const syncIcon = (isSynced: boolean) => {
    return isSynced ? (
      <Tooltip title="Synced">
        <CheckCircleIcon sx={{ color: green[500] }} />
      </Tooltip>
    ) : (
      <Tooltip title="Out of sync">
        <ErrorIcon sx={{ color: red[500] }} />
      </Tooltip>
    );
  };

  const versionCell = (entry: any) => {
    if (entry?.version === null) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title="Version missing">
            <WarningIcon sx={{ color: 'orange', fontSize: '1.2rem' }} />
          </Tooltip>
          <span>-</span>
        </Box>
      );
    }

    if (entry?.status === 'different') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title="Version mismatch">
            <ErrorIcon sx={{ color: red[500], fontSize: '1.2rem' }} />
          </Tooltip>
          <span>{entry.version}</span>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Tooltip title="Version matches">
          <CheckCircleIcon sx={{ color: green[500], fontSize: '1.2rem' }} />
        </Tooltip>
        <span>{entry.version}</span>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>Group</InputLabel>
        <Select
          value={selectedGroup}
          label="Group"
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.map((group) => (
            <MenuItem key={group} value={group}>
              {group}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedGroup && hosts.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{border: '1px solid #000000', borderCollapse: 'collapse', width: '100%'}} aria-label="group domain sync table">
            <TableHead sx={{backgroundColor: '#a8ccee'}}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Domain</TableCell>
                {hosts.map((host) => (
                  <TableCell key={host.hostName} align="center" sx={{ fontWeight: 'bold' }}>
                    {host.hostName}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Sync Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(domainComparisons.values()).map((comparison) => (
                <TableRow key={comparison.domain}
                  sx={{ '&:nth-of-type(even)': { backgroundColor: '#f2f2f8'},
                    '&:hover': { backgroundColor: '#dfdff1' },
                  }}
                >
                  <TableCell sx={{ fontWeight: '500' }}>{comparison.domain}</TableCell>
                  {hosts.map((host) => {
                    const entry = comparison.hosts.find(
                      (c) => c.host === host.hostName
                    );
                    return (
                      <TableCell key={`${comparison.domain}-${host.hostName}`} align="center">
                        {versionCell(entry)}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">{syncIcon(comparison.isSynced)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
