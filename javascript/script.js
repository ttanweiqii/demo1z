const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const answerOptions = document.querySelector(".answer-options");
const nextQuestionBtn = document.querySelector(".next-question-btn");
const questionStatus = document.querySelector(".question-status");
const timerDisplay = document.querySelector(".time-duration");
const resultContainer = document.querySelector(".result-container");

// Quiz state variables
const QUIZ_TIME_LIMIT = 15;
let currentTime = QUIZ_TIME_LIMIT;
let timer = null;
let quizCategory = "programming";
let numberOfQuestions = 5;
let currentQuestion = null;
const questionsIndexHistory = [];
let correctAnswersCount = 0;

// Display the quiz results and hide the quiz container
const showQuizResults = () => {
  quizContainer.style.display = "none";
  resultContainer.style.display = "block";

  const resultText = `
        You answered <strong>${correctAnswersCount}</strong> out of <strong>${numberOfQuestions}</strong> questions
        correctly. Great effort!
      `;
  document.querySelector(".result-message").innerHTML = resultText; // Display the result message
};

//clear and reset the timer
const resetTimer = () => {
  clearInterval(timer); // Clear the existing timer
  currentTime = QUIZ_TIME_LIMIT; // Reset the time limit
  timerDisplay.textContent = `${currentTime}s`; // Immediately update the display
};

const startTimer = () => {
  timer = setInterval(() => {
    currentTime--;
    timerDisplay.textContent = `${currentTime}s`;
    if (currentTime <= 0) {
      clearInterval(timer);
      highlightCorrectAnswer();

      nextQuestionBtn.style.visibility = "visible";

      quizContainer.querySelector(".quiz-timer").style.background = "#c31402";

      // Disable all answer options after one option is selected
      answerOptions
        .querySelectorAll(".answer-option")
        .forEach((option) => (option.style.pointerEvents = "none"));
    }
  }, 1000);
};

// Fetch a random question from based on the selected category
const getRandomQuestion = () => {
  const categoryQuestions =
    questions.find(
      (cat) => cat.category.toLowerCase() === quizCategory.toLowerCase()
    ).questions || [];

  // Show the results if all questions have been used
  if (
    questionsIndexHistory.length >=
    Math.min(categoryQuestions.length, numberOfQuestions)
  ) {
    return showQuizResults();
  }

  // Filter out already asked questions and choose a random one
  const availableQuestions = categoryQuestions.filter(
    (_, index) => !questionsIndexHistory.includes(index)
  );
  const randomQuestion =
    availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

  questionsIndexHistory.push(categoryQuestions.indexOf(randomQuestion));
  return randomQuestion;
};

/* Highlight the correct answer option when the user selects an incorrect one
 * and addicons to the selected option and the correct option
 */
const highlightCorrectAnswer = () => {
  const correctOption =
    answerOptions.querySelectorAll(".answer-option")[
      currentQuestion.correctAnswer
    ];
  correctOption.classList.add("correct");
  const iconHTML = `<span class="material-symbols-rounded">check_circle</span>`;

  correctOption.insertAdjacentHTML("beforeend", iconHTML);
};

const handleAnswer = (option, answerIndex) => {
  clearInterval(timer); // Stop the timer when an answer is selected
  const isCorrect = currentQuestion.correctAnswer === answerIndex;
  option.classList.add(isCorrect ? "correct" : "incorrect");

  !isCorrect ? highlightCorrectAnswer() : correctAnswersCount++;

  // Insert icon based on the answer correctness
  const iconHTML = `<span class="material-symbols-rounded">${
    isCorrect ? "check_circle" : "cancel"
  }</span>`;

  option.insertAdjacentHTML("beforeend", iconHTML); // Add icon to the selected option

  // Disable all answer options after one option is selected
  answerOptions
    .querySelectorAll(".answer-option")
    .forEach((option) => (option.style.pointerEvents = "none"));

  nextQuestionBtn.style.visibility = "visible";
};

// Render the current question and its options in the quiz
const renderQuestion = () => {
  currentQuestion = getRandomQuestion();
  if (!currentQuestion) return;

  resetTimer(); // Reset the timer for the new question
  startTimer(); // Start the timer for the current question

  // Update the UI
  answerOptions.innerHTML = ""; // Clear previous options
  nextQuestionBtn.style.visibility = "hidden"; // Hide the button initially
  quizContainer.querySelector(".quiz-timer").style.background = "#32313c";
  document.querySelector(".question-text").textContent =
    currentQuestion.question;
  questionStatus.innerHTML = `<strong>${questionsIndexHistory.length}</strong> out of <strong>${numberOfQuestions}</strong> Questions`; // Clear previous status

  // Create option <li> elements, append them, and add click event listeners
  currentQuestion.options.forEach((option, index) => {
    const li = document.createElement("li");
    li.classList.add("answer-option");
    li.textContent = option;
    answerOptions.appendChild(li);
    li.addEventListener("click", () => handleAnswer(li, index));
  });
};

// Start the quiz and render the random question
const startQuiz = () => {
  configContainer.style.display = "none"; // Hide the configuration container
  quizContainer.style.display = "block"; // Show the quiz container

  // Update the quiz category and number of questions
  quizCategory = configContainer
    .querySelector(".category-option.active")
    .textContent.trim()
    .toLowerCase();
  numberOfQuestions = parseInt(
    configContainer
      .querySelector(".question-option.active")
      .textContent.trim()
      .toLowerCase()
  );

  renderQuestion(); // Render the first question
};

// Highlight the selected category and question option
document
  .querySelectorAll(".category-option, .question-option")
  .forEach((option) => {
    option.addEventListener("click", () => {
      option.parentNode.querySelector(".active").classList.remove("active");
      option.classList.add("active"); // Add active class to the selected option
    });
  });

// Reset the quiz and return UI for a new attempt
const resetQuiz = () => {
  resetTimer(); // Reset the timer
  // Reset all state variables
  correctAnswersCount = 0;
  questionsIndexHistory.length = 0;
  configContainer.style.display = "block";
  resultContainer.style.display = "none";
};

renderQuestion();

nextQuestionBtn.addEventListener("click", renderQuestion);
document.querySelector(".try-again-btn").addEventListener("click", resetQuiz);
document.querySelector(".start-quiz-btn").addEventListener("click", startQuiz);
document.querySelector(".exit-quiz-btn").addEventListener("click", () => {
  // Confirm and exit logic
  const confirmExit = confirm("Are you sure you want to exit the quiz?");
  if (confirmExit) {
    clearInterval(timer);
    correctAnswersCount = 0;
    questionsIndexHistory.length = 0;
    quizContainer.style.display = "none";
    configContainer.style.display = "block";
  }
});
