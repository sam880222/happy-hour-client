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

export const getOptions = async (id) => {
  try {
    const response = await fetch(baseURL + `/question/${id}/options`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json(); // Parse the response as JSON
      console.log("Get options successful");
      return data;
    } else {
      console.error("Get options failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const getAnswer = async (id) => {
  try {
    const response = await fetch(baseURL + `/question/${id}/answer`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json(); // Parse the response as JSON
      console.log("Get answer successful");
      return data;
    } else {
      console.error("Get answer failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export const getScore = async () => {
  try {
    const response = await fetch(
      baseURL + `/score/${localStorage.getItem("ID")}`,
      {
        method: "GET",
      }
    );

    if (response.ok) {
      const data = await response.json(); // Parse the response as JSON
      console.log("Get score successful");
      return data;
    } else {
      console.error("Get score failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
