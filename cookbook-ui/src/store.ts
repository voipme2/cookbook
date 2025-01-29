import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Ingredient, Recipe, Step } from "./types"; // Adjust path as needed

interface RecipeState {
  currentRecipe: Recipe;
  setRecipe: (recipe: Recipe) => void;
  resetRecipe: () => void;
  updateRecipe: (recipe: Partial<Recipe>) => void;
  // Ingredient management
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (index: number) => void;
  updateIngredient: (index: number, updatedIngredient: Ingredient) => void;
  reorderIngredients: (fromIndex: number, toIndex: number) => void;

  // Step management
  addStep: (step: Step) => void;
  removeStep: (index: number) => void;
  updateStep: (index: number, updatedStep: Step) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
}

const useRecipeStore = create<RecipeState>()(
  immer((set) => ({
    currentRecipe: {
      ingredients: [],
      steps: [],
      name: "",
      author: "",
      description: "",
      prepTime: 0,
      cookTime: 0,
      inactiveTime: 0,
    },

    setRecipe: (recipe) =>
      set((state) => {
        state.currentRecipe = recipe;
      }),
    resetRecipe: () =>
      set({
        currentRecipe: {
          ingredients: [],
          steps: [],
          name: "",
          author: "",
          description: "",
          prepTime: 0,
          cookTime: 0,
          inactiveTime: 0,
        },
      }),
    updateRecipe: (recipe) =>
      set((state) => {
        state.currentRecipe = { ...state.currentRecipe, ...recipe };
      }),
    // Add an ingredient
    addIngredient: (ingredient) =>
      set((state) => {
        state.currentRecipe?.ingredients?.push(ingredient);
      }),

    // Remove an ingredient by index
    removeIngredient: (index) =>
      set((state) => {
        if (state.currentRecipe?.ingredients) {
          state.currentRecipe.ingredients.splice(index, 1);
        }
      }),

    // Update an ingredient at a specific index
    updateIngredient: (index, updatedIngredient) =>
      set((state) => {
        if (state.currentRecipe?.ingredients) {
          state.currentRecipe.ingredients[index] = updatedIngredient;
        }
      }),

    // Reorder ingredients
    reorderIngredients: (fromIndex, toIndex) =>
      set((state) => {
        if (state.currentRecipe?.ingredients) {
          const ingredients = state.currentRecipe.ingredients;
          const [moved] = ingredients.splice(fromIndex, 1);
          ingredients.splice(toIndex, 0, moved);
        }
      }),

    // Add a step
    addStep: (step) =>
      set((state) => {
        state.currentRecipe?.steps?.push(step);
      }),

    // Remove a step by index
    removeStep: (index) =>
      set((state) => {
        if (state.currentRecipe?.steps) {
          state.currentRecipe.steps.splice(index, 1);
        }
      }),

    // Update a step at a specific index
    updateStep: (index, updatedStep) =>
      set((state) => {
        if (state.currentRecipe?.steps) {
          state.currentRecipe.steps[index] = updatedStep;
        }
      }),

    // Reorder steps
    reorderSteps: (fromIndex, toIndex) =>
      set((state) => {
        if (state.currentRecipe?.steps) {
          const steps = state.currentRecipe.steps;
          const [moved] = steps.splice(fromIndex, 1);
          steps.splice(toIndex, 0, moved);
        }
      }),
  })),
);

export default useRecipeStore;
