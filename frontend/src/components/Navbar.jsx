import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Menu, MenuItem, useMediaQuery, useTheme,
  Box, Avatar, Divider, ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Dashboard,
  ExitToApp,
  PersonAdd,
  Business,
  People,
  Assignment,
  Report,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import NotificationBell from './NotificationBell';
 import { useAuth } from '../context/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material';
import { useTheme as useAppTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const muiTheme = useMuiTheme();
  const { darkMode, toggleDarkMode } = useAppTheme();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleUserMenu = (event) => setUserMenuAnchor(event.currentTarget);
  const handleAdminMenu = (event) => setAdminMenuAnchor(event.currentTarget);
  
  const handleClose = () => {
    setAnchorEl(null);
    setUserMenuAnchor(null);
    setAdminMenuAnchor(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role_id === 1;
  const isEmployee = user?.role_id === 3;

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleMenu}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit' 
          }}
        >
          CMS Portal
        </Typography>

        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to={`/${user?.role}/dashboard`}
              startIcon={<Dashboard />}
            >
              Dashboard
            </Button>

            {isEmployee && (
              <></>
            )}

            {isAdmin && (
              <></>
            )}
          </Box>
        )}

        <NotificationBell />
        {/* Dark mode toggle */}
        <IconButton color="inherit" onClick={toggleDarkMode} sx={{ ml: 1 }}>
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
        <IconButton 
          color="inherit" 
          onClick={handleUserMenu}
          sx={{ ml: 2 }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            <Person />
          </Avatar>
        </IconButton>

        {/* Mobile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem 
            component={Link} 
            to={`/${user?.role}/dashboard`}
            onClick={handleClose}
          >
            <ListItemIcon>
              <Dashboard fontSize="small" />
            </ListItemIcon>
            Dashboard
          </MenuItem>
          
          {isEmployee && (
            <></>
          )}

          {isAdmin && (
            <></>
          )}
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleClose}
        >
          <MenuItem 
            component={Link}
            to="/profile"
            onClick={handleClose}
          >
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={handleLogout}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <ExitToApp fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
