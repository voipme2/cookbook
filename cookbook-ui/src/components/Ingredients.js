import React, {useState} from 'react';
import {List, ListItemButton, ListItemText, ListSubheader} from "@mui/material";
import {grey} from "@mui/material/colors";

const Ingredient = ({text}) => {
  const [done, setDone] = useState(false);
  return (<ListItemButton onClick={() => setDone(!done)}>
      <ListItemText sx={{
        textDecoration: done ? 'line-through' : 'none',
        color: done ? grey[400] : 'black'
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
