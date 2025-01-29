import { useEffect } from "react";
import useRecipeStore from "../store";
import { LinearProgress } from "@mui/material";
import EditRecipe from "../components/EditRecipe/EditRecipe";
import { useGetOneQuery } from "../services/api";
import { useParams } from "react-router-dom";

export const EditView = () => {
  const { recipeId } = useParams();
  const { data: recipe, isLoading } = useGetOneQuery(recipeId!);
  const setRecipe = useRecipeStore((state) => state.setRecipe);

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
