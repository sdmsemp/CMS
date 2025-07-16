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
  Settings,
  Person
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
  const [departmentFilter, setDepartmentFilter] = useState('all');
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

  // Add user management state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Add subadmin tasks state
  const [subadminTasks, setSubadminTasks] = useState([]);
  const [subadminTasksLoading, setSubadminTasksLoading] = useState(false);
  const [subadminTasksError, setSubadminTasksError] = useState(null);
  const [subadminTasksPage, setSubadminTasksPage] = useState(1);
  const [subadminTasksTotalPages, setSubadminTasksTotalPages] = useState(0);
  const [subadminTasksDeptFilter, setSubadminTasksDeptFilter] = useState('all');
  const [departments, setDepartments] = useState([]);

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
      if (departmentFilter !== 'all') {
        params.dept_id = departmentFilter;
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
      if (departments.length === 0) {
        fetchDepartments();
      }
    }
  }, [tabValue, statusFilter, departmentFilter]);

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

  // Add fetch users function
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await api.admin.getAllUsers();
      setUsers(response.data.data || []);
      setFilteredUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Add useEffect for users tab
  useEffect(() => {
    if (tabValue === 4) { // Users tab
      fetchUsers();
    }
  }, [tabValue]);

  // Add fetch subadmin tasks function
  const fetchSubadminTasks = async () => {
    setSubadminTasksLoading(true);
    setSubadminTasksError(null);
    try {
      const params = {
        page: subadminTasksPage,
        limit: 20
      };
      if (subadminTasksDeptFilter !== 'all') {
        params.dept_id = subadminTasksDeptFilter;
      }
      const response = await api.admin.getAllSubadminTasks(params);
      setSubadminTasks(response.data.data.tasks || []);
      setSubadminTasksTotalPages(response.data.data.pagination.totalPages || 0);
    } catch (error) {
      console.error('Error fetching subadmin tasks:', error);
      setSubadminTasksError('Failed to fetch subadmin tasks');
    } finally {
      setSubadminTasksLoading(false);
    }
  };

  // Add fetch departments function
  const fetchDepartments = async () => {
    try {
      const response = await api.departments.getAll();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Add useEffect for subadmin tasks tab
  useEffect(() => {
    if (tabValue === 5) { // Subadmin Tasks tab
      fetchSubadminTasks();
      if (departments.length === 0) {
        fetchDepartments();
      }
    }
  }, [tabValue, subadminTasksPage, subadminTasksDeptFilter]);

  // Add user filtering logic
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (userRoleFilter !== 'all') {
      filtered = filtered.filter(user => user.role_id === parseInt(userRoleFilter));
    }

    setFilteredUsers(filtered);
  }, [users, userSearchTerm, userRoleFilter]);

  // Filter complaints based on search term and department
  const filteredComplaints = complaintsList.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.User?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
                             complaint.dept_id === parseInt(departmentFilter);
    
    return matchesSearch && matchesDepartment;
  });

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
      case 'complaint': return <Report />;
      case 'subadmintask': return <SupervisorAccount />;
      case 'admin': return <Settings />;
      case 'auth': return <Person />;
      case 'role': return <Assignment />;
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

  // Add helper functions for user display
  const getRoleDisplayName = (roleId) => {
    switch (roleId) {
      case 1: return 'Admin';
      case 2: return 'Subadmin';
      case 3: return 'User';
      default: return 'Unknown';
    }
  };

  const getRoleColor = (roleId) => {
    switch (roleId) {
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'default';
      default: return 'default';
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
            <Tab label="Users" />
            <Tab label="Subadmin Tasks" />
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
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12}>
              <Paper sx={{ p: 3, maxWidth: 1000, mx: 'auto', width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  User Activity Trends
                </Typography>
                <Box height={400} width="100%" maxWidth={900} mx="auto">
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
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={2}>
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
                  <FormControl fullWidth>
                    <InputLabel>Department Filter</InputLabel>
                    <Select
                      value={departmentFilter}
                      label="Department Filter"
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Departments</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.dept_id} value={dept.dept_id}>
                          {dept.name}
                        </MenuItem>
                      ))}
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

            {/* Complaints Summary */}
            {!loading && filteredComplaints.length > 0 && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" color="text.secondary">
                    Complaints Summary:
                    {departmentFilter !== 'all' && (
                      <span style={{ color: 'primary.main', fontWeight: 'normal' }}>
                        {' '}({departments.find(d => d.dept_id === parseInt(departmentFilter))?.name || 'Unknown Department'})
                      </span>
                    )}
                  </Typography>
                  <Chip 
                    label={`${filteredComplaints.filter(c => c.status === 'Pending').length} Pending`}
                    color="error"
                    size="small"
                    sx={{
                      animation: filteredComplaints.filter(c => c.status === 'Pending').length > 0 ? 'blink 2s infinite' : 'none',
                      '@keyframes blink': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  />
                  <Chip 
                    label={`${filteredComplaints.filter(c => c.status === 'InProgress').length} In Progress`}
                    color="info"
                    size="small"
                  />
                  <Chip 
                    label={`${filteredComplaints.filter(c => c.status === 'Complete').length} Completed`}
                    color="success"
                    size="small"
                  />
                  <Chip 
                    label={`${filteredComplaints.filter(c => c.status === 'Rejected').length} Rejected`}
                    color="warning"
                    size="small"
                  />
                </Box>
              </Paper>
            )}

            {/* Complaints Grid */}
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3} justifyContent="center">
                {filteredComplaints.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        No complaints found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                          ? 'Try adjusting your search or filter criteria'
                          : 'No complaints have been submitted yet'
                        }
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={complaint.complaint_id} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          minWidth: 340,
                          maxWidth: 380,
                          width: '100%',
                          boxSizing: 'border-box',
                          transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                          boxShadow: 2,
                          borderRadius: 3,
                          border: complaint.status === 'Pending' ? '2px solid' : 'none',
                          borderColor: complaint.status === 'Pending' ? 'error.main' : 'transparent',
                          animation: complaint.status === 'Pending' ? 'blink 2s infinite' : 'none',
                          '@keyframes blink': {
                            '0%': {
                              borderColor: 'error.main',
                              boxShadow: '0 0 5px rgba(211, 47, 47, 0.3)'
                            },
                            '50%': {
                              borderColor: 'error.light',
                              boxShadow: '0 0 15px rgba(211, 47, 47, 0.6)'
                            },
                            '100%': {
                              borderColor: 'error.main',
                              boxShadow: '0 0 5px rgba(211, 47, 47, 0.3)'
                            }
                          },
                          '&:hover': {
                            transform: 'translateY(-6px) scale(1.03)',
                            boxShadow: complaint.status === 'Pending' ? 8 : 6,
                            borderColor: complaint.status === 'Pending' ? 'error.main' : 'primary.main',
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
                              sx={{
                                position: 'relative',
                                '&::before': complaint.status === 'Pending' ? {
                                  content: '""',
                                  position: 'absolute',
                                  top: '-2px',
                                  right: '-2px',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: 'error.main',
                                  animation: 'pulse 1.5s infinite',
                                  '@keyframes pulse': {
                                    '0%': {
                                      transform: 'scale(1)',
                                      opacity: 1
                                    },
                                    '50%': {
                                      transform: 'scale(1.5)',
                                      opacity: 0.7
                                    },
                                    '100%': {
                                      transform: 'scale(1)',
                                      opacity: 1
                                    }
                                  }
                                } : {}
                              }}
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
                              <strong>By:</strong> {complaint.User?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(complaint.created_at)}
                            </Typography>
                          </Box>

                          {complaint.status_by && complaint.StatusByUser && (
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Status Changed By:</strong> {complaint.StatusByUser.name || 'Unknown'}
                              </Typography>
                              <Chip
                                label={getRoleDisplayName(complaint.StatusByUser.role_id)}
                                color={getRoleColor(complaint.StatusByUser.role_id)}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          )}

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
                    placeholder="Search activity logs..."
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
                      <MenuItem value="Complaint">Complaints</MenuItem>
                      <MenuItem value="SubadminTask">Subadmin Tasks</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="Auth">Authentication</MenuItem>
                      <MenuItem value="Role">Roles</MenuItem>
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

            {/* Activity Logs List */}
            {logsLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Logs Count */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="text.secondary">
                    {filteredActivityLogs.length} activity logs
                  </Typography>
                  {logsSearchTerm || logsModuleFilter !== 'all' && (
                    <Chip 
                      label="Filtered" 
                      color="primary" 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Activity Logs */}
                {filteredActivityLogs.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      <Assignment sx={{ fontSize: 48, color: 'text.secondary' }} />
                    </Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No activity logs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {logsSearchTerm || logsModuleFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'No activity logs available yet'
                      }
                    </Typography>
                  </Paper>
                ) : (
                  <Box>
                    {filteredActivityLogs.map((log, index) => (
                      <Paper 
                        key={index} 
                        sx={{ 
                          p: 3, 
                          mb: 2, 
                          borderRadius: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        <Box display="flex" alignItems="flex-start" gap={2}>
                          {/* Icon */}
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main', 
                              width: 48, 
                              height: 48,
                              mt: 0.5
                            }}
                          >
                            {getActivityIcon(log.module)}
                          </Avatar>
                          
                          {/* Content */}
                          <Box flex={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {log.user?.name || 'System'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(log.timestamp)}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.primary" mb={1}>
                              {log.action}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={2}>
                              <Chip 
                                label={log.module} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {log.user?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
                
                {/* Pagination */}
                {logsTotalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Paper sx={{ p: 2 }}>
                      <Pagination
                        count={logsTotalPages}
                        page={logsPage}
                        onChange={(e, newPage) => setLogsPage(newPage)}
                        color="primary"
                        showFirstButton
                        showLastButton
                        size="large"
                      />
                    </Paper>
                  </Box>
                )}
              </>
            )}
                </Box>
              )}

        {/* Subadmin Tasks Tab */}
        {tabValue === 5 && (
          <Box>
            {/* Search and Filter Bar */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Subadmin Tasks Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor and track tasks assigned to subadmins across departments
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Department Filter</InputLabel>
                    <Select
                      value={subadminTasksDeptFilter}
                      label="Department Filter"
                      onChange={(e) => setSubadminTasksDeptFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Departments</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.dept_id} value={dept.dept_id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={fetchSubadminTasks}
                    disabled={subadminTasksLoading}
                  >
                    {subadminTasksLoading ? <CircularProgress size={20} /> : 'Refresh'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Subadmin Tasks Display */}
            {subadminTasksLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : subadminTasksError ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography variant="h6" color="error">{subadminTasksError}</Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {subadminTasks.length === 0 ? (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                          No subadmin tasks found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subadminTasksDeptFilter !== 'all' 
                            ? 'Try adjusting your filter criteria'
                            : 'No tasks have been assigned to subadmins yet'
                          }
                        </Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    subadminTasks.map((task, index) => (
                      <Grid item xs={12} md={6} key={task.task_id || index}>
                        <Card sx={{ 
                          height: '100%',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3
                          }
                        }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                              <Typography variant="h6" color="primary">
                                Task #{task.task_id}
                              </Typography>
                              <Chip
                                label={task.Complaint?.status || 'Unknown'}
                                color={getStatusColor(task.Complaint?.status)}
                                size="small"
                              />
                            </Box>
                            
                            <Box mb={2}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Complaint Details:
                              </Typography>
                              <Typography variant="body1" gutterBottom>
                                {task.Complaint?.title || 'No title'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {task.Complaint?.description || 'No description'}
                              </Typography>
                            </Box>

                            <Box mb={2}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Task Description:
                              </Typography>
                              <Typography variant="body2">
                                {task.description || 'No task description'}
                              </Typography>
                            </Box>

                            <Box display="flex" flexDirection="column" gap={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <SupervisorAccount fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Subadmin:</strong> {task.User?.name || 'Unknown'}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" alignItems="center" gap={1}>
                                <Business fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Department:</strong> {task.User?.Department?.name || 'Unknown'}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" alignItems="center" gap={1}>
                                <Person fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Complaint By:</strong> {task.Complaint?.User?.name || 'Unknown'}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1}>
                                {getSeverityIcon(task.Complaint?.severity)}
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Severity:</strong> {task.Complaint?.severity || 'Unknown'}
                                </Typography>
                              </Box>

                              <Box display="flex" alignItems="center" gap={1}>
                                <CalendarToday fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Created:</strong> {formatDate(task.Complaint?.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              startIcon={<Visibility />}
                              onClick={() => {
                                setSelectedComplaint(task.Complaint);
                                setDialogOpen(true);
                              }}
                            >
                              View Complaint
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>

                {/* Pagination */}
                {subadminTasksTotalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={subadminTasksTotalPages}
                      page={subadminTasksPage}
                      onChange={(event, page) => setSubadminTasksPage(page)}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
            
            {/* Subadmin Tasks Statistics */}
            {!subadminTasksLoading && !subadminTasksError && subadminTasks.length > 0 && (
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tasks Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Total Tasks:</strong> {subadminTasks.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Pending:</strong> {subadminTasks.filter(t => t.Complaint?.status === 'Pending').length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>In Progress:</strong> {subadminTasks.filter(t => t.Complaint?.status === 'InProgress').length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Completed:</strong> {subadminTasks.filter(t => t.Complaint?.status === 'Complete').length}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        )}

        {/* Users Tab */}
        {tabValue === 4 && (
          <Box>
            {/* Search and Filter Bar */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search users by name or email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
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
                    <InputLabel>Role Filter</InputLabel>
                    <Select
                      value={userRoleFilter}
                      label="Role Filter"
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value={1}>Admin</MenuItem>
                      <MenuItem value={2}>Subadmin</MenuItem>
                      <MenuItem value={3}>User</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={fetchUsers}
                    disabled={usersLoading}
                  >
                    {usersLoading ? <CircularProgress size={20} /> : 'Refresh'}
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Users Display */}
            {usersLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : usersError ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography variant="h6" color="error">{usersError}</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredUsers.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        No users found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userSearchTerm || userRoleFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'No users available in the system'
                        }
                      </Typography>
            </Paper>
          </Grid>
                ) : (
                  filteredUsers.map((user, index) => (
                    <Grid item xs={12} sm={6} md={4} key={user.emp_id || index}>
                      <Card sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                              {user.name ? user.name[0].toUpperCase() : 'U'}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="h6" noWrap>
                                {user.name || 'Unknown'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {user.email || 'No email'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box display="flex" flexDirection="column" gap={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={getRoleDisplayName(user.role_id)}
                                color={getRoleColor(user.role_id)}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            
                            <Box display="flex" alignItems="center" gap={1}>
                              <Business fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {user.Department?.name || 'No Department'}
                              </Typography>
                            </Box>
                            
                            <Box display="flex" alignItems="center" gap={1}>
                              <Person fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                ID: {user.emp_id || 'N/A'}
              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            startIcon={<Visibility />}
                            onClick={() => navigate('/admin/users')}
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
            
            {/* User Statistics */}
            {!usersLoading && !usersError && users.length > 0 && (
              <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                  User Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Total Users:</strong> {users.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Admins:</strong> {users.filter(u => u.role_id === 1).length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Subadmins:</strong> {users.filter(u => u.role_id === 2).length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Regular Users:</strong> {users.filter(u => u.role_id === 3).length}
              </Typography>
                  </Grid>
                </Grid>
              </Paper>
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
                    {selectedComplaint.User?.name || 'Unknown'}
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
                    {selectedComplaint.status !== 'Rejected' && (
                      <Button
                        variant={selectedComplaint.status === 'Rejected' ? 'contained' : 'outlined'}
                        color="error"
                        size="small"
                        disabled={statusChangeLoading}
                        onClick={() => updateComplaintStatus(selectedComplaint.complaint_id, 'Rejected')}
                      >
                        {statusChangeLoading ? <CircularProgress size={16} /> : 'Set Rejected'}
                      </Button>
                    )}
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
