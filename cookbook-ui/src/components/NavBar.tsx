import React, {useState} from 'react';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {Add, Download, Home, Menu, Search} from '@mui/icons-material';
import {SearchBox} from './SearchBox';

interface NavItem {
  name: string;
  path: string;
  icon: typeof Home;
  color: 'primary' | 'secondary' | 'success';
}

const navItems: NavItem[] = [
  {name: 'Home', path: '/', icon: Home, color: 'primary'},
  {name: 'New', path: '/new', icon: Add, color: 'secondary'},
  {name: 'Download', path: '/import', icon: Download, color: 'success'},
];

export default function NavBar({showSearch}: { showSearch?: boolean }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSearchToggle = () => setSearchOpen(!searchOpen);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{mx: 2}}>
      <Typography variant="h6" sx={{my: 2}}>
        cookbook
      </Typography>
      <Divider/>
      <List>
        {navItems.map(({name, icon: Icon, color, path}) => (
          <ListItemButton
            key={name}
            sx={{color: 'white', bgcolor: `${color}.main`}}
            onClick={() => navigate(path)}
          >
            <ListItemIcon>
              <Icon/>
            </ListItemIcon>
            <ListItemText primary={name}/>
          </ListItemButton>
        ))}
        {showSearch && (
          <ListItemButton onClick={handleSearchToggle}>
            <ListItemIcon>
              <Search/>
            </ListItemIcon>
            <ListItemText primary="Search"/>
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <Box>
      <AppBar position="static" component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{mr: 2, display: {sm: 'none'}}}
          >
            <Menu/>
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              textAlign: 'left',
              flexGrow: 1,
              display: {xs: 'none', sm: 'block'},
            }}
          >
            cookbook
          </Typography>
          <Box sx={{display: {xs: 'none', sm: 'block'}}}>
            {navItems.map((item) => (
              <Button
                sx={{mx: 1}}
                key={item.name}
                color={item.color}
                variant="contained"
                onClick={() => navigate(item.path)}
                startIcon={<item.icon/>}
              >
                {item.name}
              </Button>
            ))}
          </Box>
          <div style={{flexGrow: 1}}/>
          {showSearch && (
            <IconButton
              aria-label="search"
              edge="end"
              onClick={handleSearchToggle}
              sx={{display: {xs: 'block', sm: 'none'}}}
            >
              <Search/>
            </IconButton>
          )}
          <Box component="nav">
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: {xs: 'block', sm: 'none'},
                '& .MuiDrawer-paper': {boxSizing: 'border-box', width: 240},
              }}
            >
              {drawer}
            </Drawer>
          </Box>
          {showSearch && (
            <IconButton
              color="inherit"
              aria-label="search"
              edge="end"
              onClick={handleSearchToggle}
              sx={{display: {xs: 'none', sm: 'block'}}}
            >
              <Search/>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      {showSearch && searchOpen && (
        <Box sx={{p: 2}}>
          <SearchBox/>
        </Box>
      )}
    </Box>
  );
}