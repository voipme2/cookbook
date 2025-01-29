import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import NewRecipe from "./components/NewRecipe";
import ModifyRecipe from "./components/ModifyRecipe";
import DownloadRecipe from "./components/DownloadRecipe";
import Import from "./components/Import";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomeView, Layout, PrintView, RecipeView } from "./views";

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
                <Route path="new" element={<NewRecipe />} />
                <Route path="view/:recipeId" element={<RecipeView />} />
                <Route path="import" element={<Import />} />
                <Route path="print/:recipeId" element={<PrintView />} />
                <Route path="edit/:recipeId" element={<ModifyRecipe />} />
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
