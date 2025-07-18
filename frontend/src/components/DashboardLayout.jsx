import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  CssBaseline,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People'; // For User role
import BugReportIcon from '@mui/icons-material/BugReport'; // For Analyst role
import SettingsIcon from '@mui/icons-material/Settings'; // For IT role

const drawerWidth = 240;

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const theme = useTheme(); // Access the current theme (light/dark)
  const [open, setOpen] = useState(false); // For mobile drawer
  const [anchorEl, setAnchorEl] = useState(null); // For user menu

  const userRole = localStorage.getItem('role');
  const username = localStorage.getItem('username'); // Assuming you store username on login
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Redirect if not authenticated or role mismatch
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    { text: 'User Dashboard', path: '/user', icon: <PeopleIcon />, roles: ['User'] },
    { text: 'Analyst Dashboard', path: '/analyst', icon: <BugReportIcon />, roles: ['Analyst'] },
    { text: 'IT Dashboard', path: '/it', icon: <SettingsIcon />, roles: ['IT'] },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#212121' : theme.palette.primary.main,
          boxShadow: theme.shadows[3],
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Threat Tracker
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              {username || 'Guest'} ({userRole})
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : theme.palette.grey[100],
            color: theme.palette.text.primary,
          },
          display: { xs: 'none', sm: 'block' }, // Hide on small screens
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main }}>
            Navigation
          </Typography>
          <List>
            {menuItems.map((item) =>
              item.roles.includes(userRole) && (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.main }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.mode === 'dark' ? '#2C2C2C' : theme.palette.grey[100],
            color: theme.palette.text.primary,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: theme.palette.primary.main }}>
            Navigation
          </Typography>
          <List>
            {menuItems.map((item) =>
              item.roles.includes(userRole) && (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => { navigate(item.path); handleDrawerToggle(); }} // Close drawer on click
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.main }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: `${theme.mixins.toolbar.minHeight}px`, // Adjust for app bar height
          backgroundColor: theme.palette.mode === 'dark' ? '#121212' : theme.palette.background.default,
          minHeight: '100vh',
          color: theme.palette.text.primary,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;