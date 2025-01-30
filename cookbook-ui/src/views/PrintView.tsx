import { Container } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { useGetOneQuery } from "../services/api";
import { AppTitle } from "../components/AppTitle";

export const PrintView = () => {
  const { recipeId } = useParams();
  const { data: recipe } = useGetOneQuery(recipeId!);

  if (!recipe) {
    return <Container maxWidth="lg">Loading...</Container>;
  }
  return (
    <>
      <AppTitle recipeName={recipe.name} />
      <Container maxWidth="lg">
        <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
          {recipe.name}
        </pre>
        {recipe.ingredients && (
          <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
            {recipe.ingredients.map((i) => `* ${i.text}`).join("\n")}
          </pre>
        )}
        {recipe.steps && (
          <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
            {recipe.steps?.map((s, i) => `${i + 1}. ${s.text}`).join("\n\n")}
          </pre>
        )}
      </Container>
    </>
  );
};
