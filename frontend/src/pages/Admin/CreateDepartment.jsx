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
import api, { admin } from '../../services/api';

const CreateDepartment = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await admin.createDepartment({ name });
      setSuccess('Department created successfully!');
      setName('');
    } catch (err) {
      setError('Failed to create department');
    } finally {
      setLoading(false);
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
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Department Name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Enter department name"
            InputProps={{
              startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              startIcon={<Business />}
              size="large"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Department'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default CreateDepartment;
