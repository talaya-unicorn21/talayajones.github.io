
/* Web Design Quiz
   Grades ten questions, tracks completion time, and supports retakes. */

const form = document.getElementById("quiz-form");
const results = document.getElementById("results");
const timerDisplay = document.getElementById("timer");
const submitButton = document.getElementById("submit-quiz");

const totalSeconds = 10 * 60;
let secondsRemaining = totalSeconds;
let timerInterval;
let quizFinished = false;

// Each question is worth 10 points. Answers also include explanations.
const answerKey = [
    {
        number: 1,
        answer: "markup",
        display: "Markup",
        explanation: "HTML stands for HyperText Markup Language."
    },
    {
        number: 2,
        answer: "cascading",
        display: "Cascading",
        explanation: "CSS stands for Cascading Style Sheets."
    },
    {
        number: 3,
        answer: "b",
        display: "<a>",
        explanation: "The anchor element creates hyperlinks."
    },
    {
        number: 4,
        answer: "c",
        display: "To style and lay out web pages",
        explanation: "CSS controls presentation, layout, colors, and fonts."
    },
    {
        number: 5,
        answer: "d",
        display: "<h1>",
        explanation: "The h1 element is the highest-level standard heading."
    },
    {
        number: 6,
        answer: "b",
        display: ".card",
        explanation: "A period selects a CSS class."
    },
    {
        number: 7,
        answer: "c",
        display: "Adapt to different screen sizes",
        explanation: "Responsive design helps pages work on different devices."
    },
    {
        number: 8,
        answer: ["a", "b", "c"],
        display: "CSS media queries, flexible layouts, and a viewport meta tag",
        explanation: "These techniques help pages adapt to different screens."
    },
    {
        number: 9,
        answer: "true",
        display: "True",
        explanation: "Alternative text describes an image when appropriate."
    },
    {
        number: 10,
        answer: "alt",
        display: "alt",
        explanation: "The alt attribute provides alternative text for an image."
    }
];

// Get the selected radio value or the typed answer.
function getAnswer(questionNumber) {
    if (questionNumber === 1 || questionNumber === 2 ||
        questionNumber === 10) {
        return document.getElementById(`q${questionNumber}`)
            .value.trim().toLowerCase();
    }

    if (questionNumber === 8) {
        return Array.from(
            form.querySelectorAll('input[name="q8"]:checked')
        ).map(input => input.value).sort();
    }

    const selected = form.querySelector(
        `input[name="q${questionNumber}"]:checked`
    );

    return selected ? selected.value : "";
}

// Compare answers, including exact matching for the multi-select question.
function isCorrect(question, userAnswer) {
    if (question.number === 8) {
        return Array.isArray(userAnswer) &&
            userAnswer.length === question.answer.length &&
            userAnswer.every((value, index) =>
                value === question.answer[index]
            );
    }

    return userAnswer === question.answer;
}

// Format the remaining time as minutes and seconds.
function updateTimerDisplay() {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;

    timerDisplay.textContent =
        `${minutes}:${String(seconds).padStart(2, "0")}`;

    timerDisplay.classList.toggle(
        "timer-warning",
        secondsRemaining <= 60
    );
}

// Start the ten-minute countdown.
function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (quizFinished) {
            clearInterval(timerInterval);
            return;
        }

        secondsRemaining--;
        updateTimerDisplay();

        if (secondsRemaining <= 0) {
            finishQuiz(true);
        }
    }, 1000);
}

// Grade the quiz and show all feedback on the same page.
function finishQuiz(timeExpired = false) {
    if (quizFinished) return;

    quizFinished = true;
    clearInterval(timerInterval);

    const timeSpent = totalSeconds - secondsRemaining;
    let score = 0;
    let reviewHTML = "";

    answerKey.forEach(question => {
        const userAnswer = getAnswer(question.number);
        const correct = isCorrect(question, userAnswer);

        if (correct) score += 10;

        let submittedAnswer;

        if (Array.isArray(userAnswer)) {
            submittedAnswer = userAnswer.length
                ? userAnswer.join(", ")
                : "Not answered";
        } else {
            submittedAnswer = userAnswer || "Not answered";
        }

        reviewHTML += `
            <article class="answer-review ${correct ? "correct" : "incorrect"}">
                <h3>Question ${question.number}: 
                    ${correct ? "Correct" : "Incorrect"}</h3>
                <p><strong>Your answer:</strong>
                    ${escapeHTML(submittedAnswer)}</p>
                <p><strong>Correct answer:</strong>
                    ${escapeHTML(question.display)}</p>
                <p>${question.explanation}</p>
                <p><strong>Points:</strong> ${correct ? 10 : 0}/10</p>
            </article>
        `;
    });

    const passed = score >= 70;
    const minutesUsed = Math.floor(timeSpent / 60);
    const secondsUsed = timeSpent % 60;
    const formattedTime =
        `${minutesUsed}:${String(secondsUsed).padStart(2, "0")}`;

    results.innerHTML = `
        <div class="score-summary ${passed ? "pass" : "fail"}">
            <h2>${passed ? "You Passed!" : "Keep Practicing!"}</h2>
            <p class="final-score">${score}/100</p>
            <p>${passed
                ? "You earned at least 70% on the quiz."
                : "You need 70% to pass. Review the answers below and try again."}
            </p>
            <p><strong>Time spent:</strong> ${formattedTime}</p>
            ${timeExpired
                ? "<p>The 10-minute time limit was reached.</p>"
                : ""}
        </div>
        <h2>Question-by-Question Results</h2>
        ${reviewHTML}
    `;

    results.hidden = false;
    submitButton.disabled = true;
    form.querySelectorAll("input").forEach(input => {
        input.disabled = true;
    });

    results.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Escape user-entered text before displaying it in the results.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

form.addEventListener("submit", event => {
    event.preventDefault();
    finishQuiz(false);
});

// Reset answers, results, disabled controls, and the ten-minute timer.
form.addEventListener("reset", () => {
    clearInterval(timerInterval);
    quizFinished = false;
    secondsRemaining = totalSeconds;

    results.innerHTML = "";
    results.hidden = true;
    submitButton.disabled = false;

    form.querySelectorAll("input").forEach(input => {
        input.disabled = false;
    });

    timerDisplay.classList.remove("timer-warning");

    // Wait for the browser to clear the form fields before restarting.
    setTimeout(startTimer, 0);
});

// Start counting as soon as the quiz page loads.
startTimer();
