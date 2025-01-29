import React from 'react';
import {Box, Button, Container, Paper,} from '@mui/material';
import {SearchBox} from "./SearchBox";
import {Add, Download} from "@mui/icons-material";


const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={6} sx={{p: 2, width: '450px'}}>
          <SearchBox/>
        </Paper>
        <Button variant="contained" sx={{mt: 2}} color="secondary" href="/new" startIcon={<Add/>}>New</Button>
        <Button variant={"contained"} sx={{mt: 2}} color="success" href="/import"
                startIcon={<Download/>}>Download</Button>
      </Box>
    </Container>
  );
};

export default Home;