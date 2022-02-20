import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  recipe: {
    ingredients: [],
    steps: [],
    description: "",
    name: "",
    prepTime: "",
    servings: "",
    author: "",
    inactiveTime: "",
    cookTime: "",
    id: "",
    options: {
      isVegetarian: false,
      isVegan: false,
      isDairyFree: false,
      isCrockPot: false,
      isGlutenFree: false
    }
  }
};

export const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    reset: (state) => {
      state.recipe = initialState.recipe;
    },
    load: (state, action) => {
      state.recipe = { ...initialState.recipe, ...action.payload };
    },
    addStep: (state, action) => {
      const { text } = action.payload;
      state.recipe.steps.push({ text });
    },
    removeStep: (state, action) => {
      const { idx } = action.payload;
      state.recipe.steps.splice(idx, 1);
    },
    updateStep: (state, action) => {
      const { idx, text } = action.payload;
      state.recipe.steps[idx] = { text };
    },
    addIngredient: (state, action) => {
      const { text } = action.payload;
      state.recipe.ingredients.push({ text });
    },
    removeIngredient: (state, action) => {
      const { idx } = action.payload;
      state.recipe.ingredients.splice(idx, 1);
    },
    updateIngredient: (state, action) => {
      const { idx, text } = action.payload;
      state.recipe.ingredients[idx] = { text };
    },
    updateField: (state, action) => {
      const { name, value } = action.payload;
      state.recipe[name] = value;
    }
  }
});

export const {
  reset,
  load,
  addStep,
  removeStep,
  updateStep,
  addIngredient,
  removeIngredient,
  updateIngredient,
  updateField
} = builderSlice.actions;

export const getRecipe = state => state.builder.recipe;
export const getId = createSelector(getRecipe, rec => rec.id);
export const getName = createSelector(getRecipe, rec => rec.name);
export const getAuthor = createSelector(getRecipe, rec => rec.author);
export const getDescription = createSelector(getRecipe, rec => rec.description);
export const getServings = createSelector(getRecipe, rec => rec.servings);
export const getPrepTime = createSelector(getRecipe, rec => rec.prepTime);
export const getCookTime = createSelector(getRecipe, rec => rec.cookTime);
export const getInactiveTime = createSelector(getRecipe, rec => rec.inactiveTime);
export const getSteps = createSelector(getRecipe, rec => rec.steps);
export const getIngredients = createSelector(getRecipe, rec => rec.ingredients);

export default builderSlice.reducer;

