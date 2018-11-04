import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

Vue.use(Vuex);
const API = "/api/recipes";

export default new Vuex.Store({
  state: {
    recipes: [],
    currentRecipe: null,
    loading: false,
    errorMsg: null
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_RECIPES(state, recipes) {
      state.recipes = recipes;
    },
    SET_CURRENT_RECIPE(state, recipe) {
      state.currentRecipe = recipe;
    },
    SET_ERROR_MSG(state, message) {
      state.errorMsg = message;
    }
  },
  actions: {
    loadRecipes({commit}) {
      commit("SET_LOADING", true);
      axios.get(API)
        .then(resp => resp.data)
        .then(recipes => {
          commit("SET_RECIPES", recipes);
        })
        .finally(() => commit("SET_LOADING", false));
    },
    getRecipe({ commit }, recipeId) {
      commit("SET_LOADING", true);
      axios.get(`${API}/${recipeId}`)
        .then(resp => resp.data)
        .then(recipe => {
          commit("SET_CURRENT_RECIPE", recipe);
        })
        .finally(() => commit("SET_LOADING", false));
    },
    addRecipe({ commit }, recipe) {
      commit("SET_LOADING", true);
      axios.post(API, recipe)
        .then(resp => resp.data)
        .then(recipe => {
          commit("SET_CURRENT_RECIPE", recipe);
        })
        .finally(() => commit("SET_LOADING", false));
    },
    updateRecipe({ commit }, recipe) {
      commit("SET_LOADING", true);
      axios.post(`${API}/${recipe.id}`, recipe)
        .then(resp => resp.data)
        .then(recipe => {
          commit("SET_CURRENT_RECIPE", recipe);
        })
        .finally(() => commit("SET_LOADING", false));
    },
    downloadRecipe({ commit }, url) {
      axios.get(API, { params: { recipeUrl: url }})
        .then(resp => resp.data)
        .then(recipe => {
          commit("SET_CURRENT_RECIPE", recipe)
        })
        .catch(() => {
          commit("SET_ERROR_MSG", `Uh oh, had a problem loading ${url}`);
          commit("SET_CURRENT_RECIPE", null);
        })
        .finally(() => commit("SET_LOADING", false));
    }
  }
})
