import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Warning,
  Info,
  CheckCircle,
  Error as ErrorIcon,
  MoreVert,
  Download
} from '@mui/icons-material';
import Table from '../../components/Table';
import { admin } from '../../services/api';

const ActivityLogs = () => {
  const [filter, setFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (moduleFilter !== 'all') {
          params.module = moduleFilter;
        }
        console.log('Fetching logs with params:', params);
        const res = await admin.getLogs(params);
        console.log('API Response:', res.data);
        setLogs(res.data.data?.logs || res.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to fetch activity logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [moduleFilter]);

  const columns = [
    {
      field: 'user',
      headerName: 'User',
      flex: 2,
      renderCell: (row) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar>{row.user.name[0]}</Avatar>
          <Box>
            <Typography>{row.user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {row.user.Role?.name || 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 2
    },
    {
      field: 'module',
      headerName: 'Module',
      flex: 1,
      renderCell: (row) => (
        <Chip
          label={row.module || 'N/A'}
          color="primary"
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      renderCell: (row) => (
        <Chip
          icon={
            row.type === 'warning' ? <Warning /> :
            row.type === 'error' ? <ErrorIcon /> :
            row.type === 'success' ? <CheckCircle /> :
            <Info />
          }
          label={row.type}
          color={
            row.type === 'warning' ? 'warning' :
            row.type === 'error' ? 'error' :
            row.type === 'success' ? 'success' :
            'info'
          }
          size="small"
        />
      )
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      flex: 1.5,
      renderCell: (row) => new Date(row.timestamp).toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (row) => (
        <IconButton
          onClick={() => {
            setSelectedLog(row);
            setOpenDialog(true);
          }}
        >
          <MoreVert />
        </IconButton>
      )
    }
  ];

  // Sample data - replace with your actual data
  // const logs = [
  //   {
  //     id: 1,
  //     user: {
  //       name: 'John Doe',
  //       role: 'Admin'
  //     },
  //     action: 'Created new user',
  //     type: 'success',
  //     timestamp: new Date(),
  //     details: 'Created user account for Jane Smith'
  //   },
  //   // Add more logs...
  // ];

  const handleExport = () => {
    // Add export logic
  };

  const handleRefresh = () => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (moduleFilter !== 'all') {
          params.module = moduleFilter;
        }
        console.log('Refreshing logs with params:', params);
        const res = await admin.getLogs(params);
        console.log('Refresh API Response:', res.data);
        setLogs(res.data.data?.logs || res.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error refreshing logs:', err);
        setError('Failed to fetch activity logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Activity Logs</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              onClick={async () => {
                try {
                  const res = await admin.testLogs();
                  console.log('Test logs response:', res.data);
                  alert(`Test successful! Found ${res.data.data.totalLogs} logs`);
                } catch (err) {
                  console.error('Test logs error:', err);
                  alert('Test failed: ' + err.message);
                }
              }}
            >
              Test Logs
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              fullWidth
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filter}
                label="Type"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Activities</MenuItem>
                <MenuItem value="warning">Warnings</MenuItem>
                <MenuItem value="error">Errors</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="info">Information</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Module</InputLabel>
              <Select
                value={moduleFilter}
                label="Module"
                onChange={(e) => setModuleFilter(e.target.value)}
              >
                <MenuItem value="all">All Modules</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Auth">Auth</MenuItem>
                <MenuItem value="Complaint">Complaint</MenuItem>
                <MenuItem value="SubadminTask">Subadmin Task</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={dateRange}
                label="Time Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Table
            columns={columns}
            data={logs}
            title="Activity Logs"
          />
          
          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading activity logs...</Typography>
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && logs.length === 0 && (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography color="text.secondary">
                No activity logs found
              </Typography>
            </Box>
          )}
        </Paper>

        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setSelectedLog(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Log Details</DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Stack spacing={2} sx={{ pt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography>{selectedLog.user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedLog.user.Role?.name || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Action
                  </Typography>
                  <Typography>{selectedLog.action}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Module
                  </Typography>
                  <Chip
                    label={selectedLog.module || 'N/A'}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip
                    icon={
                      selectedLog.type === 'warning' ? <Warning /> :
                      selectedLog.type === 'error' ? <ErrorIcon /> :
                      selectedLog.type === 'success' ? <CheckCircle /> :
                      <Info />
                    }
                    label={selectedLog.type}
                    color={
                      selectedLog.type === 'warning' ? 'warning' :
                      selectedLog.type === 'error' ? 'error' :
                      selectedLog.type === 'success' ? 'success' :
                      'info'
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Timestamp
                  </Typography>
                  <Typography>
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Details
                  </Typography>
                  <Typography>{selectedLog.details}</Typography>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ActivityLogs;
