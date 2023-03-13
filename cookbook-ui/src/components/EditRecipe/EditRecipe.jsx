import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

import {
  updateField,
  addStep,
  removeStep,
  updateStep,
  swapSteps,
  addIngredient,
  removeIngredient,
  updateIngredient,
  swapIngredients,
  getIngredients,
  getSteps,
  getRecipe,
  getId,
} from "../../services/builder";

import {
  useSaveRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} from "../../services/api";

import {
  Button,
  Box,
  Container,
  Grid,
  List,
  ListItem,
  ListSubheader,
  TextField,
  LinearProgress,
} from "@mui/material";

import Ingredient from "./Ingredient";
import Step from "./Step";
import Details from "./Details";
import { grey } from "@mui/material/colors";

const EditRecipe = () => {
  const [newIngredient, setNewIngredient] = useState("");
  const [newStep, setNewStep] = useState("");
  const [saveRecipe, { isLoading: saving }] = useSaveRecipeMutation();
  const [updateRecipe, { isLoading: updating }] = useUpdateRecipeMutation();
  const [deleteRecipe, { isLoading: deleting }] = useDeleteRecipeMutation();

  const navigate = useNavigate();

  const recipe = useSelector(getRecipe);
  const id = useSelector(getId);
  const ingredients = useSelector(getIngredients);
  const steps = useSelector(getSteps);

  const handleAddNewIngredient = (e) => {
    e.preventDefault();
    dispatch(addIngredient({ text: newIngredient }));
    setNewIngredient("");
  };

  const handlePasteIngredients = (event) => {
    event.clipboardData
      .getData("text/plain")
      .split(/\r\n/)
      .filter((i) => i.length !== 0)
      .forEach((text) => dispatch(addIngredient({ text })));
    setNewIngredient("");
  };

  const handlePasteSteps = (event) => {
    event.clipboardData
      .getData("text/plain")
      .split(/\r\n/)
      .filter((i) => i.length !== 0)
      .forEach((text) => dispatch(addStep({ text })));
    setNewStep("");
  };

  const handleAddNewStep = (e) => {
    e.preventDefault();
    dispatch(addStep({ text: newStep }));
    setNewStep("");
  };

  const handleUpdateOrSave = () => {
    if (id && id.length > 0) {
      updateRecipe({ id, ...recipe })
        .unwrap()
        .then(() => navigate(`/view/${id}`));
    } else {
      saveRecipe({ ...recipe })
        .unwrap()
        .then((resp) => navigate(`/view/${resp.id}`));
    }
  };

  const dispatch = useDispatch();

  const loading = saving || updating || deleting;

  return (
    <Container maxWidth="lg">
      {loading && <LinearProgress />}
      <Grid container sx={{ mt: 1, pr: 2 }} spacing={3}>
        <Grid item xs={12}>
          <Details
            recipe={recipe}
            updateField={(name, value) =>
              dispatch(updateField({ name, value }))
            }
          />
          <Grid container>
            <Grid item xs={12} sm={4}>
              <List>
                <ListSubheader
                  sx={{ color: "primary.main", bgcolor: grey[100] }}
                >
                  Ingredients
                </ListSubheader>
                {ingredients &&
                  ingredients.map((ing, idx) => (
                    <Ingredient
                      ingredient={ing}
                      key={`ing-${idx}`}
                      idx={idx}
                      isFirst={idx === 0}
                      isLast={idx === ingredients.length - 1}
                      handleIngredientChange={(e) =>
                        dispatch(
                          updateIngredient({ idx, text: e.target.value })
                        )
                      }
                      handleIngredientDelete={() =>
                        dispatch(removeIngredient({ idx }))
                      }
                      handleMoveUp={() =>
                        dispatch(swapIngredients({ idx1: idx, idx2: idx - 1 }))
                      }
                      handleMoveDown={() =>
                        dispatch(swapIngredients({ idx1: idx, idx2: idx + 1 }))
                      }
                    />
                  ))}
                <ListItem>
                  <form onSubmit={handleAddNewIngredient}>
                    <TextField
                      value={newIngredient}
                      fullWidth
                      onChange={(e) => setNewIngredient(e.target.value)}
                      label="Ingredient"
                      inputProps={{ onPaste: handlePasteIngredients }}
                    />
                  </form>
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={8}>
              <List>
                <ListSubheader
                  sx={{ color: "primary.main", bgcolor: grey[100] }}
                >
                  Steps
                </ListSubheader>
                {steps &&
                  steps.map((step, idx) => (
                    <Step
                      step={step}
                      key={`step-${idx}`}
                      idx={idx}
                      isFirst={idx === 0}
                      isLast={idx === steps.length - 1}
                      handleStepChange={(e) =>
                        dispatch(updateStep({ idx, text: e.target.value }))
                      }
                      handleStepDelete={() => dispatch(removeStep({ idx }))}
                      handleMoveUp={() =>
                        dispatch(swapSteps({ idx1: idx, idx2: idx - 1 }))
                      }
                      handleMoveDown={() =>
                        dispatch(swapSteps({ idx1: idx, idx2: idx + 1 }))
                      }
                    />
                  ))}
                <ListItem>
                  <form onSubmit={handleAddNewStep}>
                    <TextField
                      value={newStep}
                      fullWidth
                      onChange={(e) => setNewStep(e.target.value)}
                      inputProps={{ onPaste: handlePasteSteps }}
                      label="Steps"
                      placeholder="Type or paste the list of steps here"
                    />
                  </form>
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ my: 2, mb: 4 }}>
              <Button
                sx={{ mr: 2 }}
                onClick={handleUpdateOrSave}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
              {id && id.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() =>
                    deleteRecipe({ id })
                      .unwrap()
                      .then(() => navigate(`/`))
                  }
                >
                  Delete
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EditRecipe;
