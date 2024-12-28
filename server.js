const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();  // To load OpenAI API key from .env file

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Example of storing questions, answers, and explanations
let questions = [
    { 
        question: "What is 2 + 2?", 
        options: ["3", "4", "5"], 
        correct_answer: "4" 
    }
];

// Endpoint to get AI explanation
app.post('/get-explanation', async (req, res) => {
    const { question, selectedAnswer } = req.body;

    try {
        const explanation = await getAIExplanation(question, selectedAnswer);
        res.json({ explanation });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching explanation from AI' });
    }
});

// Function to query GPT-3 for an explanation
async function getAIExplanation(question, selectedAnswer) {
    const apiKey = process.env.OPENAI_API_KEY;  // Load API key from .env

    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',  // Or any other available model
            prompt: `Explain the question: "${question}" and why the answer is ${selectedAnswer}.`,
            max_tokens: 150,
            temperature: 0.5,  // Adjust temperature for creativity vs. factuality
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error from OpenAI:', error);
        throw new Error('Could not generate explanation');
    }
}

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
