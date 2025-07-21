import "./App.css";
import { useEffect, useState } from "react";
import { socket } from "./socket";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
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
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem("NAME"));
  const [name, setName] = useState(localStorage.getItem("NAME"));
  // const [images, setImages] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selections, setSelections] = useState(defaultSelections);
  const [selected, setSelected] = useState(null);

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

    function onNext(data) {
      const { qid, stage } = data;
      console.log(qid, stage);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("next", onNext);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("next", onNext);
    };
  });

  const onJoin = () => {
    socket.emit("joinRoom");
    setShowWelcome(false);
    localStorage.setItem("NAME", name);
  };

  const onSubmit = () => {
    handleSubmit(currentQuestion, selected);
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
              onChange={(e) => setName(e.target.value)}
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
              #{currentQuestion} Where it is?
            </Typography>
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
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                disabled={!selected}
                onClick={onSubmit}
              >
                Submit
              </Button>
            </FormControl>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default App;
