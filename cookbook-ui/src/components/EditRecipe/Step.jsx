import {
  Avatar,
  ListItemAvatar,
  ListItem,
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

const Step = ({
  step,
  idx,
  isFirst,
  isLast,
  handleStepChange,
  handleStepDelete,
  handleMoveUp,
  handleMoveDown,
}) => {
  return (
    <ListItem>
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
            onClick={handleStepDelete}
          >
            <DeleteIcon />
          </IconButton>
        </ButtonGroup>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default Step;
