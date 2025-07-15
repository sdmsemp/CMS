import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  Avatar,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Assignment,
  Send,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { subadminTasks } from '../../services/api';

const TaskForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [complaint, setComplaint] = useState(location.state?.complaint || null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      // If we don't have complaint in state, try to fetch it using the URL parameter
      if (!complaint) {
        const complaintId = searchParams.get('complaintId');
        if (complaintId) {
          try {
            setLoading(true);
            const response = await subadminTasks.getComplaint(complaintId);
            if (response.data.success) {
              setComplaint(response.data.data);
            } else {
              throw new Error(response.data.error || 'Failed to fetch complaint');
            }
          } catch (err) {
            console.error('Error fetching complaint:', err);
            setError('Failed to fetch complaint details. Please try again.');
          } finally {
            setLoading(false);
          }
        } else {
          setError('No complaint selected');
        }
      }
    };

    fetchComplaint();
  }, [complaint, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!complaint) {
      setError('No complaint selected');
      return;
    }

    if (description.length < 10 || description.length > 100) {
      setError('Description must be between 10 and 100 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await subadminTasks.addTask({
        complaint_id: complaint.complaint_id,
        description: description.trim()
      });

      if (response.data.success) {
        // Navigate back to complaints view
        navigate('/subadmin/complaints');
      } else {
        throw new Error(response.data.error || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !complaint) {
    return (
      <Container maxWidth="md">
        <Box py={3} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="md">
        <Box py={3}>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/subadmin/complaints')}>
                Go Back
              </Button>
            }
          >
            {error || 'No complaint selected. Please select a complaint first.'}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={3}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Assignment />
            </Avatar>
            <Typography variant="h5">Create Task Response</Typography>
          </Box>

          {/* Complaint Info */}
          <Box mb={4} p={2} bgcolor="grey.50" borderRadius={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Complaint #{complaint.complaint_id}
              </Typography>
              <Chip 
                label={complaint.status} 
                color={
                  complaint.status === 'Pending' ? 'warning' :
                  complaint.status === 'InProgress' ? 'info' :
                  complaint.status === 'Complete' ? 'success' : 'default'
                }
              />
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              {complaint.title}
            </Typography>
            <Typography color="text.secondary" paragraph>
              {complaint.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submitted by: {complaint.User.name}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                error={Boolean(error && error.includes('Description'))}
                helperText="Description must be between 10 and 100 characters"
                disabled={loading}
                inputProps={{
                  maxLength: 100,
                  minLength: 10
                }}
              />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/subadmin/complaints')}
                  disabled={loading}
                >
                  Back to Complaints
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  disabled={loading || description.length < 10}
                >
                  {loading ? 'Submitting...' : 'Submit Response'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default TaskForm;
