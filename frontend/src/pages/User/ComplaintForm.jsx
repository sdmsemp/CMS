import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Avatar,
  InputAdornment,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Description,
  Send,
  Business,
  PriorityHigh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Severity display mapping for proper capitalization in UI
const severityDisplay = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

const severityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error'
};

const ComplaintForm = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dept_id: '',
    severity: 'low',
    attachments: []
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments');
        if (response.data.success) {
          setDepartments(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments');
      } finally {
        setLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input lengths as per backend requirements
    if (form.title.length < 3 || form.title.length > 25) {
      setError('Title must be between 3 and 25 characters');
      return;
    }

    if (form.description.length < 10 || form.description.length > 100) {
      setError('Description must be between 10 and 100 characters');
      return;
    }

    if (!form.dept_id) {
      setError('Please select a department');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.post('/complaints', {
        title: form.title,
        description: form.description,
        dept_id: form.dept_id,
        severity: form.severity
      });

      if (response.data.success) {
        setSuccess('Complaint submitted successfully!');
        // Reset form
        setForm({
          title: '',
          description: '',
          dept_id: '',
          severity: 'low',
          attachments: []
        });
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to submit complaint');
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (loadingDepts) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={3}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Description />
            </Avatar>
            <Typography variant="h5">Submit Complaint</Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="Brief description of the issue"
                helperText={`${form.title.length}/25 characters (min: 3)`}
                error={form.title.length > 0 && (form.title.length < 3 || form.title.length > 25)}
                inputProps={{ maxLength: 25 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                placeholder="Provide detailed information about your complaint"
                helperText={`${form.description.length}/100 characters (min: 10)`}
                error={form.description.length > 0 && (form.description.length < 10 || form.description.length > 100)}
                inputProps={{ maxLength: 100 }}
              />

              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={form.dept_id}
                  label="Department"
                  onChange={(e) => setForm({ ...form, dept_id: e.target.value })}
                  startAdornment={
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  }
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.dept_id} value={dept.dept_id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={form.severity}
                  label="Severity"
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  startAdornment={
                    <InputAdornment position="start">
                      <PriorityHigh color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="low">
                    <Chip size="small" label={severityDisplay.low} color={severityColors.low} />
                  </MenuItem>
                  <MenuItem value="medium">
                    <Chip size="small" label={severityDisplay.medium} color={severityColors.medium} />
                  </MenuItem>
                  <MenuItem value="high">
                    <Chip size="small" label={severityDisplay.high} color={severityColors.high} />
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ComplaintForm;
