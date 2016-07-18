
// action types
export const ADD_RECIPE = 'ADD_RECIPE';
export const UPDATE_RECIPE = 'UPDATE_RECIPE';
export const DELETE_RECIPE = 'DELETE_RECIPE';

// action creators
export function addRecipe(recipe) {
  return { type: ADD_RECIPE, recipe };
}

export function deleteRecipe(index) {
  return { type: DELETE_RECIPE, index }
}
