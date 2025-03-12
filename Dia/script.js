// At the very top of your script.js, outside the DOMContentLoaded event listener
let userAnswers = [];
let quizQuestions = [];
let currentQuestionIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const quizContainer = document.getElementById('quiz-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const questionCounter = document.getElementById('question-counter');
    const checkAnswersBtn = document.getElementById('check-answers-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Initialize quizQuestions here
    quizQuestions = [
        {
            type: 'multiple-choice',
            text: 'Câu 1. Loại hình vận tải có khối lượng vận chuyển hàng hóa lớn nhất ở nước ta hiện nay là',
            options: [
                'A. đường ô tô',
                'B. đường hàng không.',
                'C. đường biển.',
                'D. đường sắt'
            ],
            correctAnswer: 0
        },
        {
            type: 'multiple-choice',
            text: 'Câu 2. Hoạt động du lịch biển của nước ta hiện nay',
            options: [
                'A. hầu hết chỉ có du khách nội địa.',
                'B. hoàn toàn do nhà nước thực hiện',
                'C có loại hình ngày càng đa dạng.',
                'D. tập trung chủ yếu ở các hải đảo.'
            ],
            correctAnswer: 2
        },
        {
            type: 'multiple-choice',
            text: 'Câu 3. Vùng Trung du và miền núi Bắc Bộ giáp với vùng nào sau đây?',
            options: [
                'A. Đồng bằng sông Hồng.',
                'B. Tây Nguyên.',
                'C. Đông Nam Bộ.',
                'D. Đồng bằng sông Cửu Long.'
            ],
            correctAnswer: 0
        },
        {
            type: 'multiple-choice',
            text: 'Câu 4. Trung du và miền núi Bắc Bộ dẫn đầu cả nước về số lượng vật nuôi nào sau đây?',
            options: [
                'A. Cừu',
                'B. Trâu.',
                'C. Vit.',
                'D. Gà'
            ],
            correctAnswer: 1
        },
        {
            type: 'multiple-choice',
            text: 'Câu 5. Dân cư tập trung đông đúc ở Đồng bằng sông Hồng không phải là do',
            options: [
                'A. trồng lúa nước cần nhiều lao động.',
                'B. vùng mới được khai thác gần đây.',
                'C. có nhiều trung tâm công nghiệp.',
                'D. có nhiều điều kiện lợi cho cư trú.'
            ],
            correctAnswer: 1
        },
        {
            type: 'multiple-choice',
            text: 'Câu 6. Tỉnh nào sau đây thuộc Đồng bằng sông Hồng?',
            options: [
                'A. Vĩnh Phúc.',
                'B. Phú Thọ.',
                'C. Thanh Hóa.',
                'D. Bắc Giang.'
            ],
            correctAnswer: 0
        },
        {
            type: 'multiple-choice',
            text: 'Câu 7. Bắc Trung Bộ không tiếp giáp với vùng nào sau đây?',
            options: [
                'A. Đồng bằng sông Hồng.',
                'B. Trung du và miền núi Bắc Bộ.',
                'C. Duyên hải Nam Trung Bộ.',
                'D. Tây nguyên.'
            ],
            correctAnswer: 3
        },
        {
            type: 'multiple-choice',
            text: 'Câu 8. Thế mạnh để Bắc Trung Bộ phát triển khai thác hải sản là',
            options: [
                'A. có mật độ sông ngòi khá cao.',
                'B. có một số nguồn nước khoáng.',
                'C. rừng tự nhiên có diện tích lớn.',
                'D. vùng biển rộng, giàu nguồn lợi.'
            ],
            correctAnswer: 3
        },
        {
            type: 'multiple-choice',
            text: 'Câu 9. Quần đảo Hoàng Sa thuộc tỉnh/thành phố nào sau đây của nước ta?',
            options: [
                'A. Đà Nẵng.',
                'B. Quảng Nam.',
                'C. Quảng Ngãi.',
                'D. Khánh Hòa.'
            ],
            correctAnswer: 0
        },
        {
            type: 'multiple-choice',
            text: 'Câu 10. Dầu khí của Duyên hải Nam Trung Bộ được khai thác chủ yếu ở',
            options: [
                'A. Đà Nẵng.',
                'B. Quảng Nam.',
                'C. Bình Định.',
                'D. Bình Thuận.'
            ],
            correctAnswer: 3
        },
        {
            type: 'multiple-choice',
            text: 'Câu 11. Điều kiện nào sau đây thuận lợi nhất để phát triển chăn nuôi gia súc lớn ở Trung du và miền núi Bắc Bộ?',
            options: [
                'A. Nguồn thức ăn dồi dào từ hoa màu.',
                'B. Có các đồng có lớn, chất lượng tốt.',
                'C. Thức ăn công nghiệp được đảm bảo.',
                'D. Dịch vụ thú y, có trạm trại giống tốt.'
            ],
            correctAnswer: 1
        },
        {
            type: 'multiple-choice',
            text: 'Câu 12. Biện pháp chủ yếu để đẩy mạnh phát triển du lịch biển đảo ở Duyên hải Nam Trung Bộ là',
            options: [
                'A. nâng cấp các cơ sở lưu trú, khai thác mới tài nguyên.',
                'B. hoàn thiện cơ sở hạ tầng, đa dạng loại hình sản phẩm.',
                'C. nâng cao trình độ người lao động, tích cực quảng bá.',
                'D. thu hút dân cư tham gia, phát triển du lịch cộng đồng.'
            ],
            correctAnswer: 1
        },
        {
            type: 'multiple-true-false',
            text: 'PHẦN II. Câu 1. Cho thông tin sau:',
            context: 'Đồng bằng sông Hồng là trung tâm kinh tế, chính trị, văn hóa, khoa học - công nghệ của cả nước. Vùng có nhiều thành phố, trong đó có Hà Nội là thủ đô. Vùng tiếp giáp nước láng giềng Trung Quốc, giáp Trung du và miền núi Bắc Bộ, Bắc Trung Bộ và Duyên hải miền Trung.',
            statements: [
                {
                    text: 'a) Đồng bằng sông Hồng nằm trong vùng kinh tế trọng điểm miền Trung.',
                    correctAnswer: false
                },
                {
                    text: 'b) Đồng bằng sông Hồng có tỉnh Quảng Ninh giáp với Trung Quốc.',
                    correctAnswer: true
                },
                {
                    text: 'c) Đồng bằng sông Hồng giáp Trung du và miền núi Bắc Bộ là một thuận lợi để mở rộng thị trường',
                    correctAnswer: true
                },
                {
                    text: 'd) Đồng bằng sông Hồng là trung tâm kinh tế, văn hóa, chính trị của cả nước nên vùng nhận được đầu tư lớn',
                    correctAnswer: true
                }
            ]
        },
        {
            type: 'multiple-true-false',
            text: 'PHẦN II. Câu 2. Cho bảng số liệu:',
            context: '+------------+-------+-------+-------+\n| Năm        | 2010  | 2015  | 2021  |\n+------------+-------+-------+-------+\n| Khai thác  | 240,9 | 353,7 | 183,9 |\n+------------+-------+-------+-------+\n| Nuôi trồng | 97,1  | 142,8 | 512.2 |\n+------------+-------+-------+-------+\n\nSản lượng thủy sản của Bắc Trung Bộ, giai đoạn 2010 - 2021 (Đơn vị: nghìn tấn)\n(Nguồn niên giám thống kê Việt Nam năm 2011, 2016, 2022)',
            statements: [
                {
                    text: 'a) Sản lượng thủy sản nuôi trồng tăng trong giai đoạn 2010-2021.',
                    correctAnswer: true
                },
                {
                    text: 'b) Sản lượng thủy sản khai thác tăng ít hơn sản lượng nuôi trồng.',
                    correctAnswer: false
                },
                {
                    text: 'c) Sản lượng thủy sản tăng phù hợp với chuyển dịch cơ cấu trong nông nghiệp.',
                    correctAnswer: true
                },
                {
                    text: 'd) Biểu đồ cột là dạng biểu đồ thích hợp nhất để thể hiện sản lượng thủy sản của Bắc Trung Bộ qua các năm 2010, 2015, 2021.',
                    correctAnswer: true
                }
            ]
        },
        {
            type: 'short-answer',
            text: 'PHẦN III. Câu 1. Năm 2010 và 2022, diện tích trồng lạc của vùng Trung du và miền núi Bắc Bộ lần lượt là 37,6 nghìn ha và 43,6 nghìn ha. Tốc độ tăng trưởng diện tích trồng lạc của vùng Trung du và miền núi Bắc Bộ năm 2022 so với năm 2010 (coi năm 2010 = 100%) là bao nhiêu %? (làm tròn kết quả đến hàng đơn vị).',
            correctAnswer: '116'
        },
        {
            type: 'short-answer',
            text: 'PHẦN III. Câu 2. Cho bảng số liệu:<br>Số trang trại của Đồng bằng sông Hồng phân theo lĩnh vực hoạt động, năm 2023<br><br>+-----------------------+------------+-----------+---------------------+<br>| Lĩnh vực hoạt động    | Trồng trọt | Chăn nuôi | Nuôi trồng thủy sản |<br>+-----------------------+------------+-----------+---------------------+<br>| Số lượng (trang trại) | 207        | 5693      | 670                 |<br>+-----------------------+------------+-----------+---------------------+<br><br>(Nguồn: Niên giám Thống kê Việt Nam năm 2023, Nxb Thống kê 2024)<br>Căn cứ vào bảng số liệu trên, hãy cho biết tỉ trọng số trang trại chăn nuôi trong tổng số trang trại của Đồng bằng sông Hồng năm 2023 là bao nhiêu %? (làm tròn kết quả đến một chữ số thập phân).',
            correctAnswer: '86,7'
        },
        {
            type: 'short-answer',
            text: 'PHẦN III. Câu 3. Cho bảng số liệu:<br>Tổng diện tích rừng và diện tích rừng trồng ở Bắc Trung Bộ, giai đoạn 2015 - 2021<br>(Đơn vị: nghìn ha)<br><br>+--------------------------------+---------+---------+---------+<br>| Năm                            | 2015    | 2020    | 2021    |<br>+--------------------------------+---------+---------+---------+<br>| Tổng diện tích rừng            | 3 045,0 | 3 126,7 | 3 131,1 |<br>+--------------------------------+---------+---------+---------+<br>| Trong đó: Diện tích rừng trồng | 808,9   | 921,2   | 929,6   |<br>+--------------------------------+---------+---------+---------+<br><br>(Nguồn: Tổng cục thống kê năm 2022)<br>Căn cứ vào bảng số liệu trên, hãy cho biết tỉ trọng diện tích rừng trồng trong tổng diện tích rừng của Bắc Trung Bộ năm 2021 tăng lên bao nhiêu % so với năm 2015? (làm tròn kết quả đến một chữ số thập phân).',
            correctAnswer: '3,1'
        },
        {
            type: 'short-answer',
            text: 'PHẦN III. Câu 4. Cho bảng số liệu:<br><br>+-----------------------------+-------+-------+--------+--------+<br>| Năm                         | 2010  | 2015  | 2020   | 2023   |<br>+-----------------------------+-------+-------+--------+--------+<br>| Sản lượng hải sản khai thác | 707,1 | 913,6 | 1144,8 | 1219,5 |<br>+-----------------------------+-------+-------+--------+--------+<br><br>(Nguồn Tổng cục Thống kê năm 2023)<br>Căn cứ vào bảng số liệu trên, hãy cho biết sản lượng hải sản khai thác của Duyên hải Nam Trung Bộ năm 2023 tăng thêm bao nhiêu % so với năm 2010? (làm tròn kết quả đến một chữ số thập phân).',
            correctAnswer: '79,5'
        }
    ];
    
    // Initialize the quiz
    function initQuiz() {
        // Set up user answers array with empty values
        userAnswers = Array(quizQuestions.length).fill(null);
        
        // Update the question counter
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
        
        // Disable prev button on first question
        prevBtn.disabled = true;
        
        // Render first question
        renderQuestion();
        
        // Set up event listeners
        prevBtn.addEventListener('click', showPreviousQuestion);
        nextBtn.addEventListener('click', showNextQuestion);
        checkAnswersBtn.addEventListener('click', checkAnswers);
        resetBtn.addEventListener('click', resetQuiz);
    }
    
    // Render current question
    function renderQuestion() {
        const question = quizQuestions[currentQuestionIndex];
        let questionHTML = '';
        
        questionHTML += `
            <div class="question" id="question-${currentQuestionIndex}">
                <div class="question-number">Question ${currentQuestionIndex + 1}</div>
        `;
        
        // Only add question text for non-multiple-true-false types
        if (question.type !== 'multiple-true-false') {
            questionHTML += `<div class="question-text">${formatQuestionText(question.text)}</div>`;
        } else {
            questionHTML += `<div class="question-text">${question.text}</div>`;
        }
        
        // Render different question types
        switch (question.type) {
            case 'multiple-choice':
                questionHTML += renderMultipleChoice(question, currentQuestionIndex);
                break;
            case 'true-false':
                questionHTML += renderTrueFalse(question, currentQuestionIndex);
                break;
            case 'multiple-true-false':
                questionHTML += renderMultipleTrueFalse(question, currentQuestionIndex);
                break;
            case 'short-answer':
                questionHTML += renderShortAnswer(question, currentQuestionIndex);
                break;
        }
        
        questionHTML += `</div>`;
        
        quizContainer.innerHTML = questionHTML;
        
        // Add event listeners for question types except multiple-true-false
        // (which now uses inline onclick handlers)
        if (question.type !== 'multiple-true-false') {
            setupQuestionListeners(question.type, currentQuestionIndex);
        }
        
        // Update button states
        updateNavigationButtons();
    }
    
    // Render multiple-choice question
    function renderMultipleChoice(question, index) {
        let optionsHTML = `<ul class="options">`;
        
        question.options.forEach((option, optionIndex) => {
            const isSelected = userAnswers[index] === optionIndex;
            optionsHTML += `
                <li class="option ${isSelected ? 'selected' : ''}" data-index="${optionIndex}">
                    ${option}
                </li>
            `;
        });
        
        optionsHTML += `</ul>`;
        return optionsHTML;
    }
    
    // Render true-false question
    function renderTrueFalse(question, index) {
        const trueSelected = userAnswers[index] === true;
        const falseSelected = userAnswers[index] === false;
        
        return `
            <div class="true-false">
                <button class="true-btn ${trueSelected ? 'selected' : ''}" data-value="true">True</button>
                <button class="false-btn ${falseSelected ? 'selected' : ''}" data-value="false">False</button>
            </div>
        `;
    }
    
    // Render short-answer question
    function renderShortAnswer(question, index) {
        const userAnswer = userAnswers[index] || '';
        
        return `
            <div class="short-answer">
                <input type="text" class="answer-input" value="${userAnswer}" placeholder="Type your answer here...">
                <div class="correct-answer">Correct answer: ${question.correctAnswer}</div>
            </div>
        `;
    }
    
    // Update the setupQuestionListeners function
    function setupQuestionListeners(questionType, questionIndex) {
        switch (questionType) {
            case 'multiple-choice':
                document.querySelectorAll('.option').forEach(option => {
                    option.addEventListener('click', function() {
                        const optionIndex = parseInt(this.getAttribute('data-index'));
                        userAnswers[questionIndex] = optionIndex;
                        renderQuestion();
                    });
                });
                break;
                
            case 'true-false':
                document.querySelectorAll('.true-btn, .false-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const value = this.dataset.value === 'true';
                        userAnswers[questionIndex] = value;
                        renderQuestion();
                    });
                });
                break;
                
            case 'multiple-true-false':
                // Use correct selector and add console logs for debugging
                document.querySelectorAll('.statement-container .true-btn, .statement-container .false-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const statementIndex = parseInt(this.getAttribute('data-statement'));
                        const value = this.getAttribute('data-value') === 'true';
                        
                        console.log(`Button clicked: statement ${statementIndex}, value: ${value}`);
                        
                        // Initialize the answer array if needed
                        if (!Array.isArray(userAnswers[questionIndex])) {
                            userAnswers[questionIndex] = [];
                        }
                        
                        // Set the answer for this statement
                        userAnswers[questionIndex][statementIndex] = value;
                        
                        console.log('Updated answers:', userAnswers);
                        renderQuestion();
                    });
                });
                break;
                
            case 'short-answer':
                document.querySelector('.answer-input').addEventListener('input', function() {
                    userAnswers[questionIndex] = this.value;
                });
                break;
        }
    }
    
    // Show previous question
    function showPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    }
    
    // Show next question
    function showNextQuestion() {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        }
    }
    
    // Update navigation buttons
    function updateNavigationButtons() {
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === quizQuestions.length - 1;
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    }
    
    // Check answers and show results
    window.checkAnswers = function() {
        const question = quizQuestions[currentQuestionIndex];
        const userAnswer = userAnswers[currentQuestionIndex];
        
        console.log('Checking answers for:', question.type);
        console.log('User answer:', userAnswer);
        
        switch (question.type) {
            case 'multiple-choice':
                const options = document.querySelectorAll('.option');
                
                // Clear previous results AND selection styling
                options.forEach(option => {
                    option.classList.remove('selected', 'correct', 'incorrect');
                });
                
                // Mark correct answer
                options[question.correctAnswer].classList.add('correct');
                
                // If user selected a wrong answer, mark it as incorrect
                if (userAnswer !== null && userAnswer !== question.correctAnswer) {
                    options[userAnswer].classList.add('incorrect');
                }
                break;
                
            case 'true-false':
                const trueBtn = document.querySelector('.true-btn');
                const falseBtn = document.querySelector('.false-btn');
                
                // Clear previous results AND selection styling
                trueBtn.classList.remove('selected', 'correct', 'incorrect');
                falseBtn.classList.remove('selected', 'correct', 'incorrect');
                
                // Mark correct answer
                if (question.correctAnswer) {
                    trueBtn.classList.add('correct');
                    if (userAnswer === false) {
                        falseBtn.classList.add('incorrect');
                    }
                } else {
                    falseBtn.classList.add('correct');
                    if (userAnswer === true) {
                        trueBtn.classList.add('incorrect');
                    }
                }
                break;
                
            case 'multiple-true-false':
                // Skip if no answers
                if (!Array.isArray(userAnswer)) {
                    console.log('No user answer array found');
                    return;
                }
                
                // Get all statement containers
                const statementContainers = document.querySelectorAll('.statement-container');
                console.log(`Found ${statementContainers.length} statement containers`);
                
                // Loop through each statement and check
                question.statements.forEach((statement, index) => {
                    // Skip if we don't have this answer
                    if (index >= statementContainers.length) {
                        console.log(`Statement index ${index} is out of bounds`);
                        return;
                    }
                    
                    const container = statementContainers[index];
                    const trueBtn = container.querySelector('.true-btn');
                    const falseBtn = container.querySelector('.false-btn');
                    
                    console.log(`Checking statement ${index}, correct: ${statement.correctAnswer}, user: ${userAnswer[index]}`);
                    
                    // Remove existing classes including selection styling
                    trueBtn.classList.remove('selected', 'correct', 'incorrect');
                    falseBtn.classList.remove('selected', 'correct', 'incorrect');
                    
                    // Mark correct answer
                    if (statement.correctAnswer) {
                        trueBtn.classList.add('correct');
                        if (userAnswer[index] === false) {
                            falseBtn.classList.add('incorrect');
                        }
                    } else {
                        falseBtn.classList.add('correct');
                        if (userAnswer[index] === true) {
                            trueBtn.classList.add('incorrect');
                        }
                    }
                });
                break;
                
            case 'short-answer':
                const correctAnswerDisplay = document.querySelector('.correct-answer');
                correctAnswerDisplay.style.display = 'block';
                
                const input = document.querySelector('.answer-input');
                if (userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
                    input.style.borderColor = '#28a745';
                    input.style.backgroundColor = '#d4edda';
                } else {
                    input.style.borderColor = '#dc3545';
                    input.style.backgroundColor = '#f8d7da';
                }
                break;
        }
    };
    
    // Reset the quiz
    function resetQuiz() {
        currentQuestionIndex = 0;
        userAnswers = Array(quizQuestions.length).fill(null);
        renderQuestion();
    }
    
    // Improved table parsing function
    function formatQuestionText(text) {
        // Check if this contains a table
        if (text.includes('+---') || text.includes('|')) {
            // Convert ASCII table to HTML table
            let lines = text.split('\n');
            let tableStarted = false;
            let tableHtml = '<table class="quiz-table">';
            let formattedText = '';
            let isFirstRow = true;
            
            for (let line of lines) {
                line = line.trim();
                
                if (line.startsWith('+---') || line.startsWith('|')) {
                    // Table line
                    if (!tableStarted) {
                        tableStarted = true;
                    }
                    
                    // Skip separator lines
                    if (line.startsWith('+---')) {
                        continue;
                    }
                    
                    // Process table row
                    tableHtml += '<tr>';
                    
                    // Split the line into cells
                    const cells = line.split('|').filter(cell => cell.trim() !== '');
                    
                    for (let cell of cells) {
                        // Determine if this is a header cell (first row)
                        const cellTag = isFirstRow ? 'th' : 'td';
                        tableHtml += `<${cellTag}>${cell.trim()}</${cellTag}>`;
                    }
                    
                    tableHtml += '</tr>';
                    isFirstRow = false;
                } else if (tableStarted) {
                    // End of table
                    tableStarted = false;
                    tableHtml += '</table>';
                    formattedText += tableHtml;
                    tableHtml = '<table class="quiz-table">';
                    isFirstRow = true;
                    
                    if (line) {
                        formattedText += line + '<br>';
                    }
                } else {
                    // Regular text
                    if (line) {
                        formattedText += line + '<br>';
                    }
                }
            }
            
            // If we have an unclosed table
            if (tableStarted) {
                tableHtml += '</table>';
                formattedText += tableHtml;
            }
            
            return formattedText;
        }
        
        return text;
    }
    
    // Completely revised renderMultipleTrueFalse function
    function renderMultipleTrueFalse(question, questionIndex) {
        let statementsHTML = `<div class="multiple-true-false">`;
        
        // Add the context first (if any)
        if (question.context) {
            statementsHTML += `<div class="context">${formatQuestionText(question.context)}</div>`;
        }
        
        // Add each statement with its own true/false buttons
        question.statements.forEach((statement, statementIndex) => {
            // Get the user's answer for this specific statement
            let userAnswer = null;
            if (Array.isArray(userAnswers[questionIndex])) {
                userAnswer = userAnswers[questionIndex][statementIndex];
            }
            
            statementsHTML += `
                <div class="statement-container">
                    <div class="statement-text">${statement.text}</div>
                    <div class="true-false-buttons">
                        <button type="button" 
                            class="tf-btn true-btn ${userAnswer === true ? 'selected' : ''}" 
                            onclick="handleTrueFalseClick(${questionIndex}, ${statementIndex}, true)">
                            True
                        </button>
                        <button type="button" 
                            class="tf-btn false-btn ${userAnswer === false ? 'selected' : ''}" 
                            onclick="handleTrueFalseClick(${questionIndex}, ${statementIndex}, false)">
                            False
                        </button>
                    </div>
                </div>
            `;
        });
        
        statementsHTML += `</div>`;
        return statementsHTML;
    }
    
    // Global function to handle true/false clicks
    window.handleTrueFalseClick = function(questionIndex, statementIndex, isTrue) {
        console.log(`Button clicked: question ${questionIndex}, statement ${statementIndex}, value: ${isTrue}`);
        
        // Initialize the answer array if needed
        if (!Array.isArray(userAnswers[questionIndex])) {
            userAnswers[questionIndex] = [];
        }
        
        // Set the answer for this statement
        userAnswers[questionIndex][statementIndex] = isTrue;
        
        console.log('Updated answers:', userAnswers);
        renderQuestion();
    };
    
    // Initialize the quiz when the page loads
    initQuiz();

    // Make sure the checkAnswersBtn is properly connected
    checkAnswersBtn.addEventListener('click', function() {
        window.checkAnswers();
    });
}); 