import React from "react";
import { List, ListItem, ListItemText, ListSubheader } from "@mui/material";

import { grey } from "@mui/material/colors";

const Ingredient = ({ text }) => {
  return (
    <ListItem>
      <ListItemText
        sx={{
          color: "black",
        }}
        primary={text}
      />
    </ListItem>
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
