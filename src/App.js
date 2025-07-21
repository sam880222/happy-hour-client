import "./App.css";
import { useEffect, useState } from "react";
import { socket } from "./socket";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { handleSubmit } from "./api";

const defaultSelections = ["A", "B", "C", "D"];
function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [name, setName] = useState(localStorage.getItem("NAME"));
  // const [images, setImages] = useState([])
  const [qid, setQid] = useState(null);
  const [stage, setStage] = useState(null);
  const [selections, setSelections] = useState(defaultSelections);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedSelection, setSubmittedSelection] = useState(null);

  useEffect(() => {
    function onConnect() {
      console.log("Connected from the server");
    }

    function onDisconnect() {
      console.log("Disconnected from the server");
    }

    function onMessage(data) {
      console.log("Message from server:", data);
    }

    function onUpdateQuestion(qid, stage) {
      setQid(qid);
      setStage(stage);
      console.log(qid, stage);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("updateQuestion", onUpdateQuestion);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("updateQuestion", onUpdateQuestion);
    };
  });

  const onJoin = () => {
    let id = localStorage.getItem("ID");
    if (id === null) {
      id = socket.id;
      localStorage.setItem("ID", id);
    }
    socket.emit("joinRoom", id, name);
    localStorage.setItem("NAME", name);
    setShowWelcome(false);
  };

  const onSubmit = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    await handleSubmit(qid, stage, selected, () => {
      setSubmittedSelection(selected);
    });
    setIsLoading(false);
  };

  return (
    <Box
      className="App"
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "content-box",
      }}
    >
      <Paper
        sx={{
          width: "90%",
          maxWidth: 480,
          p: 4,
          background: "rgba(255, 255, 255, 0.4)",
          boxSizing: "border-box",
        }}
      >
        {showWelcome ? (
          <Box>
            <Typography variant="h6">Please enter your name:</Typography>
            <TextField
              value={name}
              onChange={(e) => {
                let newValue = e.target.value;
                if (newValue.length <= 24) {
                  setName(newValue);
                }
              }}
              variant="standard"
              sx={{
                width: "80%",
                pt: 2,
                "& input": { textAlign: "center", fontSize: "1.2rem" },
              }}
            />
            <Button
              size="large"
              sx={{ mt: 4, maxWidth: "50%" }}
              variant="outlined"
              fullWidth
              onClick={onJoin}
            >
              Join
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {qid === null
                ? "Waiting to start..."
                : `#${qid + 1} Where it is?`}
            </Typography>
            {!qid && [0, 1, 2].includes(stage) && (
              <FormControl>
                <RadioGroup
                  name="radio-buttons-group"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <Grid container>
                    {defaultSelections.map((selection, index) => (
                      <Grid size={6} key={selection}>
                        <FormControlLabel
                          value={selection}
                          control={<Radio />}
                          label={selections[index] ?? selection}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>
                {submittedSelection && (
                  <Typography color="success" sx={{ mt: 2 }}>
                    You selected: {submittedSelection}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  disabled={
                    !selected || isLoading || submittedSelection === selected
                  }
                  onClick={onSubmit}
                >
                  Submit
                </Button>
              </FormControl>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default App;
