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
  FormHelperText,
  Grid,
  Fade,
  Slide,
  Grow
} from '@mui/material';
import {
  PersonAdd,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Badge,
  Business,
  CheckCircle,
  ArrowForward
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
  const [fieldErrors, setFieldErrors] = useState({});

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
      setFieldErrors({});
      
      // Redirect to login since user should verify their credentials
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login with your credentials.' 
        } 
      });
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.error);
      
      // Handle specific field errors
      if (errorData.error) {
        const errorMessage = errorData.error.toLowerCase();
        const newFieldErrors = {};
        
        if (errorMessage.includes('employee id already registered')) {
          newFieldErrors.empId = 'Employee ID already registered';
        } else if (errorMessage.includes('email already registered')) {
          newFieldErrors.email = 'Email already registered';
        }
        
        setFieldErrors(newFieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Illustration */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  color: 'white'
                }}
              >
                <Box
                  component="img"
                  src="/register-illustration.svg"
                  alt="Registration"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    mb: 3,
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
                  }}
                />
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Welcome to CMS
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  Join our team and start managing complaints efficiently
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                  <Typography variant="body1">
                    Secure registration process
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                  <Typography variant="body1">
                    Instant access to the platform
                  </Typography>
                </Stack>
              </Box>
            </Fade>
          </Grid>

          {/* Right Side - Registration Form */}
          <Grid item xs={12} md={6}>
            <Slide direction="left" in timeout={800}>
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                <Stack spacing={3} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <PersonAdd sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  
                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Create Account
                  </Typography>

                  <Typography variant="body1" color="text.secondary" align="center">
                    Join our team and start your journey
                  </Typography>

                  {error && (
                    <Grow in timeout={300}>
                      <Alert 
                        severity="error" 
                        onClose={() => setError('')}
                        sx={{ width: '100%', borderRadius: 2 }}
                      >
                        {error}
                      </Alert>
                    </Grow>
                  )}

                  <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value });
                          if (error) setError('');
                        }}
                        required
                        size="medium"
                        error={!!validationErrors.name}
                        helperText={validationErrors.name}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
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
                        onChange={(e) => {
                          setForm({ ...form, empId: e.target.value });
                          if (fieldErrors.empId) {
                            setFieldErrors({ ...fieldErrors, empId: '' });
                          }
                          if (error) setError('');
                        }}
                        required
                        size="medium"
                        error={!!validationErrors.empId || !!fieldErrors.empId}
                        helperText={validationErrors.empId || fieldErrors.empId}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
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
                        size="medium" 
                        error={!!validationErrors.deptId}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
                      >
                        <InputLabel>Department</InputLabel>
                        <Select
                          value={form.deptId}
                          label="Department"
                          onChange={(e) => {
                            setForm({ ...form, deptId: e.target.value });
                            if (error) setError('');
                          }}
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
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (fieldErrors.email) {
                            setFieldErrors({ ...fieldErrors, email: '' });
                          }
                          if (error) setError('');
                        }}
                        required
                        size="medium"
                        error={!!validationErrors.email || !!fieldErrors.email}
                        helperText={validationErrors.email || fieldErrors.email}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
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
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value });
                          if (error) setError('');
                        }}
                        required
                        size="medium"
                        error={!!validationErrors.password}
                        helperText={validationErrors.password}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
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
                        onChange={(e) => {
                          setForm({ ...form, confirmPassword: e.target.value });
                          if (error) setError('');
                        }}
                        required
                        size="medium"
                        error={!!validationErrors.confirmPassword}
                        helperText={validationErrors.confirmPassword}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        }}
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
                        size="large"
                        disabled={loading}
                        endIcon={loading ? null : <ArrowForward />}
                        fullWidth
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </Stack>
                  </form>

                  <Box mt={2} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Sign In
                      </Link>
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Slide>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Register;
