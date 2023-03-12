import { Grid, TextField, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { getTotalTime } from "../../services/builder";

const RecipeField = (props) => (
  <TextField sx={{ my: 1 }} fullWidth {...props} />
);

const Details = ({ recipe, updateField }) => {
  const totalTime = useSelector(getTotalTime);

  return (
    <>
      <RecipeField
        value={recipe.name}
        required
        onChange={(e) => updateField("name", e.target.value)}
        label="Name"
      />
      <RecipeField
        value={recipe.author}
        required
        onChange={(e) => updateField("author", e.target.value)}
        label="Author"
      />
      <RecipeField
        value={recipe.description}
        required
        onChange={(e) => updateField("description", e.target.value)}
        label="Description"
      />
      <RecipeField
        value={recipe.servings}
        onChange={(e) => updateField("servings", e.target.value)}
        label="Servings"
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <RecipeField
            value={recipe.prepTime}
            onChange={(e) => updateField("prepTime", e.target.value)}
            label="Prep"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <RecipeField
            value={recipe.inactiveTime}
            onChange={(e) => updateField("inactiveTime", e.target.value)}
            label="Inactive"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <RecipeField
            value={recipe.cookTime}
            onChange={(e) => updateField("cookTime", e.target.value)}
            label="Cook"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="subtitle" sx={{ lineHeight: "60px" }}>
            Total time: {totalTime}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default Details;
