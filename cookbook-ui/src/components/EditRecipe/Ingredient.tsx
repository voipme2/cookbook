import { ButtonGroup, IconButton, ListItem, TextField } from "@mui/material";
import {
  ArrowDownward,
  ArrowUpward,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { ChangeEvent } from "react";
import { Ingredient as IIngredient } from "../../types";

const Ingredient = ({
  ingredient,
  isFirst,
  isLast,
  handleIngredientChange,
  handleIngredientDelete,
  handleMoveUp,
  handleMoveDown,
}: {
  ingredient: IIngredient;
  isFirst: boolean;
  isLast: boolean;
  handleIngredientChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleIngredientDelete: () => void;
  handleMoveUp: () => void;
  handleMoveDown: () => void;
}) => {
  return (
    <ListItem
      secondaryAction={
        <>
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
        </>
      }
    >
      <TextField
        value={ingredient.text}
        sx={{ marginRight: "110px" }}
        fullWidth
        onChange={handleIngredientChange}
      />
    </ListItem>
  );
};

export default Ingredient;
