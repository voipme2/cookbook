import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
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
    <Card
      sx={{ display: "flex", alignItems: "center", m: 2, p: 1 }}
      component={Link}
      to={`/view/${recipe.id}`}
    >
      {/* Recipe Image (if available) */}
      {recipe.imageUrl ? (
        <CardMedia
          component="img"
          sx={{ width: 50, height: 50, borderRadius: 2, objectFit: "cover" }}
          image={recipe.imageUrl}
          alt={recipe.name}
        />
      ) : (
        <Box
          sx={{
            width: 50,
            height: 50,
            backgroundColor: "#ccc",
            borderRadius: 2,
          }}
        />
      )}

      {/* Recipe Content */}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ml: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {getHighlightedText(recipe.name, highlight)}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {getHighlightedText(recipe.description, highlight)}
        </Typography>

        {/* Options (Gluten Free, Dairy Free, etc.) */}
        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {recipe.options?.isGlutenFree && (
            <Chip label="Gluten Free" color="success" size="small" />
          )}
          {recipe.options?.isDairyFree && (
            <Chip label="Dairy Free" color="primary" size="small" />
          )}
          {recipe.options?.isVegan && (
            <Chip label="Vegan" color="warning" size="small" />
          )}
          {recipe.options?.isVegetarian && (
            <Chip label="Vegetarian" color="secondary" size="small" />
          )}
          {recipe.options?.isCrockPot && (
            <Chip label="Crockpot" color="secondary" size="small" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
