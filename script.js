document.addEventListener('DOMContentLoaded', () => {
    let allQuestions = [];
    let selectedQuestions = [];
    const form = document.getElementById('quiz-form');
    const container = document.getElementById('questions-container');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');

    async function loadQuiz() {
        try {
            // Using a relative path for the fetch
            const response = await fetch('./data.json');
            if (!response.ok) throw new Error('Network response was not ok');
            
            allQuestions = await response.json();
            selectedQuestions = prepareExam(allQuestions);
            renderQuiz();
        } catch (err) {
            loading.innerHTML = `
                <p style="color:red"><b>Error Loading Questions:</b><br>
                ${err.message}<br><br>
                <i>Professor's Note: Make sure you are running this through a Local Server (e.g., VS Code Live Server) and that 'data.json' is in the same folder.</i></p>
            `;
        }
    }

    function prepareExam(data) {
        const htmlPool = data.filter(q => q.topic === 'HTML');
        const cssPool = data.filter(q => q.topic === 'CSS');
        const jsPool = data.filter(q => q.topic === 'Javascript');

        const finalSelection = [
            ...getRandom(htmlPool, 5),  // Number of HTML questions to select
            ...getRandom(cssPool, 5),   // Number of CSS questions to select
            ...getRandom(jsPool, 10)    // Number of Javascript questions to select
        ];

        return finalSelection.sort(() => Math.random() - 0.5);
    }

    function getRandom(arr, n) {
        let shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, (n > arr.length ? arr.length : n));
    }

    function renderQuiz() {
        loading.classList.add('hidden');
        form.classList.remove('hidden');
        container.innerHTML = ''; // Clear existing content
        
        selectedQuestions.forEach((item, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'question-block';
            qDiv.innerHTML = `
                <span class="question-text">${index + 1}. ${item.q}</span>
                <div class="options-group">
                    ${item.options.map((opt, i) => `
                        <label class="option" id="label-${index}-${i}">
                            <input type="radio" name="q${index}" value="${i}" required> ${opt}
                        </label>
                    `).join('')}
                </div>
                <div id="feedback-${index}" class="hidden"></div>
            `;
            container.appendChild(qDiv);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let score = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        selectedQuestions.forEach((item, index) => {
            const selectedInput = document.querySelector(`input[name="q${index}"]:checked`);
            const selectedValue = parseInt(selectedInput.value);
            const feedbackDiv = document.getElementById(`feedback-${index}`);
            
            document.querySelectorAll(`input[name="q${index}"]`).forEach(i => i.disabled = true);

            const isCorrect = selectedValue === item.correct;
            if (isCorrect) score++;

            const correctLabel = document.getElementById(`label-${index}-${item.correct}`);
            const userLabel = document.getElementById(`label-${index}-${selectedValue}`);
            
            if (correctLabel) {
                correctLabel.style.backgroundColor = "var(--success-bg)";
                correctLabel.style.borderColor = "var(--success-border)";
            }
            
            if (!isCorrect && userLabel) {
                userLabel.style.backgroundColor = "var(--error-bg)";
                userLabel.style.borderColor = "var(--error-border)";
            }

            feedbackDiv.classList.remove('hidden');
            feedbackDiv.classList.add('rationale');
            feedbackDiv.innerHTML = `
                <span class="${isCorrect ? 'correct-label' : 'wrong-label'}">
                    ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <p><strong>Rationale:</strong> ${item.rationale}</p>
            `;
        });

        const percent = Math.round((score / selectedQuestions.length) * 100);
        document.getElementById('submit-btn').classList.add('hidden');
        resultContainer.classList.remove('hidden');
        document.getElementById('percentage-display').innerText = `${percent}%`;
        document.getElementById('score-text').innerText = `Final Score: ${score} / ${selectedQuestions.length}`;
    });

    loadQuiz();
});