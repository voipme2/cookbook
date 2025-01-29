import React from "react";
import {List, ListItem, ListItemText, ListSubheader} from "@mui/material";
import {Ingredient} from "../../types";
import {grey} from "@mui/material/colors";

const Ingredients = ({
                       ingredients
                     }: { ingredients: Ingredient[] }) => {
  return (
    <List>
      <ListSubheader sx={{color: "primary.main", bgcolor: grey[100]}}>
        Ingredients
      </ListSubheader>
      {ingredients.map((i: Ingredient, idx: number) => (
        <ListItem key={idx}>
          <ListItemText
            sx={{
              color: "black",
            }}
            primary={i.text}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default Ingredients;
