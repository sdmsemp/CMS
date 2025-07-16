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

const ComplaintCard = ({ complaint, onViewDetails, truncateDescription }) => {
  // Truncate description to 2 lines (about 100 chars) if needed
  const getDescription = () => {
    if (truncateDescription && complaint.description.length > 100) {
      return complaint.description.slice(0, 100) + '...';
    }
    return complaint.description;
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        maxWidth: 380, // increased by 40px
        minWidth: 340, // increased by 40px
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden' // prevent overflow
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
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
        
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={truncateDescription ? {
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: 48,
            maxWidth: '100%',
            wordBreak: 'break-word'
          } : { minHeight: 48, maxWidth: '100%', wordBreak: 'break-word' }}
        >
          {getDescription()}
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
};

export default ComplaintCard;
