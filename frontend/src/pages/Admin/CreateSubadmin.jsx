import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Stack,
  Avatar,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  PersonAdd,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Security,
  Badge
} from '@mui/icons-material';
import { admin } from '../../services/api';

const CreateSubadmin = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    emp_id: '',
    name: '',
    email: '',
    password: '',
    dept_id: '',
    role_id: 2, // Subadmin role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validation, setValidation] = useState({
    emp_id: '',
    name: '',
    email: '',
    password: '',
    dept_id: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await admin.getDepartments();
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to fetch departments');
    }
  };

  const validateForm = () => {
    const newValidation = {};
    
    // Employee ID validation
    if (form.emp_id) {
      if (!/^\d{3}$/.test(form.emp_id)) {
        newValidation.emp_id = 'Employee ID must be a 3-digit number';
      }
    }

    // Name validation
    if (form.name) {
      if (form.name.length < 2 || form.name.length > 20) {
        newValidation.name = 'Name must be between 2 and 20 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(form.name)) {
        newValidation.name = 'Name can only contain letters and spaces';
      }
    }

    // Email validation
    if (form.email) {
      if (!form.email.endsWith('@starkdigital.in')) {
        newValidation.email = 'Email must be a @starkdigital.in address';
      }
    }

    // Password validation
    if (form.password) {
      if (form.password.length < 8) {
        newValidation.password = 'Password must be at least 8 characters';
      } else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
        newValidation.password = 'Password must contain uppercase, lowercase, number and special character';
      }
    }

    setValidation(newValidation);
    return Object.keys(newValidation).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (value) {
      validateForm();
    }
  };

  const steps = ['Basic Information', 'Department Assignment'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      if (validateForm()) {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      await admin.createSubadmin(form);
      setSuccess('Subadmin created successfully!');
      setForm({
        emp_id: '',
        name: '',
        email: '',
        password: '',
        dept_id: '',
        role_id: 2
      });
      setActiveStep(0);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create subadmin';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return form.emp_id && form.name && form.email && form.password && !Object.keys(validation).length;
      case 1:
        return form.dept_id;
      default:
        return true;
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={3}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonAdd />
            </Avatar>
            <Typography variant="h5" component="h1">Create Subadmin</Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box>
            {activeStep === 0 && (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={form.emp_id}
                  onChange={handleInputChange('emp_id')}
                  error={Boolean(validation.emp_id)}
                  helperText={validation.emp_id}
                  required
                  placeholder="Enter 3-digit employee ID"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge color="action" />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  fullWidth
                  label="Full Name"
                  value={form.name}
                  onChange={handleInputChange('name')}
                  error={Boolean(validation.name)}
                  helperText={validation.name}
                  required
                  placeholder="Enter full name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonAdd color="action" />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange('email')}
                  error={Boolean(validation.email)}
                  helperText={validation.email}
                  required
                  placeholder="name@starkdigital.in"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleInputChange('password')}
                  error={Boolean(validation.password)}
                  helperText={validation.password}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>
            )}

            {activeStep === 1 && (
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={form.dept_id}
                  label="Department"
                  onChange={handleInputChange('dept_id')}
                  required
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
            )}

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || !isStepValid()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {activeStep === steps.length - 1 ? (loading ? 'Creating...' : 'Create Subadmin') : 'Next'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

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
    </Container>
  );
};

export default CreateSubadmin;
