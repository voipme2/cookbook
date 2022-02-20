import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useNavigate } from 'react-router-dom';

import {
  updateField,
  addStep,
  removeStep,
  updateStep,
  addIngredient,
  removeIngredient,
  updateIngredient,
  getName,
  getAuthor,
  getDescription,
  getServings,
  getPrepTime,
  getInactiveTime,
  getCookTime,
  getIngredients,
  getSteps,
  getRecipe,
  getId
} from '../services/builder';

import {
  useSaveRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation
} from "../services/api";

import {
  Avatar, Button, ButtonGroup,
  Grid,
  IconButton,
  List,
  ListItem, ListItemAvatar,
  ListItemButton, ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  TextField,
  Typography
} from '@mui/material';

import {
  Delete as DeleteIcon
} from '@mui/icons-material';

const EditRecipe = () => {

  const [newIngredient, setNewIngredient] = useState('');
  const [newStep, setNewStep] = useState('');
  const [ saveRecipe, { isLoading : saving }] = useSaveRecipeMutation();
  const [ updateRecipe, { isLoading : updating }] = useUpdateRecipeMutation();
  const [ deleteRecipe, { isLoading: deleting }] = useDeleteRecipeMutation();

  const navigate = useNavigate();

  const recipe = useSelector(getRecipe);
  const id = useSelector(getId);
  const name = useSelector(getName);
  const author = useSelector(getAuthor);
  const description = useSelector(getDescription);
  const servings = useSelector(getServings);
  const prepTime = useSelector(getPrepTime);
  const inactiveTime = useSelector(getInactiveTime);
  const cookTime = useSelector(getCookTime);

  const ingredients = useSelector(getIngredients);
  const steps = useSelector(getSteps);

  const handleAddNewIngredient = ({ keyCode }) => {
    if (keyCode === 13) {
      dispatch(addIngredient({text: newIngredient }));
      setNewIngredient("");
    }
  }

  const handleAddNewStep = ({ keyCode }) => {
    if (keyCode === 13) {
      dispatch(addStep({text: newStep }));
      setNewStep("");
    }
  }

   const handleUpdateOrSave = () => {
    if (id && id.length > 0) {
      updateRecipe({ id, ...recipe }).unwrap().then(() => navigate(`/view/${id}`));
    } else {
      saveRecipe({ ...recipe }).unwrap().then(resp => navigate(`/view/${resp.id}`));
    }
   }

  const dispatch = useDispatch();

  return (
    <Grid container sx={{ mt: 1, pr: 2 }} spacing={3}>
      <Grid item xs={12} sm={3}>
        <List>
          <ListSubheader>Ingredients</ListSubheader>
          {ingredients && ingredients.map((ing, idx) => <ListItemButton
            key={`ing-${idx}`}>
            <ListItemText primary={ing.text} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="delete" onClick={() => dispatch(removeIngredient({ idx }))}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItemButton>)}
          <ListItem>
            <TextField value={newIngredient} fullWidth
                       onChange={e => setNewIngredient(e.target.value)}
                       onKeyDown={handleAddNewIngredient}
                       label="Ingredient" />
          </ListItem>
        </List>
      </Grid>
      <Grid item xs={12} sm={9}>
        <TextField sx={{ my: 1 }} value={name} fullWidth required
                   onChange={e => dispatch(updateField({ name: 'name', value: e.target.value}))}
                   label="Name" />
        <TextField sx={{ my: 1 }} value={author} fullWidth required
                   onChange={e => dispatch(updateField({ name: 'author', value: e.target.value}))}
                   label="Author" />
        <TextField sx={{ my: 1 }} value={description} fullWidth
                   onChange={e => dispatch(updateField({ name: 'description', value: e.target.value}))}
                   label="Description" />
        <TextField sx={{ my: 1 }} value={servings} fullWidth
                   onChange={e => dispatch(updateField({ name: 'servings', value: e.target.value}))}
                   label="Servings" />

      <Grid container>
        <Grid item xs={12} sm={3}>
          <TextField sx={{ my: 1 }} value={prepTime} fullWidth
                     onChange={e => dispatch(updateField({ name: 'prepTime', value: e.target.value}))}
                     label="Prep time" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField sx={{ my: 1 }} value={inactiveTime} fullWidth
                     onChange={e => dispatch(updateField({ name: 'inactiveTime', value: e.target.value}))}
                     label="Inactive time" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField sx={{ my: 1  }} value={cookTime} fullWidth
                     onChange={e => dispatch(updateField({ name: 'cookTime', value: e.target.value}))}
                     label="Cook time" />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="caption">Total time: TODO</Typography>
        </Grid>
      </Grid>
        <List>
          <ListSubheader>Steps</ListSubheader>
          {steps && steps.map((step, idx) => <ListItemButton
            key={`step-${idx}`}>
            <ListItemAvatar>
              <Avatar>{idx + 1}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={step.text} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="delete" onClick={() => dispatch(removeStep({ idx }))}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItemButton>)}
          <ListItem>
            <TextField value={newStep} fullWidth
                       onChange={e => setNewStep(e.target.value)}
                       onKeyDown={handleAddNewStep}
                       label="Steps"
                       placeholder="Type or paste the list of steps here"/>
          </ListItem>
        </List>
        <ButtonGroup>
          <Button onClick={handleUpdateOrSave}>Save</Button>
          {id && id.length > 0 &&
            <Button onClick={() => deleteRecipe({id}).unwrap().then(() => navigate(`/`))}>Delete</Button>
          }
        </ButtonGroup>
      </Grid>

    </Grid>)
}

export default EditRecipe;
