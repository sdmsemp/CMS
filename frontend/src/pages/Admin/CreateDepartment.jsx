import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Stack,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Business,
  Person,
  Email
} from '@mui/icons-material';
import api from '../../services/api';

const CreateDepartment = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    headEmail: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/admin/department', form);
      setSuccess(true);
      setForm({ name: '', description: '', headEmail: '', status: 'active' });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create department');
      setSuccess(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Business />
        </Avatar>
        <Typography variant="h5">Create Department</Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 3 }}>
          Department created successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Department Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter department name"
            InputProps={{
              startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter department description"
            helperText="Provide a brief description of the department's responsibilities"
          />

          <TextField
            fullWidth
            label="Department Head Email"
            name="headEmail"
            type="email"
            value={form.headEmail}
            onChange={handleChange}
            required
            placeholder="Enter department head's email"
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={form.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              startIcon={<Business />}
              size="large"
            >
              Create Department
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default CreateDepartment;
