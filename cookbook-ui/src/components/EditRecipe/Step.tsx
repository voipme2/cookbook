import {
  Avatar,
  ButtonGroup,
  IconButton,
  ListItem,
  ListItemAvatar,
  TextField,
} from "@mui/material";
import {
  ArrowDownward,
  ArrowUpward,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import React from "react";
import { Step as IStep } from "../../types";

const Step = ({
  step,
  idx,
  isFirst,
  isLast,
  handleStepChange,
  handleStepDelete,
  handleMoveUp,
  handleMoveDown,
}: {
  step: IStep;
  idx: number;
  isFirst: boolean;
  isLast: boolean;
  handleStepChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleStepDelete: () => void;
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
              onClick={handleStepDelete}
            >
              <DeleteIcon />
            </IconButton>
          </ButtonGroup>
        </>
      }
    >
      <ListItemAvatar>
        <Avatar>{idx + 1}</Avatar>
      </ListItemAvatar>
      <TextField
        value={step.text}
        sx={{ marginRight: "125px" }}
        fullWidth
        multiline
        onChange={handleStepChange}
      />
    </ListItem>
  );
};

export default Step;
