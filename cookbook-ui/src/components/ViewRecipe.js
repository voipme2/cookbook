import React, {useState} from 'react';

import {useParams} from "react-router-dom";
import {useGetOneQuery} from "../services/api";
import Ingredients from "./Ingredients";
import {Avatar, Grid, LinearProgress, List, ListItemButton, ListItemAvatar, ListItemText, Typography} from "@mui/material";
import {grey} from "@mui/material/colors";

const Step = ({step, index}) => {
  const [done, setDone] = useState(false);
  return (<ListItemButton onClick={() => setDone(!done)} sx={{my: 3}}>
    <ListItemAvatar>
      <Avatar>{index + 1}</Avatar>
    </ListItemAvatar>
    <ListItemText sx={{
      textDecoration: done ? 'line-through' : 'none',
      color: done ? grey[400] : 'black'
    }} primary={step}/>
  </ListItemButton>)
}

const ViewRecipe = () => {
  const {recipeId} = useParams();
  const {data: recipe, isLoading} = useGetOneQuery(recipeId);

  return (<div>
    {isLoading && <LinearProgress/>}
    {recipe && !isLoading &&
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Ingredients ingredients={recipe.ingredients}/>
        </Grid>
        <Grid item xs={9} sx={{my: 2, textAlign: "left"}}>
          <Typography variant="h5">{recipe.name}</Typography>
          <Typography variant="subtitle" sx={{ mb: 2 }}>{recipe.description} by {recipe.author}</Typography>
          <Typography variant="subtitle2">Servings: {recipe.servings}</Typography>
          <Grid container>
            <Grid item xs={3}>
              <Typography variant="caption">Prep time: {recipe.prepTime}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption">Inactive time: {recipe.inactiveTime}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption">Cook time: {recipe.cookTime}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption">Total time: {recipe.totalTime}</Typography>
            </Grid>
          </Grid>
          <List>
            {recipe.steps.map((step, idx) => (
              <Step key={`step-${idx}`} step={step.text} index={idx}/>))}
          </List>
        </Grid>
      </Grid>
    }
  </div>)

}

export default ViewRecipe;
