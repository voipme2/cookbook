import { Grid2, TextField, Typography } from "@mui/material";
import { ChangeEvent } from "react";
import { Recipe } from "../../types";
import { summarizeTimes } from "../../utils/time";

const RecipeField = ({
  value,
  label,
  required,
  onChange,
}: {
  value: string | number | undefined;
  label: string;
  required?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <TextField
    sx={{ my: 1 }}
    fullWidth
    value={value}
    required={required}
    onChange={onChange}
    label={label}
  />
);

const Details = ({
  recipe,
  updateField,
}: {
  recipe: Partial<Recipe>;
  updateField: (field: string, value: string) => void;
}) => {
  const totalTime = summarizeTimes([
    recipe.prepTime,
    recipe.cookTime,
    recipe.inactiveTime,
  ]);
  const {
    name,
    author,
    description,
    servings,
    prepTime,
    inactiveTime,
    cookTime,
  } = recipe;
  const handleChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) =>
    updateField(name, e.target.value);
  return (
    <>
      <RecipeField
        value={name}
        required
        onChange={handleChange("name")}
        label="Name"
      />
      <RecipeField
        value={author}
        required
        onChange={handleChange("author")}
        label="Author"
      />
      <RecipeField
        value={description}
        required
        onChange={handleChange("description")}
        label="Description"
      />
      <RecipeField
        value={servings}
        onChange={handleChange("servings")}
        label="Servings"
      />

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 3 }}>
          <RecipeField
            value={prepTime}
            onChange={handleChange("prepTime")}
            label="Prep"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 3 }}>
          <RecipeField
            value={inactiveTime}
            onChange={handleChange("inactiveTime")}
            label="Inactive"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 3 }}>
          <RecipeField
            value={cookTime}
            onChange={handleChange("cookTime")}
            label="Cook"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 3 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: "60px" }}>
            Total time: {totalTime}
          </Typography>
        </Grid2>
      </Grid2>
    </>
  );
};

export default Details;
