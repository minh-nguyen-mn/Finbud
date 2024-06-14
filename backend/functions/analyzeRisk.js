
const axios = require('axios');
require('dotenv').config();
const moment = require('moment');   
const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = 'CKMO3Q3NLK0OOSZG';//ALPHAVANTAGE
const genAI = new GoogleGenerativeAI('process.env.API_KEY');
// const genAI = new GoogleGenerativeAI('AIzaSyBoqZUePAhe5n5INyoApGlytjx57t8-UYI');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
exports.handler = async (req) =>{
    try{
        const response = await start(req.body);
        return {
            statusCode: 200,
            body:  response
        };
    }catch(error){
        console.error("Error in analyzeRisk:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'From analyzeRisk.js :Internal Server Error' })
        };
    }
}
// run("hi");
// async function run(prompt) {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = await response.text();
//     // console.log(text);
//     return text;
// }
// start(prompt);
async function start(prompt){
    const chat = await model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "I'm a 10 years old boy, from now on, answer me everything simply!" }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
        },
      });
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
    //   console.log(text);
      return text;
}
