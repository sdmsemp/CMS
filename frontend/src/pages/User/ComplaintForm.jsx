import { useState } from 'react';
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
  Chip
} from '@mui/material';
import {
  Description,
  Send,
  Business,
  PriorityHigh
} from '@mui/icons-material';
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
    severity: 'low', // Changed to lowercase to match backend
    attachments: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await api.post('/complaints', {
        title: form.title,
        description: form.description,
        dept_id: form.dept_id,
        severity: form.severity // Will be sent as lowercase
      });

      setSuccess('Complaint submitted successfully!');
      setForm({
        title: '',
        description: '',
        dept_id: '',
        severity: 'low', // Reset to lowercase
        attachments: []
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

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
                  <MenuItem value={1}>IT Department</MenuItem>
                  <MenuItem value={2}>HR Department</MenuItem>
                  <MenuItem value={3}>Finance Department</MenuItem>
                  <MenuItem value={4}>Facilities</MenuItem>
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
                startIcon={<Send />}
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
