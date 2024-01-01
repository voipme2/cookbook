import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import Layout from "./components/Layout";
import Home from "./components/Home";
import NewRecipe from "./components/NewRecipe";
import ListRecipes from "./components/ListRecipes";
import ViewRecipe from "./components/ViewRecipe/ViewRecipe";
import PrintRecipe from "./components/PrintRecipe";
import ModifyRecipe from "./components/ModifyRecipe";
import DownloadRecipe from "./components/DownloadRecipe";
import Import from "./components/Import";
import { store } from "./store";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#536f84" },
    secondary: { main: "#846753" },
    success: { main: "#675384" },
  },
});

function App() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <BrowserRouter>
            <div className="App">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="new" element={<NewRecipe />} />
                  <Route path="list" element={<ListRecipes />} />
                  <Route path="view/:recipeId" element={<ViewRecipe />} />
                  <Route path="import" element={<Import />} />
                  <Route path="print/:recipeId" element={<PrintRecipe />} />
                  <Route path="edit/:recipeId" element={<ModifyRecipe />} />
                  <Route path="download" element={<DownloadRecipe />} />
                </Route>
              </Routes>
            </div>
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </>
  );
}

export default App;
