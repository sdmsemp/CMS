import { useState, useContext } from 'react';
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
  Grid,
  Fade,
  Slide,
  Grow
} from '@mui/material';
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { getToken } from '../../utils/cookieStorage';

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(form.email, form.password);
      if (success) {
        // Get user role from cookie token
        const token = getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = payload.role_id || payload.role;

          // Navigate based on role
          switch (role) {
            case 1:
            case 'admin':
              console.log('Navigating to admin dashboard')  
            navigate('/admin/dashboard');
              
              break;
            case 2:
            case 'subadmin':
              navigate('/subadmin/dashboard');
              break;
            case 3:
            case 'user':
              navigate('/user/dashboard');
              break;
            default:
              setError('Invalid user role');
          }
        } else {
          setError('Login failed: No token found');
        }
      } else {
        setError(authError || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
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
          {/* Left Side - Welcome Content */}
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
                  src="/login-illustration.svg"
                  alt="Login"
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 'auto',
                    mb: 3,
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
                  }}
                />
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Welcome Back
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  Sign in to access your dashboard and manage complaints
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                  <Typography variant="body1">
                    Secure authentication
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <CheckCircle sx={{ color: '#4CAF50' }} />
                  <Typography variant="body1">
                    Role-based access control
                  </Typography>
                </Stack>
              </Box>
            </Fade>
          </Grid>

          {/* Right Side - Login Form */}
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
                    <LoginIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  
                  <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Sign In
                  </Typography>

                  <Typography variant="body1" color="text.secondary" align="center">
                    Welcome back! Please enter your credentials
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
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (error) setError('');
                        }}
                        required
                        size="medium"
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
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </Stack>
                  </form>

                  <Box mt={2} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link
                        to="/register"
                        style={{
                          color: '#667eea',
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Sign Up
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

export default Login;
