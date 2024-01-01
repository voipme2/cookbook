import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { grey } from "@mui/material/colors";
const Step = ({ step, index }) => (
  <ListItem sx={{ my: 3 }}>
    <ListItemAvatar>
      <Avatar>{index + 1}</Avatar>
    </ListItemAvatar>
    <ListItemText
      sx={{
        color: "black",
      }}
      primary={step}
    />
  </ListItem>
);

const Steps = ({ steps }) => {
  return (
    <List>
      <ListSubheader sx={{ color: "primary.main", bgcolor: grey[100] }}>
        Steps
      </ListSubheader>
      {steps.length === 0 && (
        <ListItem>
          <ListItemText primary={"Just mix the ingredients"} />
        </ListItem>
      )}
      {steps.map((step, idx) => (
        <Step key={`step-${idx}`} step={step.text} index={idx} />
      ))}
    </List>
  );
};

export default Steps;
