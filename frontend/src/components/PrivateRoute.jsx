import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  CircularProgress,
  Box,
  Alert,
  Typography
} from '@mui/material';
import { Lock } from '@mui/icons-material';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, error } = useContext(AuthContext);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Verifying access...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Alert
          severity="error"
          sx={{ maxWidth: 400 }}
          action={
            <Navigate to="/login" replace />
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <Lock color="action" sx={{ fontSize: 48 }} />
        <Typography variant="h6" color="text.secondary">
          Access Restricted
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
        <Navigate to="/login" replace />
      </Box>
    );
  }

  return children;
};

export default PrivateRoute;
