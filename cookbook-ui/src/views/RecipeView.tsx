import { useParams } from "react-router-dom";
import { useGetOneQuery } from "../services/api";
import { Container } from "@mui/material";
import React from "react";
import ViewRecipe from "../components/ViewRecipe/ViewRecipe";
import { AppTitle } from "../components/AppTitle";

export const RecipeView = () => {
  const { recipeId } = useParams();
  const { data: recipe, isLoading } = useGetOneQuery(recipeId!);

  if (!recipe && isLoading) {
    return <Container maxWidth="lg">Loading...</Container>;
  }

  return (
    <>
      <AppTitle recipeName={recipe?.name} />
      <ViewRecipe recipe={recipe!} />
    </>
  );
};
