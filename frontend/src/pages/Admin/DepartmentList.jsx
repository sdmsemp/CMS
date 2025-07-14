import { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Chip,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add,
  Business,
  Edit,
  Delete,
  Person,
  Assignment,
  MoreVert
} from '@mui/icons-material';

const DepartmentList = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sample data - replace with your actual data
  const departments = [
    {
      id: 1,
      name: 'IT Department',
      employeeCount: 15,
      activeComplaints: 5,
      subadmin: 'John Doe',
      status: 'active'
    },
    // Add more departments...
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add your submit logic here
      setSuccess('Department saved successfully!');
      setOpenDialog(false);
      setSelectedDept(null);
    } catch (err) {
      setError(err.message || 'Failed to save department');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Departments</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Department
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {departments.map((dept) => (
            <Grid item xs={12} sm={6} md={4} key={dept.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Business />
                      </Avatar>
                      <Typography variant="h6">{dept.name}</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedDept(dept);
                        setOpenDialog(true);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">
                        {dept.employeeCount} Employees
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Assignment fontSize="small" color="action" />
                      <Typography variant="body2">
                        {dept.activeComplaints} Active Complaints
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">
                        Subadmin: {dept.subadmin}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Chip
                        label={dept.status}
                        color={dept.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedDept(dept);
                              setOpenDialog(true);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {/* Add delete logic */}}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setSelectedDept(null);
            setError('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {selectedDept ? 'Edit Department' : 'Add Department'}
            </DialogTitle>
            <DialogContent>
              <Box py={2}>
                <TextField
                  fullWidth
                  label="Department Name"
                  defaultValue={selectedDept?.name}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Subadmin Name"
                  defaultValue={selectedDept?.subadmin}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {selectedDept ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default DepartmentList;
