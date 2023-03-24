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

function App() {
  return (
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
  );
}

export default App;
