import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetOneQuery } from "../../services/api";
import Ingredients from "./Ingredients";
import Steps from "./Steps";
import {
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit, Print } from "@mui/icons-material";
import { summarizeTimes } from "../../utils/time";

const ViewRecipe = () => {
  const { recipeId } = useParams();
  const { data: recipe, isLoading } = useGetOneQuery(recipeId);
  const navigate = useNavigate();
  const { prepTime, inactiveTime, cookTime } = recipe || {};
  const totalTime = summarizeTimes([prepTime, inactiveTime, cookTime]);

  return (
    <div>
      {isLoading && <LinearProgress />}
      {recipe && !isLoading && (
        <Grid container>
          <Grid item xs={12} sx={{ m: 3, textAlign: "left" }}>
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
            <Typography variant="subtitle" sx={{ mb: 2 }}>
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
          </Grid>
          <Grid item xs={12} sx={{ mx: 2 }}>
            <Divider />
          </Grid>
          <Grid item xs={12} sx={{ mx: 2 }}>
            <Grid container spacing={3}>
              <Grid item md={3} xs={12} sx={{ textAlign: "left" }}>
                <Ingredients ingredients={recipe.ingredients} />
              </Grid>
              <Grid item md={9} xs={12} sx={{ textAlign: "left" }}>
                <Steps steps={recipe.steps} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default ViewRecipe;
