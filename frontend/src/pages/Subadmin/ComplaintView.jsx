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
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Assignment,
  PriorityHigh,
  Schedule,
  Comment,
  Search,
  CheckCircle,
  FilterList
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
      const response = await subadminTasks.updateComplaint(complaint.complaint_id, {
        status: 'Complete'
      });
      
      if (response.data.success) {
        await fetchComplaints();
      } else {
        throw new Error(response.data.error || 'Failed to complete complaint');
      }
    } catch (err) {
      console.error('Error completing complaint:', err);
      setError(err.response?.data?.error || err.message || 'Failed to complete complaint. Please try again.');
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default', borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Department Complaints
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { sm: '400px' } }}>
            <TextField
              placeholder="Search complaints..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper', borderRadius: 1 }}>
              <InputLabel>
                <Box display="flex" alignItems="center" gap={1}>
                  <FilterList fontSize="small" />
                  Status
                </Box>
              </InputLabel>
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
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={fetchComplaints}>
              Retry
            </Button>
          }
          sx={{ mb: 4 }}
        >
          {error}
        </Alert>
      )}

      {filteredComplaints.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">
            No complaints found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {filteredComplaints.map((complaint) => (
            <Grid item xs={12} sm={6} md={4} key={complaint.complaint_id} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent sx={{ 
                  flex: 1, 
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Header */}
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                    <Box display="flex" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                          {complaint.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {complaint.User.name} • #{complaint.complaint_id}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={formatStatus(complaint.status)}
                      color={getStatusColor(complaint.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Description (truncated) */}
                  <Typography color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: 48 }}>
                    {complaint.description}
                  </Typography>

                  {/* Metadata */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        icon={<PriorityHigh fontSize="small" />}
                        label={`${complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1)} Priority`}
                        size="small"
                        color={getSeverityColor(complaint.severity)}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5 
                      }}>
                        <Schedule fontSize="small" />
                        {new Date(complaint.created_at).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* View Details Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: 'flex-end', mb: 1 }}
                    onClick={() => {
                      // Open a dialog or navigate to a details page
                      navigate(`/subadmin/complaints/${complaint.complaint_id}`);
                    }}
                  >
                    View Details
                  </Button>

                  {/* Response Section */}
                  <Box sx={{ 
                    mt: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    {complaint.SubadminTasks && complaint.SubadminTasks[0] ? (
                      <Paper variant="outlined" sx={{ 
                        p: 2, 
                        bgcolor: 'grey.50', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="subtitle2" color="text.primary" gutterBottom>
                          Your Response:
                        </Typography>
                        <Typography variant="body2">
                          {complaint.SubadminTasks[0].description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                          Responded on: {new Date(complaint.SubadminTasks[0].created_at).toLocaleString()}
                        </Typography>
                      </Paper>
                    ) : (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => navigate('/subadmin/task/create', { 
                            state: { complaint } 
                          })}
                          disabled={complaint.status === 'Complete'}
                        >
                          Respond
                        </Button>
                      </Box>
                    )}

                    {complaint.status === 'InProgress' && (
                      <Button
                        variant="outlined"
                        color="success"
                        fullWidth
                        onClick={() => handleCompleteComplaint(complaint)}
                        startIcon={<CheckCircle />}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ComplaintView;
