const baseURL = process.env.REACT_APP_API_BASE_URL;

export const handleSubmit = async (
  question,
  stage,
  selectedAnswer,
  onSuccess
) => {
  try {
    const response = await fetch(baseURL + "/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        stage,
        selection: selectedAnswer,
        id: localStorage.getItem("ID"),
      }),
    });

    if (response.ok) {
      console.log("Submission successful");
      onSuccess?.();
    } else {
      console.error("Submission failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error submitting data:", error);
  }
};
