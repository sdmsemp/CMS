import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Business,
  Add as AddIcon,
  People,
  Schedule,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { admin, departments } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CreateDepartment = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [nameError, setNameError] = useState('');
  const [existingDepartments, setExistingDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, department: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departments.getAll();
      if (response.data.success) {
        setExistingDepartments(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

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

    // Check if user is admin
    if (!user || user.role_id !== 1) {
      setError('You do not have permission to create departments');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await admin.createDepartment({ name: name.trim() });
      if (response.data.success) {
        setSuccess('Department created successfully!');
        setName('');
        // Refresh the departments list
        await fetchDepartments();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.data.error || 'Failed to create department');
      }
    } catch (err) {
      console.error('Department creation error:', err);
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Failed to create department. Please check your permissions and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (department) => {
    setDeleteDialog({ open: true, department });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.department) return;

    setDeleting(true);
    try {
      console.log('Deleting department:', deleteDialog.department.dept_id);
      const response = await departments.delete(deleteDialog.department.dept_id);
      console.log('Delete response:', response);
      
      if (response.data.success) {
        setSuccess('Department deleted successfully!');
        // Update the state directly and also refetch to ensure consistency
        setExistingDepartments(prev => {
          const updated = prev.filter(dept => dept.dept_id !== deleteDialog.department.dept_id);
          console.log('Updated departments list:', updated);
          return updated;
        });
        // Also refetch after a short delay to ensure we have the latest data
        setTimeout(() => {
          fetchDepartments();
        }, 1000);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.data.error || 'Failed to delete department');
      }
    } catch (err) {
      console.error('Delete department error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Failed to delete department.';
      setError(errorMessage);
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, department: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, department: null });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Department Management
      </Typography>

      <Grid container spacing={4}>
        {/* Create Department Form */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, height: 'fit-content' }}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Business />
              </Avatar>
              <Typography variant="h6" component="h2">Create New Department</Typography>
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

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                  size="large"
                  disabled={loading || Boolean(nameError)}
                  fullWidth
                >
                  {loading ? 'Creating...' : 'Create Department'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>

        {/* Existing Departments */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <People />
              </Avatar>
              <Typography variant="h6" component="h2">Existing Departments</Typography>
            </Box>

            {loadingDepartments ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : existingDepartments.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary" gutterBottom>
                  No departments found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first department using the form on the left
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {existingDepartments.map((dept) => (
                  <Grid item xs={12} sm={6} key={dept.dept_id}>
                    <Card sx={{ 
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {dept.name}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <Chip 
                              label={`ID: ${dept.dept_id}`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            {(!dept.Users || dept.Users.length === 0) && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(dept)}
                                sx={{ 
                                  bgcolor: 'error.light',
                                  color: 'white',
                                  '&:hover': {
                                    bgcolor: 'error.main'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <People fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {dept.Users ? dept.Users.length : 0} members
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={1}>
                            <Schedule fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Created: {new Date(dept.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Stack>

                        {dept.Users && dept.Users.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Department Admins:
                            </Typography>
                            <Stack spacing={0.5}>
                              {dept.Users.map((user, index) => (
                                <Typography key={index} variant="caption" color="text.secondary">
                                  • {user.name} ({user.email})
                                </Typography>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {(!dept.Users || dept.Users.length === 0) && (
                          <Box mt={2}>
                            <Chip 
                              label="No members" 
                              size="small" 
                              color="warning" 
                              variant="outlined"
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <DeleteIcon />
            </Avatar>
            <Typography variant="h6">Delete Department</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete the department "{deleteDialog.department?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The department will be permanently removed from the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete Department'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default CreateDepartment;
