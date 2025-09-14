const form = document.getElementById('quiz-form');
const quizContainer = document.getElementById('quiz-container');
const validationMessage = document.getElementById('validation-message');

let correctAnswers = {};
let allQuestions;

async function loadQuiz() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const questions = await response.json();

        questions.forEach((q, index) => {
            const questionElement = document.createElement('div');
            questionElement.classList.add('question');

            const questionText = document.createElement('p');
            questionText.textContent = `${index + 1}. ${q.question}`;
            questionElement.appendChild(questionText);

            q.options.forEach((option, optionIndex) => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `q${index}`;
                input.value = option;

                label.appendChild(input);
                label.appendChild(document.createTextNode(` ${option}`));

                questionElement.appendChild(label);

                // Add an event listener to each radio button
                input.addEventListener('change', () => {
                    questionElement.classList.remove('unanswered');
                });
            });

            quizContainer.appendChild(questionElement);

            correctAnswers[`q${index}`] = q.options[q.correctAnswerIndex];
        });

        // Store all question elements after they are created
        allQuestions = document.querySelectorAll('.question');

    } catch (error) {
        console.error('Error loading quiz:', error);
    }
}

loadQuiz();

form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent immediate submission

    let allAnswered = true;
    let score = 0;
    const formData = new FormData(form);

    // Reset validation message
    validationMessage.textContent = '';

    // Check if all questions have been answered
    allQuestions.forEach((q, index) => {
        const questionName = `q${index}`;
        const answered = document.querySelector(`input[name="${questionName}"]:checked`);
        if (!answered) {
            q.classList.add('unanswered'); // Highlight unanswered question
            allAnswered = false;
        } else {
            q.classList.remove('unanswered');
        }
    });

    if (!allAnswered) {
        validationMessage.textContent = 'Please answer all questions before submitting.';
        return; // Stop the function here
    }

    // If all questions are answered, proceed with scoring and submission
    for (const [question, answer] of formData.entries()) {
        if (question.startsWith('q') && correctAnswers[question] && correctAnswers[question] === answer) {
            score++;
        }
    }

    const scoreInput = document.createElement('input');
    scoreInput.type = 'hidden';
    scoreInput.name = 'score';
    scoreInput.value = `${score} out of ${Object.keys(correctAnswers).length}`;
    form.appendChild(scoreInput);

    // Finally, submit the form to Formspree
    form.submit();
});
