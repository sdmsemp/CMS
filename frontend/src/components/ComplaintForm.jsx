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

const ComplaintForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    department: '',
    priority: 'medium'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(form);
      setSuccess(true);
      setError('');
      setForm({ title: '', description: '', department: '', priority: 'medium' });
    } catch (err) {
      setError(err.message);
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
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />

          <FormControl fullWidth required>
            <InputLabel>Department</InputLabel>
            <Select
              value={form.department}
              label="Department"
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <MenuItem value="it">IT</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
              <MenuItem value="finance">Finance</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={form.priority}
              label="Priority"
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
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
