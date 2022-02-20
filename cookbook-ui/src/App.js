import './App.css';

import { Routes, Route } from "react-router-dom";

import Layout from './components/Layout';
import Home from './components/Home';
import NewRecipe from './components/NewRecipe';
import ListRecipes from './components/ListRecipes';
import ViewRecipe from './components/ViewRecipe';
import PrintRecipe from './components/PrintRecipe';
import ModifyRecipe from './components/ModifyRecipe';

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="new" element={<NewRecipe />} />
          <Route path="list" element={<ListRecipes /> } />
          <Route path="view/:recipeId" element={<ViewRecipe />} />
          <Route path="print/:recipeId" element={<PrintRecipe />} />
          <Route path="edit/:recipeId" element={<ModifyRecipe />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
