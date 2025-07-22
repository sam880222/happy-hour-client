import { Avatar, Paper, Typography } from "@mui/material";

const UserView = ({ name, score }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 99,
        padding: 0.5,
        mb: 2,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
      }}
    >
      <Avatar
        sx={{ backgroundColor: `hsl(${hashNameToHue(name ?? "")}, 72%, 60%)` }}
      >
        {name?.[0]}
      </Avatar>
      <Typography sx={{ mx: 2 }} variant="h6">{`${name} - score: ${
        score ?? 0
      }`}</Typography>
    </Paper>
  );
};

// Hash function to convert name to a hue (0-360)
function hashNameToHue(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360); // Ensure the result is between 0 and 360
}

export default UserView;
