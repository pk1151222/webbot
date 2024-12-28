const quizArea = document.getElementById("quiz-area");
const leaderboardList = document.getElementById("leaderboard-list");

let currentQuestionIndex = 0;
let userAnswers = [];
let userScore = 0;
let userId = 'user123'; // Example user ID

// Fetch and display quiz questions
async function startQuiz() {
    const response = await fetch('http://localhost:3000/questions');
    const questions = await response.json();
    
    loadQuestion(questions);
}

// Load the current question
function loadQuestion(questions) {
    const currentQuestion = questions[currentQuestionIndex];
    quizArea.innerHTML = `
        <p>${currentQuestion.question}</p>
        ${currentQuestion.options.map(option => `
            <button onclick="answerQuestion('${option}', '${currentQuestion.answer}', '${currentQuestion.question}')">${option}</button>
        `).join('')}
    `;
}

// Handle question answers
async function answerQuestion(selected, correct, questionText) {
    if (selected === correct) {
        userScore++;
    }
    userAnswers.push(selected);
    currentQuestionIndex++;

    // Fetch AI explanation
    const explanation = await getAIExplanation(questionText, selected);
    displayExplanation(explanation);

    if (currentQuestionIndex < 5) { // Assuming 5 questions per quiz
        startQuiz();
    } else {
        finishQuiz();
    }
}

// Function to get explanation from AI (via backend)
async function getAIExplanation(question, selectedAnswer) {
    const response = await fetch('http://localhost:3000/get-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, selectedAnswer }),
    });

    const data = await response.json();
    return data.explanation;
}

// Display AI explanation
function displayExplanation(explanation) {
    const explanationDiv = document.createElement('div');
    explanationDiv.innerHTML = `<h3>AI Explanation:</h3><p>${explanation}</p>`;
    quizArea.appendChild(explanationDiv);
}

// End the quiz and submit results
async function finishQuiz() {
    // Submit the result
    await fetch('http://localhost:3000/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, score: userScore }),
    });
    
    // Show the final score
    quizArea.innerHTML = `<h2>Your Score: ${userScore}</h2>`;
}

// View leaderboard
async function viewLeaderboard() {
    const response = await fetch('http://localhost:3000/leaderboard');
    const leaderboard = await response.json();
    
    leaderboardList.innerHTML = leaderboard.map(entry => `
        <li>${entry.userId}: ${entry.score}</li>
    `).join('');
}
