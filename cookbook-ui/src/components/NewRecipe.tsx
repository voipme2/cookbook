import React, { useEffect } from "react";
import EditRecipe from "./EditRecipe/EditRecipe";
import useRecipeStore from "../store";

const NewRecipe = () => {
  const { resetRecipe } = useRecipeStore();
  useEffect(() => {
    resetRecipe();
  }, [resetRecipe]);
  return <EditRecipe />;
};

export default NewRecipe;
