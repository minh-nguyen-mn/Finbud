
const axios = require('axios');
require('dotenv').config();
const moment = require('moment');
const { GoogleGenerativeAI } = require("@google/generative-ai");
// const genAI = new GoogleGenerativeAI('process.env.API_KEY');
const genAI = new GoogleGenerativeAI('AIzaSyBoqZUePAhe5n5INyoApGlytjx57t8-UYI');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
exports.handler = async (req) =>{
    try{
        const response = await run(req.body);
        return {
            statusCode: 200,
            body: response
        };
    }catch(error){
        console.log("Error", error);
    }
}
// run("hi");
async function run(prompt) {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // console.log(text);
    return {
        statusCode: 200,
        body: text,
    };
}