import React, { useState } from 'react';
import {alpha, styled} from '@mui/material/styles';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputBase,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';

import {useNavigate} from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({theme}) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({theme}) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

export default function NavBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{mr: 2, display: {xs: 'none', md: 'flex'}}}
          >
            cookbook
          </Typography>
          <Box sx={{flex: 1}}>
            <Button sx={{color: 'white'}} variant="contained" onClick={() => navigate("/")}>Home</Button>
            <Button sx={{color: 'white'}} variant="contained" onClick={() => navigate("/list")}>List</Button>
            <Button sx={{color: 'white'}} variant="contained" onClick={() => navigate("/new")}>New</Button>
            <Button sx={{color: 'white'}} variant="contained" onClick={handleClickOpen}>
              Download
            </Button>
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Fetch</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Fetch a recipe from any website!  Paste the URL, and we'll try to format it.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  id="name"
                  label="URL"
                  type="url"
                  fullWidth
                  variant="standard"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { setOpen(false); navigate(`/download?recipeUrl=${url}`); }}>Go</Button>
              </DialogActions>
            </Dialog>
          </Box>
          <Box sx={{flexGrow: 0}}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon/>
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{'aria-label': 'search'}}
              />
            </Search>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
