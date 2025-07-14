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
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Business,
  Add as AddIcon
} from '@mui/icons-material';
import { admin } from '../../services/api';

const CreateDepartment = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [nameError, setNameError] = useState('');

  const validateName = (value) => {
    if (value.length < 2) {
      setNameError('Department name must be at least 2 characters long');
      return false;
    }
    if (value.length > 20) {
      setNameError('Department name cannot exceed 20 characters');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      setNameError('Department name can only contain letters and spaces');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value) validateName(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateName(name)) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await admin.createDepartment({ name: name.trim() });
      setSuccess('Department created successfully!');
      setName('');
      // Reset form
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create department';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Business />
        </Avatar>
        <Typography variant="h5" component="h1">Create Department</Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Department Name"
            name="name"
            value={name}
            onChange={handleNameChange}
            error={Boolean(nameError)}
            helperText={nameError}
            required
            placeholder="Enter department name"
            InputProps={{
              startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />
            }}
            disabled={loading}
          />

          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              size="large"
              disabled={loading || Boolean(nameError)}
            >
              {loading ? 'Creating...' : 'Create Department'}
            </Button>
          </Box>
        </Stack>
      </form>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CreateDepartment;
