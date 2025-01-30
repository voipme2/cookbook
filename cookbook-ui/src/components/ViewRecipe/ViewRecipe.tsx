import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Ingredients from "./Ingredients";
import Steps from "./Steps";
import {
  Box,
  Divider,
  Grid2,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit, Print } from "@mui/icons-material";
import { summarizeTimes } from "../../utils/time";
import { Recipe } from "../../types";

const ViewRecipe = ({ recipe }: { recipe: Recipe }) => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { prepTime, inactiveTime, cookTime } = recipe || {};
  const totalTime = summarizeTimes([prepTime, inactiveTime, cookTime]);

  return (
    <div>
      {recipe && (
        <Grid2 container>
          {recipe.imageUrl && (
            <Grid2 size={3}>
              <Box
                component="img"
                src={recipe.imageUrl}
                alt={recipe.name}
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 200, // Adjust as needed
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
            </Grid2>
          )}
          <Grid2
            size={{ xs: recipe.imageUrl ? 9 : 12 }}
            sx={{ m: 3, textAlign: "left" }}
          >
            <Typography variant="h5" sx={{ flex: 1 }}>
              {recipe.name}
              <Tooltip title="Edit recipe">
                <IconButton
                  edge="end"
                  sx={{ ml: 1 }}
                  onClick={() => navigate(`/edit/${recipeId}`)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy recipe to clipboard">
                <IconButton
                  edge="end"
                  sx={{ ml: 1 }}
                  onClick={() => navigate(`/print/${recipeId}`)}
                >
                  <Print />
                </IconButton>
              </Tooltip>{" "}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {recipe.description} by {recipe.author}
            </Typography>
            <Typography variant="subtitle2">
              Servings: {recipe.servings}
            </Typography>
            <Tooltip
              title={`Prep: ${recipe.prepTime}, Inactive: ${recipe.inactiveTime}, Cook: ${recipe.cookTime}`}
            >
              <Typography variant="subtitle2">
                Total time: {totalTime}
              </Typography>
            </Tooltip>
          </Grid2>
          <Grid2 size={12} sx={{ mx: 2 }}>
            <Divider />
          </Grid2>
          <Grid2 size={12} sx={{ mx: 2 }}>
            <Grid2 container spacing={3}>
              <Grid2 size={{ md: 3, xs: 12 }} sx={{ textAlign: "left" }}>
                <Ingredients ingredients={recipe.ingredients} />
              </Grid2>
              <Grid2 size={{ md: 9, xs: 12 }} sx={{ textAlign: "left" }}>
                <Steps steps={recipe.steps} />
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      )}
    </div>
  );
};

export default ViewRecipe;
