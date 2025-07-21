const baseURL = process.env.REACT_APP_API_BASE_URL;

export const handleSubmit = async (currentQuestion, selectedAnswer) => {
  try {
    const response = await fetch(baseURL + "/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: currentQuestion,
        selection: selectedAnswer,
        name: localStorage.getItem("NAME"),
      }),
    });

    if (response.ok) {
      console.log("Submission successful");
    } else {
      console.error("Submission failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error submitting data:", error);
  }
};
