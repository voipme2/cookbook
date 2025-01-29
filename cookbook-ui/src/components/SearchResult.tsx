import React from "react";
import { Box, Typography } from "@mui/material";
import { Recipe } from "../types";
import { Link } from "react-router-dom";

interface SearchResultProps {
  recipe: Recipe;
  highlight: string;
}

export const SearchResult: React.FC<SearchResultProps> = ({
  recipe,
  highlight,
}) => {
  const getHighlightedText = (text: string, highlight: string) => {
    if (!text) return null;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index}>{part}</mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  return (
    <Box>
      <Box key={recipe.id} sx={{ m: 2 }}>
        <Link
          to={`/view/${recipe.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Typography variant="h6">
            {getHighlightedText(recipe.name, highlight)}
          </Typography>
          <Typography variant="body2">
            {getHighlightedText(recipe.description, highlight)}
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};
