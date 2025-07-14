import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import {
  Assignment,
  Business,
  Schedule
} from '@mui/icons-material';

const severityColors = {
  High: 'error',
  Medium: 'warning',
  Low: 'success'
};

const ComplaintCard = ({ complaint }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Assignment />
          </Avatar>
          <Typography variant="h6">{complaint.title}</Typography>
        </Box>
        <Chip
          label={complaint.severity}
          color={severityColors[complaint.severity]}
          size="small"
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" mb={2}>
        {complaint.description}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Stack direction="row" spacing={2} alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Business fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {complaint.department}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Schedule fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {complaint.status}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default ComplaintCard;
