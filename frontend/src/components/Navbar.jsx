import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Menu, MenuItem, useMediaQuery, useTheme,
  Box, Avatar, Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Dashboard,
  ExitToApp
} from '@mui/icons-material';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleUserMenu = (event) => setUserMenuAnchor(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setUserMenuAnchor(null);
  };

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
              to="/dashboard"
              startIcon={<Dashboard />}
            >
              Dashboard
            </Button>
          </Box>
        )}

        <NotificationBell />

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
            to="/dashboard" 
            onClick={handleClose}
          >
            <Dashboard sx={{ mr: 1 }} /> Dashboard
          </MenuItem>
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>
            <Person sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              handleClose();
              // Add logout logic
            }}
            sx={{ color: 'error.main' }}
          >
            <ExitToApp sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
