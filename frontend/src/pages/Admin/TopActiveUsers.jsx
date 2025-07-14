import { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Tooltip,
  Stack,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  Person,
  CalendarToday,
  Assignment,
  MoreVert,
  Email,
  Assessment
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';

const TopActiveUsers = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('activity');

  // Sample data - replace with your actual data
  const users = [
    {
      id: 1,
      name: 'John Doe',
      department: 'IT',
      activityScore: 85,
      totalComplaints: 23,
      resolvedComplaints: 20,
      lastActive: '2 hours ago',
      email: 'john@example.com',
      activityHistory: [65, 59, 80, 81, 56, 55, 85]
    },
    // Add more users...
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Activity Score',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <TrendingUp color="primary" />
            <Typography variant="h4">Top Active Users</Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
                size="small"
              >
                <MenuItem value="day">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                label="Metric"
                onChange={(e) => setSelectedMetric(e.target.value)}
                size="small"
              >
                <MenuItem value="activity">Activity Score</MenuItem>
                <MenuItem value="complaints">Complaints Resolved</MenuItem>
                <MenuItem value="response">Response Time</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} md={6} key={user.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{ 
                        width: 56, 
                        height: 56,
                        bgcolor: 'primary.main' 
                      }}
                    >
                      {user.name[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.department}
                      </Typography>
                    </Box>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Activity Score
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <LinearProgress 
                        variant="determinate" 
                        value={user.activityScore} 
                        sx={{ 
                          flex: 1,
                          height: 8, 
                          borderRadius: 4 
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {user.activityScore}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box height={100} mb={2}>
                    <Line
                      data={{
                        labels: chartData.labels,
                        datasets: [{
                          ...chartData.datasets[0],
                          data: user.activityHistory
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100
                          }
                        }
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment fontSize="small" color="primary" />
                        <Tooltip title="Resolved/Total Complaints">
                          <Typography variant="body2">
                            {user.resolvedComplaints}/{user.totalComplaints} Complaints
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {user.lastActive}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Chip
                      icon={<Assessment />}
                      label={`${user.resolvedComplaints}/${user.totalComplaints} Resolved`}
                      color="success"
                      size="small"
                    />
                    <Tooltip title="Send Email">
                      <IconButton size="small">
                        <Email />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default TopActiveUsers;
