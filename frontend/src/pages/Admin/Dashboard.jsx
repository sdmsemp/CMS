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
  CircularProgress,
  Pagination
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
  Visibility,
  Settings
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
import * as api from '../../services/api';

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
  console.log('Dashboard component loaded');
  console.log('API object:', api);
  console.log('Admin object:', api.admin);
  
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  
  // Complaints state
  const [complaintsList, setComplaintsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Activity logs state
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSearchTerm, setLogsSearchTerm] = useState('');
  const [logsModuleFilter, setLogsModuleFilter] = useState('all');
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(0);

  // Remove static arrays for stats, departmentPerformance, userActivity, recentActivities
  // Add state for dynamic dashboard data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardCharts, setDashboardCharts] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Add state for recent activities pagination
  const [recentActivitiesPage, setRecentActivitiesPage] = useState(1);
  const [recentActivitiesLimit] = useState(5); // Show 5 activities per page
  const [recentActivitiesTotal, setRecentActivitiesTotal] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        console.log('Fetching dashboard data...');
        const [statsRes, chartsRes] = await Promise.all([
          api.admin.getDashboardStats({ 
            activitiesPage: recentActivitiesPage, 
            activitiesLimit: recentActivitiesLimit 
          }),
          api.admin.getDashboardCharts()
        ]);
        console.log('Dashboard stats response:', statsRes);
        console.log('Dashboard charts response:', chartsRes);
        setDashboardStats(statsRes.data.data);
        setDashboardCharts(chartsRes.data.data);
        setRecentActivitiesTotal(statsRes.data.data.totalActivities || 0);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setDashboardError('Failed to load dashboard data: ' + (err.response?.data?.error || err.message));
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboardData();
  }, [recentActivitiesPage, recentActivitiesLimit]);

  // Fetch complaints
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await api.complaints.getAll(params);
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

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    setLogsLoading(true);
    try {
      console.log('admin object:', api.admin); // Debug log
      const params = {
        page: logsPage,
        limit: 20
      };
      if (logsModuleFilter !== 'all') {
        params.module = logsModuleFilter;
      }
      console.log('Fetching activity logs with params:', params); // Debug log
      const response = await api.admin.getLogs(params);
      console.log('Activity logs response:', response); // Debug log
      setActivityLogs(response.data.data.logs || []);
      setLogsTotalPages(response.data.data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 3) { // Activity logs tab
      fetchActivityLogs();
    }
  }, [tabValue, logsPage, logsModuleFilter]);

  // Filter complaints based on search term
  const filteredComplaints = complaintsList.filter(complaint =>
    complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter activity logs based on search term
  const filteredActivityLogs = activityLogs.filter(log =>
    log.action?.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
    log.user?.name?.toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
    log.module?.toLowerCase().includes(logsSearchTerm.toLowerCase())
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

  // Get activity icon based on module
  const getActivityIcon = (module) => {
    switch (module?.toLowerCase()) {
      case 'complaints': return <Report />;
      case 'subadmins': return <SupervisorAccount />;
      case 'departments': return <Business />;
      case 'users': return <People />;
      case 'admin': return <Settings />;
      default: return <Assignment />;
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

  // Update complaint status
  const updateComplaintStatus = async (complaintId, newStatus) => {
    setStatusChangeLoading(true);
    setStatusUpdateSuccess(false);
    try {
      await api.complaints.updateStatus(complaintId, { status: newStatus });
      
      // Update the complaint in the list
      setComplaintsList(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint.complaint_id === complaintId 
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
      
      // Update selected complaint if it's the same one
      if (selectedComplaint && selectedComplaint.complaint_id === complaintId) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
      
      // Show success feedback
      setStatusUpdateSuccess(true);
      setTimeout(() => setStatusUpdateSuccess(false), 3000); // Hide after 3 seconds
      
      console.log(`Complaint status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      // Show error message (you can add a toast notification here)
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Add a test function
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch('http://localhost:5000/api/admin/dashboard/test');
      const data = await response.json();
      console.log('Test response:', data);
      alert('API test successful: ' + JSON.stringify(data));
    } catch (error) {
      console.error('API test failed:', error);
      alert('API test failed: ' + error.message);
    }
  };

  // Add authentication check function
  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const token = localStorage.getItem('token') || 'No token found';
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Try to get user profile
      const response = await api.auth.getProfile();
      console.log('Auth response:', response.data);
      alert('Auth status: ' + JSON.stringify(response.data));
    } catch (error) {
      console.error('Auth check failed:', error);
      alert('Auth check failed: ' + (error.response?.data?.error || error.message));
    }
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
              variant="outlined"
              onClick={testApiConnection}
              sx={{ mr: 2 }}
            >
              Test API
            </Button>
            <Button
              variant="outlined"
              onClick={checkAuthStatus}
              sx={{ mr: 2 }}
            >
              Check Auth
            </Button>
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
            <Tab label="Activity Logs" />
          </Tabs>
        </Paper>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <>
            {/* Stats Grid */}
            <Grid container spacing={3}>
              {dashboardLoading ? (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                </Grid>
              ) : dashboardError ? (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center" p={4}>
                    <Typography variant="h6" color="error">{dashboardError}</Typography>
                  </Box>
                </Grid>
              ) : dashboardStats?.stats ? (
                dashboardStats.stats.map((stat, index) => (
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
                            {stat.icon === 'Domain' && <Domain />}
                            {stat.icon === 'SupervisorAccount' && <SupervisorAccount />}
                            {stat.icon === 'People' && <People />}
                            {stat.icon === 'Notifications' && <Notifications />}
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
                ))
              ) : (
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="center" p={4}>
                    <Typography variant="h6" color="text.secondary">No data available</Typography>
                  </Box>
                </Grid>
              )}

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
                    {dashboardLoading ? (
                      <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                      </Box>
                    ) : dashboardError ? (
                      <Box display="flex" justifyContent="center" p={4}>
                        <Typography variant="h6" color="error">{dashboardError}</Typography>
                      </Box>
                    ) : (
                      <Bar
                        data={dashboardCharts?.departmentPerformance}
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
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Recent Activities */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Recent Activities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recentActivitiesTotal} total
                    </Typography>
                  </Box>
                  {dashboardLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : dashboardError ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <Typography variant="h6" color="error">{dashboardError}</Typography>
                    </Box>
                  ) : dashboardStats?.recentActivities ? (
                    <>
                      <List sx={{ minHeight: 300 }}>
                        {dashboardStats.recentActivities.map((activity, index) => (
                          <React.Fragment key={index}>
                            <ListItem alignItems="flex-start">
                              <ListItemIcon>
                                {activity.icon === 'Settings' && <Settings color="primary" />}
                                {activity.icon === 'Assignment' && <Assignment color="secondary" />}
                                {activity.icon === 'CheckCircle' && <CheckCircle color="success" />}
                                {!['Settings', 'Assignment', 'CheckCircle'].includes(activity.icon) && <Assignment color="action" />}
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
                            {index < dashboardStats.recentActivities.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                      
                      {/* Pagination */}
                      {recentActivitiesTotal > recentActivitiesLimit && (
                        <Box display="flex" justifyContent="center" mt={2}>
                          <Pagination
                            count={Math.ceil(recentActivitiesTotal / recentActivitiesLimit)}
                            page={recentActivitiesPage}
                            onChange={(event, page) => setRecentActivitiesPage(page)}
                            size="small"
                            color="primary"
                            showFirstButton
                            showLastButton
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box display="flex" justifyContent="center" p={4}>
                      <Typography variant="body2" color="text.secondary">No recent activities</Typography>
                    </Box>
                  )}
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
                  {dashboardLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : dashboardError ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <Typography variant="h6" color="error">{dashboardError}</Typography>
                    </Box>
                  ) : (
                    <Line
                      data={dashboardCharts?.userActivity}
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
                  )}
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

        {/* Activity Logs Tab */}
        {tabValue === 3 && (
          <Box>
            {/* Search and Filter Bar */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search activity logs by action, user, or module..."
                    value={logsSearchTerm}
                    onChange={(e) => setLogsSearchTerm(e.target.value)}
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
                    <InputLabel>Module Filter</InputLabel>
                    <Select
                      value={logsModuleFilter}
                      label="Module Filter"
                      onChange={(e) => setLogsModuleFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Modules</MenuItem>
                      <MenuItem value="Complaints">Complaints</MenuItem>
                      <MenuItem value="Subadmins">Subadmins</MenuItem>
                      <MenuItem value="Departments">Departments</MenuItem>
                      <MenuItem value="Users">Users</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={fetchActivityLogs}
                    disabled={logsLoading}
                  >
                    {logsLoading ? <CircularProgress size={20} /> : 'Refresh'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Activity Logs Grid */}
            {logsLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredActivityLogs.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        No activity logs found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {logsSearchTerm || logsModuleFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'No activity logs available yet'
                        }
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  filteredActivityLogs.map((log, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                              {getActivityIcon(log.module)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                <strong>{log.user?.name || 'System'}:</strong> {log.action}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Module: {log.module}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Timestamp: {formatDate(log.timestamp)}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton size="small">
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
            
            {/* Pagination */}
            {logsTotalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={logsTotalPages}
                  page={logsPage}
                  onChange={(e, newPage) => setLogsPage(newPage)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
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

                {/* Status Change Section for Superadmin */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Update Status
                  </Typography>
                  
                  {statusUpdateSuccess && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
                      <Typography variant="body2" color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle fontSize="small" />
                        Status updated successfully!
                      </Typography>
                    </Box>
                  )}
                  
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant={selectedComplaint.status === 'Pending' ? 'contained' : 'outlined'}
                      color="warning"
                      size="small"
                      disabled={statusChangeLoading || selectedComplaint.status === 'Pending'}
                      onClick={() => updateComplaintStatus(selectedComplaint.complaint_id, 'Pending')}
                    >
                      {statusChangeLoading ? <CircularProgress size={16} /> : 'Set Pending'}
                    </Button>
                    <Button
                      variant={selectedComplaint.status === 'InProgress' ? 'contained' : 'outlined'}
                      color="info"
                      size="small"
                      disabled={statusChangeLoading || selectedComplaint.status === 'InProgress'}
                      onClick={() => updateComplaintStatus(selectedComplaint.complaint_id, 'InProgress')}
                    >
                      {statusChangeLoading ? <CircularProgress size={16} /> : 'Set In Progress'}
                    </Button>
                    <Button
                      variant={selectedComplaint.status === 'Complete' ? 'contained' : 'outlined'}
                      color="success"
                      size="small"
                      disabled={statusChangeLoading || selectedComplaint.status === 'Complete'}
                      onClick={() => updateComplaintStatus(selectedComplaint.complaint_id, 'Complete')}
                    >
                      {statusChangeLoading ? <CircularProgress size={16} /> : 'Set Complete'}
                    </Button>
                    <Button
                      variant={selectedComplaint.status === 'Rejected' ? 'contained' : 'outlined'}
                      color="error"
                      size="small"
                      disabled={statusChangeLoading || selectedComplaint.status === 'Rejected'}
                      onClick={() => updateComplaintStatus(selectedComplaint.complaint_id, 'Rejected')}
                    >
                      {statusChangeLoading ? <CircularProgress size={16} /> : 'Set Rejected'}
                    </Button>
                  </Box>
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
