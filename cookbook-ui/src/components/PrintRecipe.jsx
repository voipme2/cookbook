import { Container } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { useGetOneQuery } from "../services/api";
const PrintRecipe = () => {
  const { recipeId } = useParams();
  const { data: recipe } = useGetOneQuery(recipeId);
  return (
    <Container maxWidth="lg">
      <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
        {recipe.name}
      </pre>
      <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
        {recipe.ingredients.map((i) => `* ${i.text}`).join("\n")}
      </pre>
      <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
        {recipe.steps.map((s, i) => `${i + 1}. ${s.text}`).join("\n\n")}
      </pre>
    </Container>
  );
};

export default PrintRecipe;
