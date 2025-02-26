const express = require('express');
const router = express.Router();
const { generateToken } = require('../util');
const { OpenAI } = require('openai');

(async () => {
  await generateToken();
})();

// Endpoint to generate a question
router.get('/ask-question', async (req, res) => {
  const topic = req.query.topic;

  // Challenge 1.a - Write the prompt
  const prompt = `Compose a challenging ${topic} interview question without answer. \n Question:`;

  const header_name = process.env.GATEWAY_HEADER_NAME
  const header_value = process.env.GATEWAY_HEADER_VALUE
  const headers = {
    header_name: header_value,
  };
  const client = new OpenAI(headers);

  // Challenge 1.b - Call OpenAI API to generate questions
  const response = await client.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an expert in technical interviews, generating relevant questions with concise (1-2 sentence) answers.",
          }
        ],
      },
      { role: "user", content: [{ type: "text", text: prompt }] },
    ],
  });

  // Extract the generated text
  const questions_text = response.choices[0].message.content;

  // Return the questions as a JSON response
  res.json({ question: questions_text });
});

// Endpoint to submit descriptive questions
router.post('/question-feedback', async (req, res) => {
  // Request parameter includes both question and answer provided by user.
  const { question, CandidateAnswer: answer } = req.body.question;

  // Challenge 2.a - Write Prompt to evaluate the question and answer
  // Use question and answer variable to generate the prompt
  const prompt = `Evaluate the following question and answer and rate the candidate's response on a scale of 1-10:                           
                   question: ${question}
                   answer: ${answer}`;

  // OpenAI Call to generate feedback
  const header_name = process.env.GATEWAY_HEADER_NAME
  const header_value = process.env.GATEWAY_HEADER_VALUE
  const headers = {
    header_name: header_value,
  };
  const client = new OpenAI(headers);

  // Challenge 2.b - Call the OpenAI API and get the response
  const response = await client.chat.completions.create({
    model: "gpt-4o-2024-05-13",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: "You are an expert in technical interviews",
          }
        ],
      },
      { role: "user", content: [{ type: "text", text: prompt }] },
    ],
  });

  // Extract the generated text
  const feedback_text = response.choices[0].message.content;

  // Return the feedback as a JSON response
  res.json({ feedback: feedback_text });
});

module.exports = router;
