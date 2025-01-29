import React from "react";
import { Box, Container, Paper } from "@mui/material";
import { SearchBox } from "../components/SearchBox";

export const HomeView = () => {
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
        <Paper elevation={6} sx={{ p: 2, width: "100%" }}>
          <SearchBox />
        </Paper>
      </Box>
    </Container>
  );
};
