import { useState } from 'react';
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
  Chip,
  Avatar,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  PersonAdd,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Security
} from '@mui/icons-material';
import { admin } from '../../services/api';

const CreateSubadmin = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    permissions: [],
    notificationPreferences: {
      email: true,
      inApp: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const steps = [
    'Basic Information',
    'Department Assignment',
    'Permissions',
    'Preferences'
  ];

  const permissions = [
    { id: 'manage_complaints', label: 'Manage Complaints' },
    { id: 'view_reports', label: 'View Reports' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'send_notifications', label: 'Send Notifications' }
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await admin.createSubadmin(form);
      setSuccess('Subadmin created successfully!');
      setForm({ name: '', email: '', password: '', department: '' });
    } catch (err) {
      setError('Failed to create subadmin');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return form.name && form.email && form.password;
      case 1:
        return form.department;
      case 2:
        return form.permissions.length > 0;
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
            <Typography variant="h5">Create Subadmin</Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
              {success}
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
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
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
                    )
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
                    )
                  }}
                />
              </Stack>
            )}

            {activeStep === 1 && (
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={form.department}
                  label="Department"
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="it">IT Department</MenuItem>
                  <MenuItem value="hr">HR Department</MenuItem>
                  <MenuItem value="finance">Finance Department</MenuItem>
                </Select>
              </FormControl>
            )}

            {activeStep === 2 && (
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select Permissions
                </Typography>
                {permissions.map((permission) => (
                  <FormControlLabel
                    key={permission.id}
                    control={
                      <Checkbox
                        checked={form.permissions.includes(permission.id)}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...form.permissions, permission.id]
                            : form.permissions.filter((p) => p !== permission.id);
                          setForm({ ...form, permissions: newPermissions });
                        }}
                      />
                    }
                    label={permission.label}
                  />
                ))}
              </Stack>
            )}

            {activeStep === 3 && (
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Notification Preferences
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.notificationPreferences.email}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          notificationPreferences: {
                            ...form.notificationPreferences,
                            email: e.target.checked
                          }
                        });
                      }}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.notificationPreferences.inApp}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          notificationPreferences: {
                            ...form.notificationPreferences,
                            inApp: e.target.checked
                          }
                        });
                      }}
                    />
                  }
                  label="In-App Notifications"
                />
              </Stack>
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
                disabled={!isStepValid()}
              >
                {activeStep === steps.length - 1 ? 'Create Subadmin' : 'Next'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateSubadmin;
