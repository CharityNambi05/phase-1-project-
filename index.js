const BASE_URL = 'http://localhost:4000/questions';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quiz-form');
    const questionIdInput = document.getElementById('question-id');
    const questionTextInput = document.getElementById('question-text');
    const answerOptionsInput = document.getElementById('answer-options');
    const questionsList = document.getElementById('questions');
    const quizSection = document.getElementById('quiz-section');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const answerForm = document.getElementById('answer-form');
    const quizResult = document.getElementById('quiz-result');

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // Function to fetch questions from JSON server
    async function loadQuestions() {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error('Network response was not ok.');
            questions = await response.json();
            renderQuestions();
            displayNextQuestion();
        } catch (error) {
            console.error('Failed to load questions:', error);
        }
    }

    // Function to render questions to the UI
    function renderQuestions() {
        questionsList.innerHTML = ''; // Clear existing questions
        questions.forEach(question => {
            const listItem = document.createElement('li');
            listItem.textContent = `${question.text} - Options: ${question.options.join(', ')}`;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editQuestion(question.id));
            listItem.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteQuestion(question.id));
            listItem.appendChild(deleteButton);

            questionsList.appendChild(listItem);
        });
    }

    // Function to display the next question in the quiz
    function displayNextQuestion() {
        if (currentQuestionIndex >= questions.length) {
            displayQuizResult();
            return;
        }

        const question = questions[currentQuestionIndex];
        quizQuestion.textContent = question.text;
        quizOptions.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionLabel = document.createElement('label');
            const optionInput = document.createElement('input');
            optionInput.type = 'radio';
            optionInput.name = 'quiz-option';
            optionInput.value = index;
            optionLabel.appendChild(optionInput);
            optionLabel.append(option);
            quizOptions.appendChild(optionLabel);
            quizOptions.appendChild(document.createElement('br'));
        });
    }

    // Function to handle quiz answer submission
    answerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
        if (!selectedOption) {
            alert('Please select an option.');
            return;
        }

        const selectedAnswerIndex = parseInt(selectedOption.value);
        const correctAnswerIndex = questions[currentQuestionIndex].correctOption;

        // Check if the selected answer index matches the correct answer index
        if (selectedAnswerIndex === correctAnswerIndex) {
            score++;
            quizResult.textContent = 'Correct!';
        } else {
            quizResult.textContent = 'Incorrect. Try again.';
        }

        currentQuestionIndex++;
        displayNextQuestion();
    });

    // Function to display the final quiz result
    function displayQuizResult() {
        quizQuestion.textContent = 'You have completed the quiz!';
        quizOptions.innerHTML = '';
        answerForm.style.display = 'none';
        quizResult.textContent = `Your score is ${score} out of ${questions.length}.`;
    }

    // Function to handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const id = questionIdInput.value;
        const text = questionTextInput.value.trim();
        const options = answerOptionsInput.value.split(',').map(option => option.trim());
        const correctOption = parseInt(prompt('Enter the index of the correct option (starting from 0):'));

        if (text && options.length && correctOption >= 0 && correctOption < options.length) {
            if (id) {
                // Update existing question
                const index = questions.findIndex(q => q.id === id);
                if (index !== -1) {
                    questions[index] = { id, text, options, correctOption };
                    await updateQuestion(questions[index]);
                }
            } else {
                // Create new question
                const newId = questions.length ? (parseInt(questions[questions.length - 1].id) + 1).toString() : '1';
                const newQuestion = {
                    id: newId,
                    text,
                    options,
                    correctOption
                };
                await createQuestion(newQuestion);
                questions.push(newQuestion);
            }

            // Reset form and render questions
            form.reset();
            questionIdInput.value = '';
            renderQuestions();
        } else {
            alert('Please provide a valid question, answer options, and correct option index.');
        }
    });

    // Function to delete a question
    async function deleteQuestion(id) {
        try {
            await fetch(`${BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            questions = questions.filter(question => question.id !== id);
            renderQuestions();
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    }

    // Function to create a new question
    async function createQuestion(question) {
        try {
            await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(question)
            });
        } catch (error) {
            console.error('Failed to create question:', error);
        }
    }

    // Function to update an existing question
    async function updateQuestion(question) {
        try {
            await fetch(`${BASE_URL}/${question.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(question)
            });
        } catch (error) {
            console.error('Failed to update question:', error);
        }
    }

    // Function to populate the form with the data of the question to be edited
    function editQuestion(id) {
        const question = questions.find(q => q.id === id);
        if (question) {
            questionIdInput.value = question.id;
            questionTextInput.value = question.text;
            answerOptionsInput.value = question.options.join(', ');
        }
    }

    // Initial load of questions
    loadQuestions();
});


