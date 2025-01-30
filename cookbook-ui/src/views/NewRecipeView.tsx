import useRecipeStore from "../store";
import React, { useEffect } from "react";
import EditRecipe from "../components/EditRecipe/EditRecipe";
import { AppTitle } from "../components/AppTitle";

export const NewRecipeView = () => {
  const { resetRecipe } = useRecipeStore();
  useEffect(() => {
    resetRecipe();
  }, [resetRecipe]);
  return (
    <>
      <AppTitle recipeName="New Recipe" />
      <EditRecipe />
    </>
  );
};
