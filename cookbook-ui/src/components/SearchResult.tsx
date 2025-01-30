import React from "react";
import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { SearchRecipe } from "../types";
import { Link } from "react-router-dom";
// @ts-ignore
import CrockpotIcon from "../icons/crockpot.svg?react";
// @ts-ignore
import VeganIcon from "../icons/vegan.svg?react";
// @ts-ignore
import GlutenFreeIcon from "../icons/gluten-free.svg?react";
// @ts-ignore
import VegetarianIcon from "../icons/vegetarian.svg?react";
// @ts-ignore
import DairyFreeIcon from "../icons/dairy-free.svg?react";

interface SearchResultProps {
  recipe: SearchRecipe;
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
            textDecoration: "none !important",
            color: "inherit",
          }}
        >
          {getHighlightedText(recipe.name, highlight)}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            textDecoration: "none !important",
            color: "inherit",
          }}
        >
          {getHighlightedText(recipe.description, highlight)}
        </Typography>

        {/* Options (Gluten Free, Dairy Free, etc.) */}
        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {recipe.options?.isGlutenFree && (
            <GlutenFreeIcon width={20} height={20} />
          )}
          {recipe.options?.isDairyFree && (
            <DairyFreeIcon width={20} height={20} />
          )}
          {recipe.options?.isVegan && <VeganIcon width={20} height={20} />}
          {recipe.options?.isVegetarian && (
            <VegetarianIcon width={20} height={20} />
          )}
          {recipe.options?.isCrockPot && (
            <CrockpotIcon width={20} height={20} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
