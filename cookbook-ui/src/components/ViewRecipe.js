import React from 'react';
import {useParams, useNavigate } from "react-router-dom";
import {useGetOneQuery} from "../services/api";
import Ingredients from "./Ingredients";
import {
  Avatar,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  IconButton
} from "@mui/material";
import { Edit } from '@mui/icons-material';

const Step = ({step, index}) => {
  return (<ListItemButton sx={{my: 3}}>
    <ListItemAvatar>
      <Avatar>{index + 1}</Avatar>
    </ListItemAvatar>
    <ListItemText sx={{
      color: 'black'
    }} primary={step}/>
  </ListItemButton>)
}

const ViewRecipe = () => {
  const {recipeId} = useParams();
  const {data: recipe, isLoading} = useGetOneQuery(recipeId);
  const navigate = useNavigate();

  return (<div>
    {isLoading && <LinearProgress/>}
    {recipe && !isLoading &&
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Ingredients ingredients={recipe.ingredients}/>
        </Grid>
        <Grid item xs={9} sx={{my: 2, textAlign: "left"}}>
          <Typography variant="h5">{recipe.name} <IconButton onClick={() => navigate(`/edit/${recipeId}`)}>
            <Edit/>
          </IconButton> </Typography>
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
            {recipe.steps.length === 0 &&
              <ListItem>
                <ListItemText primary={"Just mix the ingredients"} />
              </ListItem>
            }
            {recipe.steps.map((step, idx) => (
              <Step key={`step-${idx}`} step={step.text} index={idx}/>))}
          </List>
        </Grid>
      </Grid>
    }
  </div>)

}

export default ViewRecipe;
