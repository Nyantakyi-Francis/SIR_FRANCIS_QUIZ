const form = document.getElementById('quiz-form');
const quizContainer = document.getElementById('quiz-container');

// This object will store the correct answers after fetching the questions.
let correctAnswers = {};

// Function to fetch the quiz questions from the JSON file and build the UI.
async function loadQuiz() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const questions = await response.json();

        // Loop through each question from the JSON data.
        questions.forEach((q, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('question');

            // Add the question text.
            const questionText = document.createElement('p');
            questionText.textContent = `${index + 1}. ${q.question}`;
            questionElement.appendChild(questionText);

            // Add the answer options as radio buttons.
            q.options.forEach((option, optionIndex) => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `q${index}`; // Unique name for each question group
                input.value = option;

                label.appendChild(input);
                label.appendChild(document.createTextNode(` ${option}`));

                questionElement.appendChild(label);
            });

            // Append the entire question div to the quiz container.
            quizContainer.appendChild(questionElement);

            // Store the correct answer for scoring later.
            // We use the question index as the key.
            correctAnswers[`q${index}`] = q.options[q.correctAnswerIndex];
        });

    } catch (error) {
        console.error('Error loading quiz:', error);
    }
}

// Call the function to load the quiz when the page first loads.
loadQuiz();

// Event listener to handle form submission.
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting immediately.

    let score = 0;
    const formData = new FormData(form);

    // Loop through the form data to check the selected answers.
    for (const [question, answer] of formData.entries()) {
        // We only want to check the quiz questions, which start with 'q'.
        if (question.startsWith('q') && correctAnswers[question] && correctAnswers[question] === answer) {
            score++;
        }
    }

    // Create a new hidden input field to send the final score to Formspree.
    const scoreInput = document.createElement('input');
    scoreInput.type = 'hidden';
    scoreInput.name = 'score';
    scoreInput.value = `${score} out of ${Object.keys(correctAnswers).length}`;
    form.appendChild(scoreInput);

    // Now, we can submit the form to Formspree.
    form.submit();
});