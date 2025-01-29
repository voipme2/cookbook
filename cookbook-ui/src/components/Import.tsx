import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Import = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

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
        <Paper elevation={6} sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Fetch a recipe from any website! Paste the URL, and we'll try to
            format it.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            id="name"
            label="URL"
            type="url"
            fullWidth
            variant="standard"
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              navigate(`/download?recipeUrl=${url}`);
            }}
          >
            Go
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
export default Import;
