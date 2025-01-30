import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import DownloadRecipe from "./components/DownloadRecipe";
import Import from "./components/Import";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  EditView,
  HomeView,
  Layout,
  NewRecipeView,
  PrintView,
  RecipeView,
} from "./views";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#536f84" },
    secondary: { main: "#846753" },
    success: { main: "#675384" },
  },
});

function App() {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomeView />} />
                <Route path="new" element={<NewRecipeView />} />
                <Route path="view/:recipeId" element={<RecipeView />} />
                <Route path="import" element={<Import />} />
                <Route path="print/:recipeId" element={<PrintView />} />
                <Route path="edit/:recipeId" element={<EditView />} />
                <Route path="download" element={<DownloadRecipe />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
