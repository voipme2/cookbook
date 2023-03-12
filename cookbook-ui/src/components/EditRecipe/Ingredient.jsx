import {
  ListItemButton,
  ListItemSecondaryAction,
  TextField,
  IconButton,
  ButtonGroup,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const Ingredient = ({
  ingredient,
  isFirst,
  isLast,
  handleIngredientChange,
  handleIngredientDelete,
  handleMoveUp,
  handleMoveDown,
}) => {
  return (
    <ListItemButton>
      <TextField
        value={ingredient.text}
        sx={{ marginRight: "110px" }}
        fullWidth
        onChange={handleIngredientChange}
      />
      <ListItemSecondaryAction>
        <ButtonGroup>
          <IconButton size="small" disabled={isFirst} onClick={handleMoveUp}>
            <ArrowUpward />
          </IconButton>
          <IconButton size="small" disabled={isLast} onClick={handleMoveDown}>
            <ArrowDownward />
          </IconButton>
          <IconButton
            size="small"
            aria-label="delete"
            onClick={handleIngredientDelete}
          >
            <DeleteIcon />
          </IconButton>
        </ButtonGroup>
      </ListItemSecondaryAction>
    </ListItemButton>
  );
};

export default Ingredient;
