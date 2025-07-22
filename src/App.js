import "./App.css";
import { useEffect, useState } from "react";
import { socket } from "./socket";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { getAnswer, getOptions, getScore, handleSubmit } from "./api";
import UserView from "./components/UserView";

const Stage = {
  hint1: 0,
  hint2: 1,
  hint3: 2,
  answer: 3,
  leaderboard: 4,
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [name, setName] = useState(localStorage.getItem("NAME"));
  // const [images, setImages] = useState([])
  const [qid, setQid] = useState(null);
  const [stage, setStage] = useState(null);
  const [options, setOptions] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedSelection, setSubmittedSelection] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [sharer, setSharer] = useState(null);
  const [score, setScore] = useState(null);

  useEffect(() => {
    function onConnect() {
      let id = localStorage.getItem("ID");
      if (name !== null && id !== null) {
        socket.emit("joinRoom", id, name);
        setShowWelcome(false);
        updateScore(qid);
      }
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
      switch (stage) {
        case Stage.hint1:
          updateOptions(qid);
          break;
        case Stage.hint2:
        case Stage.hint3:
          if (options === null) {
            updateOptions(qid);
          }
          break;
        case Stage.answer:
          if (options === null) {
            updateOptions(qid);
          }
          updateAnswer(qid);
          updateScore(qid);
          break;
        case Stage.leaderboard:
        default:
          setOptions(null);
          setAnswer(null);
          setSharer(null);
          setSelected(null);
          setSubmittedSelection(null);
          break;
      }
    }

    function onRestarted() {
      setQid(null);
      setStage(null);
      setOptions(null);
      setSelected(null);
      setIsLoading(false);
      setSubmittedSelection(null);
      setAnswer(null);
      setSharer(null);
      setScore(null);
      let id = localStorage.getItem("ID");
      if (name !== null && id !== null) {
        socket.emit("joinRoom", id, name);
        setShowWelcome(false);
        updateScore(qid);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("updateQuestion", onUpdateQuestion);
    socket.on("restarted", onRestarted);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("updateQuestion", onUpdateQuestion);
      socket.off("restarted", onRestarted);
    };
  });

  const updateScore = async () => {
    const score = await getScore();
    setScore(score);
  };

  const updateAnswer = async (id) => {
    const { answer, name } = await getAnswer(id);
    setAnswer(answer);
    setSharer(name);
  };

  const updateOptions = async (id) => {
    const options = await getOptions(id);
    setOptions(options);
  };

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

  const getTitle = () => {
    if (qid === null) {
      return "Waiting to start...";
    }
    switch (stage) {
      case Stage.answer:
        return sharer + " is sharing...";
      case Stage.leaderboard:
        return `Current Score (Q${qid + 1})`;
      default:
        return `#${qid + 1} - Hint ${stage + 1}`;
    }
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
      {!showWelcome && name !== null && (
        <UserView name={name} score={score?.score} />
      )}
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
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6" sx={{ mb: 2 }}>
              {getTitle()}
            </Typography>
            {qid !== null && stage < Stage.answer && (
              <FormControl>
                <RadioGroup
                  name="radio-buttons-group"
                  value={selected}
                  onChange={(e) => setSelected(Number(e.target.value))}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "start",
                    }}
                  >
                    {options?.map((option, index) => (
                      <FormControlLabel
                        key={option}
                        value={index}
                        control={<Radio />}
                        label={String.fromCharCode(65 + index) + ". " + option}
                      />
                    ))}
                  </Box>
                </RadioGroup>
              </FormControl>
            )}
            {qid !== null && stage !== Stage.leaderboard && answer !== null && (
              <Typography sx={{ mt: 2 }}>
                {"Answer: " +
                  String.fromCharCode(65 + answer) +
                  ". " +
                  options?.[answer]}
              </Typography>
            )}
            {qid !== null &&
            stage !== Stage.leaderboard &&
            submittedSelection !== null ? (
              <Typography
                color={
                  answer !== null
                    ? answer === submittedSelection
                      ? "success"
                      : "error"
                    : "info"
                }
                sx={{ mt: 2 }}
              >
                {`You selected: ${String.fromCharCode(
                  65 + submittedSelection
                )}. ${options?.[submittedSelection]}`}
              </Typography>
            ) : (
              <></>
            )}
            {qid !== null && stage < Stage.answer && (
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                disabled={
                  selected === null ||
                  isLoading ||
                  submittedSelection === selected
                }
                onClick={onSubmit}
              >
                Submit
              </Button>
            )}
            {qid !== null && stage === Stage.leaderboard && (
              <Box>
                <Typography variant="h1" fontWeight="bold">
                  {score?.score}
                </Typography>
                <Typography variant="h6">{"Rank #" + score?.rank}</Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default App;
