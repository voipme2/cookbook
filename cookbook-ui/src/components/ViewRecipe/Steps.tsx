import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { Step } from "../../types";

const Steps = ({ steps }: { steps: Step[] }) => {
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
      {steps.map((step: Step, idx: number) => (
        <ListItem sx={{ my: 3, alignItems: "start" }} key={idx}>
          <ListItemAvatar>
            <Avatar>{idx + 1}</Avatar>
          </ListItemAvatar>
          <ListItemText
            sx={{
              color: "black",
            }}
            primary={step.text}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default Steps;
