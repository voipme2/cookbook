import React, { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Grid2,
  LinearProgress,
  List,
  ListItem,
  ListSubheader,
  Slide,
  TextField,
} from "@mui/material";

import EditIngredient from "./Ingredient";
import EditStep from "./Step";
import EditDetails from "./Details";
import { grey } from "@mui/material/colors";
import { Ingredient, Step } from "../../types";
import useRecipeStore from "../../store";
import {
  useDeleteRecipeMutation,
  useSaveRecipeMutation,
  useUpdateRecipeMutation,
} from "../../services/api";

const EditRecipe = () => {
  const [newIngredient, setNewIngredient] = useState("");
  const [newStep, setNewStep] = useState("");
  const {
    currentRecipe,
    updateRecipe: updateRecipeFields,
    addIngredient,
    removeIngredient,
    updateIngredient,
    reorderIngredients,
    addStep,
    updateStep,
    removeStep,
    reorderSteps,
  } = useRecipeStore();
  if (!currentRecipe) return;
  const { mutate: saveRecipe, isPending: saving } = useSaveRecipeMutation();
  const { mutate: updateRecipe, isPending: updating } =
    useUpdateRecipeMutation();
  const { mutate: deleteRecipe, isPending: deleting } =
    useDeleteRecipeMutation();

  const navigate = useNavigate();

  const handleAddNewIngredient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addIngredient({ text: newIngredient });
    setNewIngredient("");
  };

  const handleAddNewStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addStep({ text: newStep });
    setNewStep("");
  };

  const handlePasteIngredients = (
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    if (event.clipboardData === null) return;
    event.clipboardData
      .getData("text/plain")
      .split(/\r\n/)
      .filter((i: string) => i.length !== 0)
      .forEach((text: string) => addIngredient({ text }));
    setNewIngredient("");
  };

  const handlePasteSteps = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (event.clipboardData === null) return;
    event.clipboardData
      .getData("text/plain")
      .split(/\r\n/)
      .filter((i: string) => i.length !== 0)
      .forEach((text: string) => addStep({ text }));
    setNewStep("");
  };

  const handleUpdateOrSave = () => {
    if (currentRecipe?.id && currentRecipe.id.length > 0) {
      updateRecipe(
        { id: currentRecipe.id, ...currentRecipe },
        {
          onSuccess: () => navigate(`/view/${currentRecipe.id}`),
        },
      );
    } else {
      saveRecipe(
        { ...currentRecipe },
        {
          onSuccess: (savedRecipe) => {
            if (savedRecipe) navigate(`/view/${savedRecipe.id}`);
          },
        },
      );
    }
  };

  const loading = saving || updating || deleting;

  return (
    <Container maxWidth="lg">
      {loading && <LinearProgress />}
      <Grid2 container sx={{ mt: 1, pr: 2 }} spacing={3}>
        <Grid2 size={12}>
          <EditDetails
            recipe={currentRecipe}
            updateField={(name, value) => updateRecipeFields({ [name]: value })}
          />
          <Grid2 container>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <List>
                <ListSubheader
                  sx={{ color: "primary.main", bgcolor: grey[100] }}
                >
                  Ingredients
                </ListSubheader>
                {currentRecipe.ingredients &&
                  currentRecipe.ingredients.map(
                    (ing: Ingredient, idx: number) => (
                      <Slide key={`ing-${idx}`}>
                        <EditIngredient
                          ingredient={ing}
                          key={`ing-${idx}`}
                          isFirst={idx === 0}
                          isLast={idx === currentRecipe.ingredients.length - 1}
                          handleIngredientChange={(
                            e: ChangeEvent<
                              HTMLInputElement | HTMLTextAreaElement
                            >,
                          ) => updateIngredient(idx, { text: e.target.value })}
                          handleIngredientDelete={() => removeIngredient(idx)}
                          handleMoveUp={() => reorderIngredients(idx, idx - 1)}
                          handleMoveDown={() =>
                            reorderIngredients(idx, idx + 1)
                          }
                        />
                      </Slide>
                    ),
                  )}
                <ListItem>
                  <form
                    onSubmit={handleAddNewIngredient}
                    style={{ width: "100%" }}
                  >
                    <TextField
                      value={newIngredient}
                      fullWidth
                      onChange={(e) => setNewIngredient(e.target.value)}
                      label="Ingredient"
                      slotProps={{
                        htmlInput: {
                          onPaste: handlePasteIngredients,
                        },
                      }}
                    />
                  </form>
                </ListItem>
              </List>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 8 }}>
              <List>
                <ListSubheader
                  sx={{ color: "primary.main", bgcolor: grey[100] }}
                >
                  Steps
                </ListSubheader>
                {currentRecipe.steps &&
                  currentRecipe.steps.map((step: Step, idx: number) => (
                    <EditStep
                      step={step}
                      key={`step-${idx}`}
                      idx={idx}
                      isFirst={idx === 0}
                      isLast={idx === currentRecipe.steps.length - 1}
                      handleStepChange={(
                        e: React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >,
                      ) => updateStep(idx, { text: e.target.value })}
                      handleStepDelete={() => removeStep(idx)}
                      handleMoveUp={() => reorderSteps(idx, idx - 1)}
                      handleMoveDown={() => reorderSteps(idx, idx + 1)}
                    />
                  ))}
                <ListItem>
                  <form onSubmit={handleAddNewStep} style={{ width: "100%" }}>
                    <TextField
                      value={newStep}
                      fullWidth
                      onChange={(e) => setNewStep(e.target.value)}
                      slotProps={{
                        htmlInput: {
                          onPaste: handlePasteSteps,
                        },
                      }}
                      label="Steps"
                      placeholder="Type or paste the list of steps here"
                    />
                  </form>
                </ListItem>
              </List>
            </Grid2>
          </Grid2>
          <Grid2 size={12}>
            <Box sx={{ my: 2, mb: 4 }}>
              <Button
                sx={{ mr: 2 }}
                onClick={handleUpdateOrSave}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
              {currentRecipe.id && currentRecipe.id.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() =>
                    deleteRecipe(currentRecipe.id!, {
                      onSuccess: () => navigate(`/`),
                    })
                  }
                >
                  Delete
                </Button>
              )}
            </Box>
          </Grid2>
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default EditRecipe;
