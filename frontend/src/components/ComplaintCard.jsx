import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Stack,
  Divider,
  Button
} from '@mui/material';
import {
  Assignment,
  Business,
  Schedule,
  Info
} from '@mui/icons-material';

// Severity display mapping for proper capitalization in UI
const severityDisplay = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

const severityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error'
};

const statusColors = {
  Pending: 'warning',
  InProgress: 'info',
  Complete: 'success',
  Rejected: 'error'
};

const ComplaintCard = ({ complaint, onViewDetails }) => (
  <Card elevation={2}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Assignment />
          </Avatar>
          <Box>
            <Typography variant="h6">{complaint.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Department ID: {complaint.dept_id}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            label={complaint.status}
            color={statusColors[complaint.status]}
            size="small"
          />
          <Chip
            label={severityDisplay[complaint.severity]}
            color={severityColors[complaint.severity]}
            size="small"
          />
        </Stack>
      </Box>
      
      <Typography variant="body2" color="text.secondary" mb={2}>
        {complaint.description}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1}>
          <Schedule fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {new Date(complaint.created_at).toLocaleString()}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Info />}
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </Box>
    </CardContent>
  </Card>
);

export default ComplaintCard;
