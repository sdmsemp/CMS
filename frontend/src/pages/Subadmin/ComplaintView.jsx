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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Stack,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Assignment,
  PriorityHigh,
  Schedule,
  Comment,
  Send,
  AttachFile,
  Close,
  Search,
  FilterList,
  MoreVert,
  Person,
  Error as ErrorIcon,
  Refresh
} from '@mui/icons-material';
import { subadminTasks } from '../../services/api';

const ComplaintView = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSubmitResponse = async () => {
    try {
      if (!selectedComplaint || !response.trim()) return;

      await subadminTasks.addTask({
        complaint_id: selectedComplaint.complaint_id,
        description: response.trim()
      });

      // Refresh complaints after adding response
      await fetchComplaints();
      setResponse('');
      setOpenDialog(false);
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err.response?.data?.error || 'Failed to submit response');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'inprogress': return 'info';
      case 'complete': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
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
            <Button
              startIcon={<Refresh />}
              onClick={fetchComplaints}
              variant="outlined"
            >
              Refresh
            </Button>
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
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={complaint.status}
                          color={getStatusColor(complaint.status)}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setOpenDialog(true);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography color="text.secondary" paragraph>
                      {complaint.description}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={3}>
                      <Tooltip title="Priority Level">
                        <Box display="flex" alignItems="center" gap={1}>
                          <PriorityHigh fontSize="small" color={getSeverityColor(complaint.severity)} />
                          <Typography variant="body2" color="text.secondary">
                            {complaint.severity.charAt(0).toUpperCase() + complaint.severity.slice(1)} Priority
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Submission Date">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(complaint.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>

                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Button
                        variant="contained"
                        startIcon={<Comment />}
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setOpenDialog(true);
                        }}
                        disabled={complaint.status === 'Complete' || complaint.status === 'Rejected'}
                      >
                        Respond
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedComplaint && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    Complaint #{selectedComplaint.complaint_id} - {selectedComplaint.title}
                  </Typography>
                  <IconButton onClick={() => setOpenDialog(false)}>
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={selectedComplaint.status}
                    color={getStatusColor(selectedComplaint.status)}
                    size="small"
                  />
                </Box>

                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography>{selectedComplaint.description}</Typography>
                </Box>

                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Submitted by
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person fontSize="small" />
                    <Typography>
                      {selectedComplaint.User.name} ({selectedComplaint.User.email})
                    </Typography>
                  </Box>
                </Box>

                {selectedComplaint.SubadminTasks?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Response History
                    </Typography>
                    <Timeline>
                      {selectedComplaint.SubadminTasks.map((task, index) => (
                        <TimelineItem key={task.task_id}>
                          <TimelineOppositeContent color="text.secondary">
                            {new Date(task.created_at).toLocaleString()}
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color="primary" />
                            {index < selectedComplaint.SubadminTasks.length - 1 && (
                              <TimelineConnector />
                            )}
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography>{task.description}</Typography>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                {selectedComplaint.status !== 'Complete' && selectedComplaint.status !== 'Rejected' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Add Response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    error={response.length > 0 && response.length < 10}
                    helperText={response.length > 0 && response.length < 10 ? 
                      "Response must be at least 10 characters long" : ""}
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>
                  Close
                </Button>
                {selectedComplaint.status !== 'Complete' && selectedComplaint.status !== 'Rejected' && (
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSubmitResponse}
                    disabled={!response.trim() || response.length < 10}
                  >
                    Send Response
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default ComplaintView;
