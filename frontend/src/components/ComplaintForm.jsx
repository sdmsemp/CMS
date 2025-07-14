import { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Send, Description } from '@mui/icons-material';
import api from '../services/api';

const ComplaintForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dept_id: '', // Changed from department to match backend
    severity: 'Low' // Changed from priority to match backend
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

    try {
      const response = await api.post('/complaints', form);
      setSuccess(true);
      setError('');
      setForm({ title: '', description: '', dept_id: '', severity: 'Low' });
      if (onSuccess) {
        onSuccess(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
      setSuccess(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Description color="primary" />
        <Typography variant="h6">Submit Complaint</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            inputProps={{ maxLength: 25 }}
            helperText={`${form.title.length}/25 characters`}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            inputProps={{ maxLength: 100 }}
            helperText={`${form.description.length}/100 characters`}
          />

          <FormControl fullWidth required>
            <InputLabel>Department</InputLabel>
            <Select
              value={form.dept_id}
              label="Department"
              onChange={(e) => setForm({ ...form, dept_id: e.target.value })}
            >
              <MenuItem value={1}>IT</MenuItem>
              <MenuItem value={2}>HR</MenuItem>
              <MenuItem value={3}>Finance</MenuItem>
              <MenuItem value={4}>Facilities</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Severity</InputLabel>
            <Select
              value={form.severity}
              label="Severity"
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              Complaint submitted successfully!
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<Send />}
          >
            Submit Complaint
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default ComplaintForm;
