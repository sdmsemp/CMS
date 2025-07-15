import { useState } from 'react';
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
  Divider
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
  AccessTime
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
import React from 'react'; // Added missing import for React

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

              {tabValue === 0 && (
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
              )}

              {tabValue === 1 && (
                <Box height={300}>
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
              )}
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
      </Box>
    </Container>
);
};

export default Dashboard;
