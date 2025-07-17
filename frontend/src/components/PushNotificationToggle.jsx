import React from 'react';
import {
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Notifications,
  NotificationsOff,
  NotificationsActive
} from '@mui/icons-material';
import usePushNotifications from '../hooks/usePushNotifications';

const PushNotificationToggle = () => {
  const {
    isSupported,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Push notifications are not supported in this browser
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" alignItems="center" gap={2}>
        <Tooltip title={isSubscribed ? "Disable push notifications" : "Enable push notifications"}>
          <IconButton
            color={isSubscribed ? "primary" : "default"}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : isSubscribed ? (
              <NotificationsActive />
            ) : (
              <NotificationsOff />
            )}
          </IconButton>
        </Tooltip>

        <FormControlLabel
          control={
            <Switch
              checked={isSubscribed}
              onChange={handleToggle}
              disabled={loading}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              {isSubscribed ? "Push notifications enabled" : "Enable push notifications"}
            </Typography>
          }
        />
      </Box>

      {isSubscribed && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          You will receive real-time notifications for new complaints and updates
        </Typography>
      )}
    </Box>
  );
};

export default PushNotificationToggle; 