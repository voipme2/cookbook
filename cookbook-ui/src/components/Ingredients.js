import React from 'react';
import {List, ListItemButton, ListItemText, ListSubheader} from "@mui/material";

const Ingredient = ({text}) => {
  return (<ListItemButton>
      <ListItemText sx={{
        color: 'black'
      }} primary={text}/>
    </ListItemButton>

  )
};

const Ingredients = ({ingredients}) => {
  return (<List>
    <ListSubheader>Ingredients</ListSubheader>
    {ingredients.map((i, idx) => <Ingredient key={idx} text={i.text}/>)}
  </List>)
}

export default Ingredients;
