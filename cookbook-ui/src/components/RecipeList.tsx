import React from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Container,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Recipe } from "../types";

const RecipeList = ({ recipes }: { recipes: Recipe[] }) => {
  return (
    <Container>
      <List>
        {recipes.map((recipe, index) => (
          <ListItemButton component={Link} to={`/view/${recipe.id}`}>
            {recipe.imageUrl && (
              <ListItemAvatar>
                <Avatar
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  style={{ width: 100 }}
                />{" "}
              </ListItemAvatar>
            )}
            <ListItemText
              primary={recipe.name}
              secondary={
                <Typography
                  variant="body2"
                  component="span"
                  color="textPrimary"
                >
                  {recipe.description}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Container>
  );
};

export default RecipeList;
