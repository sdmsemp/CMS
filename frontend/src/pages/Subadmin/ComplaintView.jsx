import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assignment,
  PriorityHigh,
  Schedule,
  Comment,
  Search,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { subadminTasks } from '../../services/api';

const ComplaintView = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await subadminTasks.getComplaints();
      if (response.data.success) {
        setComplaints(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch complaints');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.response?.data?.error || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleCompleteComplaint = async (complaint) => {
    if (!window.confirm('Are you sure you want to mark this complaint as complete?')) {
      return;
    }

    try {
      setLoading(true);
      // Get the task from the SubadminTasks array
      const task = complaint.SubadminTasks && complaint.SubadminTasks[0];
      
      if (!task) {
        throw new Error('Please create a task first before marking the complaint as complete');
      }

      const response = await subadminTasks.completeTask(task.task_id);
      if (response.data.success) {
        await fetchComplaints();
      } else {
        throw new Error(response.data.error || 'Failed to complete task');
      }
    } catch (err) {
      console.error('Error completing task:', err);
      setError(err.response?.data?.error || err.message || 'Failed to complete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'inprogress': return 'info';
      case 'complete':
      case 'completed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pending';
      case 'inprogress': return 'In Progress';
      case 'complete':
      case 'completed': return 'Complete';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || complaint.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Department Complaints</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search complaints..."
              size="small"
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
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filter}
                label="Status"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Complaints</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="inprogress">In Progress</MenuItem>
                <MenuItem value="complete">Complete</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            action={
              <Button color="inherit" size="small" onClick={fetchComplaints}>
                Retry
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {filteredComplaints.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No complaints found
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredComplaints.map((complaint) => (
              <Grid item xs={12} key={complaint.complaint_id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Assignment />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{complaint.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {complaint.User.name} • Complaint #{complaint.complaint_id}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={formatStatus(complaint.status)}
                        color={getStatusColor(complaint.status)}
                        size="small"
                      />
                    </Box>

                    <Typography color="text.secondary" paragraph>
                      {complaint.description}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={3} mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PriorityHigh fontSize="small" color={getSeverityColor(complaint.severity)} />
                        <Typography variant="body2" color="text.secondary">
                          {complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1)} Priority
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(complaint.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      {complaint.status.toLowerCase() !== 'complete' && 
                       complaint.status.toLowerCase() !== 'completed' && 
                       complaint.status.toLowerCase() !== 'rejected' && (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<CheckCircle />}
                            onClick={() => handleCompleteComplaint(complaint)}
                            disabled={!complaint.SubadminTasks?.length}
                          >
                            Mark Complete
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<Comment />}
                            onClick={() => navigate('/subadmin/task/create', { 
                              state: { complaint } 
                            })}
                          >
                            Respond
                          </Button>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ComplaintView;
