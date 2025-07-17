import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
  Box,
  Skeleton,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  Business,
  CalendarToday,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import PushNotificationToggle from '../../components/PushNotificationToggle';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await auth.getProfile();
        console.log('Profile response:', response);
        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          setError('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          await logout();
          navigate('/login');
        } else {
          setError(error.response?.data?.error || 'Failed to load profile. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [logout, navigate]);

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1:
        return 'Admin';
      case 2:
        return 'Subadmin';
      case 3:
        return 'Employee';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={200} />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">No profile data available</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              fontSize: '3rem'
            }}
          >
            {profile?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h4" gutterBottom>
              {profile?.name}
            </Typography>
            <Chip
              label={getRoleName(profile?.role_id)}
              color="primary"
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Personal Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Badge sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography>
                    <strong>Employee ID:</strong> {profile?.emp_id}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Email sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography>
                    <strong>Email:</strong> {profile?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography>
                    <strong>Joined:</strong> {formatDate(profile?.createdAt)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Work Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Person sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography>
                    <strong>Role:</strong> {getRoleName(profile?.role_id)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Business sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography>
                    <strong>Department:</strong> {profile?.Department?.name || 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Push Notifications
                  </Typography>
                </Box>
                <PushNotificationToggle />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 