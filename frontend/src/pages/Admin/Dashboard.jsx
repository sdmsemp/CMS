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
  Stack
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
  Add as AddIcon
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
      title: 'Total Users',
      value: '04',
      icon: <People />,
      color: 'primary.main',
      trend: '+12%'
    },
    {
      title: 'Active Complaints',
      value: '10',
      icon: <Assignment />,
      color: 'error.main',
      trend: '-5%'
    },
    {
      title: 'Notifications',
      value: '00',
      icon: <Notifications />,
      color: 'warning.main',
      trend: '+8%'
    },
    {
      title: 'Resolved Issues',
      value: '7',
      icon: <TrendingUp />,
      color: 'success.main',
      trend: '+15%'
    }
  ];

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Complaints',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Resolutions',
        data: [28, 48, 40, 19, 86, 27],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const barChartData = {
    labels: ['IT', 'HR', 'Finance', 'Admin', 'Marketing'],
    datasets: [
      {
        label: 'Active Tasks',
        data: [19, 12, 3, 5, 2],
        backgroundColor: 'rgba(53, 162, 235, 0.5)'
      }
    ]
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Dashboard
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

        <Grid container spacing={3}>
          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Avatar sx={{ bgcolor: stat.color }}>
                      {stat.icon}
                    </Avatar>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h4" sx={{ my: 2 }}>
                    {stat.value}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={stat.trend.startsWith('+') ? 'success.main' : 'error.main'}
                    >
                      {stat.trend}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Charts */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ mb: 3 }}
              >
                <Tab label="Complaints Overview" />
                <Tab label="Department Analysis" />
              </Tabs>

              {tabValue === 0 && (
                <Box height={300}>
                  <Line
                    data={lineChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Complaints vs Resolutions'
                        }
                      }
                    }}
                  />
                </Box>
              )}

              {tabValue === 1 && (
                <Box height={300}>
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: 'Tasks by Department'
                        }
                      }
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {/* Add your activity list here */}
            </Paper>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Box my={2}>
                <Typography variant="body2" gutterBottom>
                  Response Time
                </Typography>
                <LinearProgress variant="determinate" value={75} sx={{ mb: 2 }} />
                
                <Typography variant="body2" gutterBottom>
                  Resolution Rate
                </Typography>
                <LinearProgress variant="determinate" value={85} sx={{ mb: 2 }} />
                
                <Typography variant="body2" gutterBottom>
                  User Satisfaction
                </Typography>
                <LinearProgress variant="determinate" value={92} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
