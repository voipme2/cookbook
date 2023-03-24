import React from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material";

import { grey } from "@mui/material/colors";

const Ingredient = ({ text }) => {
  return (
    <ListItemButton>
      <ListItemText
        sx={{
          color: "black",
        }}
        primary={text}
      />
    </ListItemButton>
  );
};

const Ingredients = ({ ingredients }) => {
  return (
    <List>
      <ListSubheader sx={{ color: "primary.main", bgcolor: grey[100] }}>
        Ingredients
      </ListSubheader>
      {ingredients.map((i, idx) => (
        <Ingredient key={idx} text={i.text} />
      ))}
    </List>
  );
};

export default Ingredients;
