// This utility requires the 'mammoth' library to process .docx files
// npm install mammoth --save

const mammoth = require('mammoth');
const fs = require('fs');

// Function to convert .docx to quiz JSON
async function convertDocxToQuiz(filePath, outputPath = null) {
    try {
        console.log(`Processing ${filePath}...`);
        
        // Read the .docx file and convert to HTML
        const result = await mammoth.convertToHtml({ path: filePath });
        const html = result.value;
        
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Initialize array for questions
        const questions = [];
        
        // Find all paragraphs that might contain questions
        const paragraphs = Array.from(doc.querySelectorAll('p'));
        
        let currentIndex = 0;
        
        while (currentIndex < paragraphs.length) {
            // Check if paragraph contains a question (usually starts with a number)
            const questionPara = paragraphs[currentIndex];
            const questionText = questionPara.textContent.trim();
            
            // Simple check for a question - modify this based on your document structure
            if (/^\d+\./.test(questionText) || questionText.includes('?')) {
                // Extract the question text (removing any numbers or prefixes)
                const cleanQuestionText = questionText.replace(/^\d+\.\s*/, '');
                
                // Check next paragraphs to determine question type and options
                let nextIndex = currentIndex + 1;
                
                // Check if next paragraph contains options like A, B, C, D
                if (nextIndex < paragraphs.length) {
                    const nextPara = paragraphs[nextIndex];
                    const nextText = nextPara.textContent.trim();
                    
                    // Multiple Choice Question
                    if (nextText.match(/^[A-D]\./) || nextPara.innerHTML.includes('<li>')) {
                        const options = [];
                        let correctAnswerIndex = -1;
                        
                        // Gather all options
                        while (nextIndex < paragraphs.length) {
                            const optionPara = paragraphs[nextIndex];
                            const optionText = optionPara.textContent.trim();
                            
                            // Break if we've reached the next question
                            if (/^\d+\./.test(optionText) && !optionText.startsWith('A.')) {
                                break;
                            }
                            
                            // Extract option text (remove A., B., etc.)
                            const cleanOptionText = optionText.replace(/^[A-D]\.\s*/, '');
                            
                            // Check if this option is bold (correct answer)
                            if (optionPara.innerHTML.includes('<strong>') || 
                                optionPara.innerHTML.includes('<b>')) {
                                correctAnswerIndex = options.length;
                            }
                            
                            options.push(cleanOptionText);
                            nextIndex++;
                        }
                        
                        // Create multiple-choice question object
                        questions.push({
                            type: 'multiple-choice',
                            text: cleanQuestionText,
                            options: options,
                            correctAnswer: correctAnswerIndex
                        });
                        
                        currentIndex = nextIndex - 1;
                    }
                    // True/False Question
                    else if (nextText.includes('True') || nextText.includes('False')) {
                        // Check which one is bold
                        const isTrueCorrect = nextPara.innerHTML.includes('<strong>True</strong>') || 
                                            nextPara.innerHTML.includes('<b>True</b>');
                        
                        questions.push({
                            type: 'true-false',
                            text: cleanQuestionText,
                            correctAnswer: isTrueCorrect
                        });
                        
                        currentIndex = nextIndex;
                    }
                    // Short Answer Question
                    else {
                        // Find the correct answer (usually in bold after the question)
                        let correctAnswer = '';
                        
                        // Check if there's a bold text in the next paragraph
                        const boldMatch = nextPara.innerHTML.match(/<(strong|b)>(.*?)<\/(strong|b)>/);
                        if (boldMatch) {
                            correctAnswer = boldMatch[2];
                        }
                        
                        questions.push({
                            type: 'short-answer',
                            text: cleanQuestionText,
                            correctAnswer: correctAnswer
                        });
                        
                        currentIndex = nextIndex;
                    }
                } else {
                    // No more paragraphs, assume this is a short answer question
                    questions.push({
                        type: 'short-answer',
                        text: cleanQuestionText,
                        correctAnswer: ''
                    });
                }
            }
            
            currentIndex++;
        }
        
        // Convert questions to JavaScript code
        const jsCode = `const quizQuestions = ${JSON.stringify(questions, null, 4)};`;
        
        // Save to file if outputPath is provided
        if (outputPath) {
            fs.writeFileSync(outputPath, jsCode);
            console.log(`Converted quiz saved to ${outputPath}`);
        }
        
        return questions;
    } catch (error) {
        console.error('Error converting DOCX file:', error);
        throw error;
    }
}

// Function to run in browser environment
function convertDocxFileInBrowser(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const arrayBuffer = event.target.result;
            
            mammoth.convertToHtml({ arrayBuffer })
                .then(result => {
                    const html = result.value;
                    
                    // Create parser and parse the HTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Use the same parsing logic as above
                    // [Implementation similar to the Node.js version]
                    // ...
                    
                    resolve(questions);
                })
                .catch(reject);
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { convertDocxToQuiz };
} 