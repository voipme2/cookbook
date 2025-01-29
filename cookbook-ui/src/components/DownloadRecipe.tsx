import React, { useEffect } from "react";
import EditRecipe from "./EditRecipe/EditRecipe";
import { useSearchParams } from "react-router-dom";
import { useFetchRecipeQuery } from "../services/api";
import { LinearProgress } from "@mui/material";
import useRecipeStore from "../store";

const DownloadRecipe = () => {
  const [searchParams] = useSearchParams();
  const recipeUrl = searchParams.get("recipeUrl");
  const {
    data: recipe,
    isLoading,
    isFetching,
  } = useFetchRecipeQuery(recipeUrl!);
  const { setRecipe } = useRecipeStore();

  useEffect(() => {
    if (recipe) setRecipe(recipe);
  }, [recipe]);
  return (
    <>
      {(isLoading || isFetching) && <LinearProgress />}
      {!(isLoading || isFetching) && recipe && <EditRecipe />}
    </>
  );
};

export default DownloadRecipe;
