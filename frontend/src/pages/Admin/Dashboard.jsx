import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Avatar,
  LinearProgress,
  Tooltip,
  Tab,
  Tabs,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  People,
  Assignment,
  Notifications,
  TrendingUp,
  MoreVert,
  Assessment,
  CalendarToday,
  PersonAdd,
  Business,
  Add as AddIcon,
  SupervisorAccount,
  Domain,
  CheckCircle,
  Error,
  AccessTime,
  Search,
  FilterList,
  Report,
  PriorityHigh,
  Schedule,
  Done,
  Cancel,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import React from 'react';
import { complaints } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // Complaints state
  const [complaintsList, setComplaintsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = [
    {
      title: 'Total Departments',
      value: '05',
      icon: <Domain />,
      color: 'primary.main',
      trend: '+1 this month'
    },
    {
      title: 'Total Subadmins',
      value: '08',
      icon: <SupervisorAccount />,
      color: 'secondary.main',
      trend: '+2 this month'
    },
    {
      title: 'Active Users',
      value: '25',
      icon: <People />,
      color: 'success.main',
      trend: '+5 this week'
    },
    {
      title: 'System Alerts',
      value: '03',
      icon: <Notifications />,
      color: 'warning.main',
      trend: '-2 this week'
    }
  ];

  const departmentPerformance = {
    labels: ['IT', 'HR', 'Finance', 'Admin', 'Marketing'],
    datasets: [
      {
        label: 'Resolution Rate (%)',
        data: [92, 88, 95, 85, 90],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
      }
    ]
  };

  const userActivity = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: [20, 25, 22, 30, 28, 15, 18],
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.4
      }
    ]
  };

  const recentActivities = [
    {
      type: 'department',
      text: 'New department "Cloud Services" created',
      time: '2 hours ago',
      icon: <Domain color="primary" />
    },
    {
      type: 'subadmin',
      text: 'New subadmin assigned to IT department',
      time: '4 hours ago',
      icon: <SupervisorAccount color="secondary" />
    },
    {
      type: 'system',
      text: 'System maintenance completed',
      time: '6 hours ago',
      icon: <CheckCircle color="success" />
    }
  ];

  // Fetch complaints
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await complaints.getAll(params);
      setComplaintsList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 2) { // Complaints tab
      fetchComplaints();
    }
  }, [tabValue, statusFilter]);

  // Filter complaints based on search term
  const filteredComplaints = complaintsList.filter(complaint =>
    complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'InProgress': return 'info';
      case 'Complete': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return <PriorityHigh />;
      case 'medium': return <Schedule />;
      case 'low': return <CheckCircle />;
      default: return <Report />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Header with Action Buttons */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Admin Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/admin/create-subadmin')}
            >
              Create Subadmin
            </Button>
            <Button
              variant="contained"
              startIcon={<Business />}
              onClick={() => navigate('/admin/create-department')}
            >
              Create Department
            </Button>
          </Stack>
        </Box>

        {/* Main Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Overview" />
            <Tab label="Analytics" />
            <Tab label="Complaints" />
          </Tabs>
        </Paper>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <>
            {/* Stats Grid */}
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                          {stat.icon}
                        </Avatar>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="h4" sx={{ my: 2, fontWeight: 'bold' }}>
                        {stat.value}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={stat.trend.includes('+') ? 'success.main' : 'info.main'}
                        >
                          {stat.trend}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Charts */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{ mb: 3 }}
                  >
                    <Tab label="Department Performance" />
                    <Tab label="User Activity" />
                  </Tabs>

                  <Box height={300}>
                    <Bar
                      data={departmentPerformance}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Department Resolution Rates'
                          }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Recent Activities */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Activities
                  </Typography>
                  <List>
                    {recentActivities.map((activity, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            {activity.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.text}
                            secondary={
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                {activity.time}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < recentActivities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {/* Analytics Tab */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  User Activity Trends
                </Typography>
                <Box height={400}>
                  <Line
                    data={userActivity}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Daily Active Users'
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Complaints Tab */}
        {tabValue === 2 && (
          <Box>
            {/* Search and Filter Bar */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search complaints by title, description, or user name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status Filter</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status Filter"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="InProgress">In Progress</MenuItem>
                      <MenuItem value="Complete">Complete</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={fetchComplaints}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Refresh'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Complaints Grid */}
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredComplaints.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        No complaints found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'No complaints have been submitted yet'
                        }
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={complaint.complaint_id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Chip
                              icon={getSeverityIcon(complaint.severity)}
                              label={complaint.severity?.toUpperCase()}
                              color={getSeverityColor(complaint.severity)}
                              size="small"
                            />
                            <Chip
                              label={complaint.status}
                              color={getStatusColor(complaint.status)}
                              size="small"
                            />
                          </Box>

                          <Typography variant="h6" gutterBottom sx={{ 
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {complaint.title}
                          </Typography>

                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {complaint.description}
                          </Typography>

                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>By:</strong> {complaint.user?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(complaint.created_at)}
                            </Typography>
                          </Box>

                          {complaint.response && (
                            <Box sx={{ 
                              p: 1.5, 
                              bgcolor: 'grey.50', 
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.200'
                            }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Response:</strong> {complaint.response}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>

                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setDialogOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
          </Box>
        )}
      </Box>

      {/* Complaint Detail Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedComplaint && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  Complaint Details
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    icon={getSeverityIcon(selectedComplaint.severity)}
                    label={selectedComplaint.severity?.toUpperCase()}
                    color={getSeverityColor(selectedComplaint.severity)}
                    size="small"
                  />
                  <Chip
                    label={selectedComplaint.status}
                    color={getStatusColor(selectedComplaint.status)}
                    size="small"
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedComplaint.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedComplaint.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Submitted By
                  </Typography>
                  <Typography variant="body1">
                    {selectedComplaint.user?.name || 'Unknown'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Submitted On
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedComplaint.created_at)}
                  </Typography>
                </Grid>

                {selectedComplaint.response && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Response
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body1">
                        {selectedComplaint.response}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Dashboard;
