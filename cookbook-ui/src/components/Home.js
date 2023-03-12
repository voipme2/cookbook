import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  List,
  ListItemButton,
  ListItemText,
  LinearProgress,
  InputAdornment,
  Paper,
  TextField,
} from "@mui/material";
import { useSearchQuery } from "../services/api";
import { Search } from "@mui/icons-material";

const Results = ({ query }) => {
  const { data, isLoading, isFetching } = useSearchQuery(query);
  const navigate = useNavigate();

  return (
    <List>
      {(isLoading || isFetching) && <LinearProgress />}
      {data &&
        !isLoading &&
        data.map((s) => (
          <ListItemButton onClick={() => navigate(`/view/${s.id}`)} key={s.id}>
            <ListItemText primary={s.name} />
          </ListItemButton>
        ))}
    </List>
  );
};

const Home = () => {
  const [query, setQuery] = useState("");
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={6} sx={{ p: 2 }}>
          <TextField
            fullWidth
            sx={{ mb: 2 }}
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
            <Results query={query} />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;
