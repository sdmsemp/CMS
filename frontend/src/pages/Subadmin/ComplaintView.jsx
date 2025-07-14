import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Stack,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  InputAdornment
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Assignment,
  PriorityHigh,
  Schedule,
  Comment,
  Send,
  AttachFile,
  Close,
  Search,
  FilterList,
  MoreVert,
  Person
} from '@mui/icons-material';

const ComplaintView = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState('');

  // Sample data - replace with your actual data
  const complaints = [
    {
      id: 1,
      title: 'Network Issues',
      description: 'Unable to connect to the office network',
      status: 'open',
      priority: 'high',
      department: 'IT',
      createdAt: new Date(),
      user: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      updates: [
        {
          id: 1,
          message: 'Complaint received',
          user: 'System',
          timestamp: new Date(),
          type: 'info'
        }
      ]
    },
    // Add more complaints...
  ];

  const handleSubmitResponse = async () => {
    try {
      // Add your submit logic here
      setResponse('');
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'error';
      case 'in progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Complaints</Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search complaints..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filter}
                label="Status"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Complaints</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {complaints.map((complaint) => (
            <Grid item xs={12} key={complaint.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{complaint.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {complaint.user.name} • {complaint.department}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={complaint.status}
                        color={getStatusColor(complaint.status)}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setOpenDialog(true);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography color="text.secondary" paragraph>
                    {complaint.description}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PriorityHigh fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Priority: {complaint.priority}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Submitted: {new Date(complaint.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                      variant="contained"
                      startIcon={<Comment />}
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setOpenDialog(true);
                      }}
                    >
                      Respond
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedComplaint && (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Complaint Details</Typography>
                  <IconButton onClick={() => setOpenDialog(false)}>
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Timeline>
                  {selectedComplaint.updates.map((update, index) => (
                    <TimelineItem key={update.id}>
                      <TimelineOppositeContent color="text.secondary">
                        {new Date(update.timestamp).toLocaleString()}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="primary" />
                        {index < selectedComplaint.updates.length - 1 && (
                          <TimelineConnector />
                        )}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography>{update.message}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          By: {update.user}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>

                <Divider sx={{ my: 2 }} />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Add Response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response..."
                />
              </DialogContent>
              <DialogActions>
                <input
                  type="file"
                  id="attachment"
                  style={{ display: 'none' }}
                  multiple
                />
                <label htmlFor="attachment">
                  <Button
                    component="span"
                    startIcon={<AttachFile />}
                  >
                    Attach Files
                  </Button>
                </label>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSubmitResponse}
                  disabled={!response.trim()}
                >
                  Send Response
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default ComplaintView;
