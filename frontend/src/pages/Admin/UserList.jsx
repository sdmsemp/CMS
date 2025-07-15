import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Stack,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList
} from '@mui/icons-material';
import Table from '../../components/Table';
import { admin } from '../../services/api';

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debouncing search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await admin.getAllUsers();
        setUsers(res.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term and role filter
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role_id === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, debouncedSearchTerm, roleFilter]);

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

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  const columns = [
    {
      field: 'name',
      headerName: 'User',
      flex: 2,
      renderCell: (row) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {row.name ? row.name[0].toUpperCase() : 'U'}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={500}>
              {row.name || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.email || 'N/A'}
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
          label={getRoleDisplayName(row.role_id)}
          color={getRoleColor(row.role_id)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      renderCell: (row) => (
        <Typography variant="body2">
          {row.Department?.name || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (row) => (
        <Chip
          label={row.status || 'Active'}
          color={getStatusColor(row.status)}
          size="small"
          variant="outlined"
        />
      )
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
          User Management
        </Typography>

        <Paper sx={{ p: 3 }}>
          {/* Search and Filter Section */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Typography variant="h6" component="h2">
              All Users ({filteredUsers.length})
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { sm: '400px' } }}>
              <TextField
                placeholder="Search users..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper', borderRadius: 1 }}>
                <InputLabel>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FilterList fontSize="small" />
                    Role
                  </Box>
                </InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value={1}>Admin</MenuItem>
                  <MenuItem value={2}>Subadmin</MenuItem>
                  <MenuItem value={3}>User</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading users...</Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary" gutterBottom>
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filters' : 'No users in the system'}
              </Typography>
            </Box>
          ) : (
            <Table
              columns={columns}
              data={filteredUsers}
              title=""
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UserList;
