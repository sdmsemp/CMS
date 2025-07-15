import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  PersonAdd,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Badge,
  Business
} from '@mui/icons-material';
import { auth, departments, handleApiError } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    empId: '',
    email: '',
    password_hash: '',
    confirmPassword: '',
    deptId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Fetch departments when component mounts
    const fetchDepartments = async () => {
      try {
        const response = await departments.getAll();
        setDepartmentList(response.data.data);
      } catch (err) {
        const errorData = handleApiError(err);
        setError(errorData.error);
      }
    };
    fetchDepartments();
  }, []);

  const validateForm = () => {
    const errors = {};
    
    // Name validation (2-20 characters)
    if (form.name.length < 2 || form.name.length > 20) {
      errors.name = 'Name must be between 2 and 20 characters';
    }

    // Employee ID validation (3 digits, 100-999)
    const empIdNum = parseInt(form.empId);
    if (!form.empId || isNaN(empIdNum) || empIdNum < 100 || empIdNum > 999) {
      errors.empId = 'Employee ID must be a number between 100 and 999';
    }

    // Email validation (@starkdigital.in domain)
    if (!form.email.endsWith('@starkdigital.in')) {
      errors.email = 'Email must be from @starkdigital.in domain';
    }

    // Password validation (8-15 chars, 1 special char, 2 digits)
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*\d.*\d).{8,15}$/;
    if (!passwordRegex.test(form.password)) {
      errors.password = 'Password must be 8-15 characters with at least one special character and two digits';
    }

    // Confirm password validation
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Department validation
    if (!form.deptId) {
      errors.deptId = 'Department is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await auth.register({
        name: form.name,
        emp_id: parseInt(form.empId),
        email: form.email,
        password: form.password,
        dept_id: parseInt(form.deptId)
      });
      
      // Show success message
      setError('');
      
      // Redirect to login since user should verify their credentials
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login with your credentials.' 
        } 
      });
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box
        sx={{
          minHeight: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            width: '100%',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Stack spacing={2} alignItems="center">
            <PersonAdd
              color="primary"
              sx={{ fontSize: 32, mb: 1 }}
            />
            
            <Typography variant="h5" component="h1" gutterBottom>
              Create Account
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center">
              Sign up to get started
            </Typography>

            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  size="small"
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Employee ID"
                  value={form.empId}
                  onChange={(e) => setForm({ ...form, empId: e.target.value })}
                  required
                  size="small"
                  error={!!validationErrors.empId}
                  helperText={validationErrors.empId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl 
                  fullWidth 
                  size="small" 
                  error={!!validationErrors.deptId}
                >
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={form.deptId}
                    label="Department"
                    onChange={(e) => setForm({ ...form, deptId: e.target.value })}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <Business color="action" />
                      </InputAdornment>
                    }
                  >
                    {departmentList.map((dept) => (
                      <MenuItem key={dept.dept_id} value={dept.dept_id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.deptId && (
                    <FormHelperText>{validationErrors.deptId}</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  size="small"
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  size="small"
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
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
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  size="small"
                  error={!!validationErrors.confirmPassword}
                  helperText={validationErrors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="medium"
                  disabled={loading}
                  startIcon={<PersonAdd />}
                  fullWidth
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Stack>
      </form>

            <Box mt={1} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
