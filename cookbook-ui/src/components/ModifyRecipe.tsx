import React, { useEffect } from "react";
import EditRecipe from "./EditRecipe/EditRecipe";
import { useParams } from "react-router-dom";
import { useGetOneQuery } from "../services/api";
import { LinearProgress } from "@mui/material";
import useRecipeStore from "../store";

const ModifyRecipe = () => {
  const { recipeId } = useParams();
  const { data: recipe, isLoading } = useGetOneQuery(recipeId!);
  const { setRecipe } = useRecipeStore();

  useEffect(() => {
    if (recipe) setRecipe(recipe);
  }, [recipe]);
  if (!recipe) return;
  return (
    <>
      {isLoading && <LinearProgress />}
      {!isLoading && recipe && <EditRecipe />}
    </>
  );
};

export default ModifyRecipe;
