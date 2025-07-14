import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Avatar
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Block
} from '@mui/icons-material';
import Table from '../../components/Table';
import { admin } from '../../services/api';

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await admin.getAllUsers();
        setUsers(res.data.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    {
      field: 'name',
      headerName: 'User',
      flex: 2,
      renderCell: (row) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar>{row.name[0]}</Avatar>
          <Box>
            <Typography>{row.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      renderCell: (row) => (
        <Chip
          label={row.role}
          color={
            row.role === 'admin' ? 'error' :
            row.role === 'subadmin' ? 'warning' :
            'default'
          }
          size="small"
        />
      )
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (row) => (
        <Chip
          label={row.status}
          color={row.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (row) => (
        <IconButton
          onClick={(e) => {
            setSelectedUser(row);
            setFilterAnchor(e.currentTarget);
          }}
        >
          <MoreVert />
        </IconButton>
      )
    }
  ];

  // Remove the sample data, use fetched users
  // const users = [ ... ];

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
    setFilterAnchor(null);
  };

  const handleDelete = (user) => {
    // Add delete logic
    setFilterAnchor(null);
  };

  const handleBlock = (user) => {
    // Add block logic
    setFilterAnchor(null);
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Users</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add User
          </Button>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              fullWidth
              placeholder="Search users..."
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
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="subadmin">Subadmin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Typography>Loading users...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Table
              columns={columns}
              data={users}
              title="User List"
            />
          )}
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
        >
          <MenuItem onClick={() => handleEdit(selectedUser)}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => handleBlock(selectedUser)}>
            <Block sx={{ mr: 1 }} /> Block
          </MenuItem>
          <MenuItem
            onClick={() => handleDelete(selectedUser)}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Edit/Add Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setSelectedUser(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box py={2}>
              <TextField
                fullWidth
                label="Name"
                defaultValue={selectedUser?.name}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                defaultValue={selectedUser?.email}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  defaultValue={selectedUser?.role || 'user'}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="subadmin">Subadmin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  defaultValue={selectedUser?.department || ''}
                >
                  <MenuItem value="it">IT</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default UserList;
