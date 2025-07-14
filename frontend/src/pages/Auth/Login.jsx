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
  IconButton
} from '@mui/material';
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Email,
  Lock
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

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
        // Get user role from localStorage token
        const token = localStorage.getItem('jwt');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;

        // Navigate based on role
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'subadmin':
            navigate('/subadmin/dashboard');
            break;
          case 'user':
            navigate('/user/dashboard');
            break;
          default:
            setError('Invalid user role');
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
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Stack spacing={3} alignItems="center">
            <LoginIcon
              color="primary"
              sx={{ fontSize: 40, mb: 1 }}
            />
            
            <Typography variant="h5" component="h1" gutterBottom>
              Welcome Back
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center">
              Please sign in to continue
            </Typography>

            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
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
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<LoginIcon />}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
