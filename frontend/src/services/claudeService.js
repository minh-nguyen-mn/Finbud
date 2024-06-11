// const Anthropic = require("@anthropic-ai/sdk");
const axios = require("axios");
const api_Key = "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";
const url = "https://api.anthropic.com/v1/messages";

async function sendMessage() {
    try {
        const response = await axios.post(url, {
            model: "claude-3-opus-20240229",
            max_tokens: 1000,
            temperature: 0.0,
            system: "Respond only in Yoda-speak.",
            messages:[
                { "role": "user", "content": "How are you today?" }
            ]},{headers:
                {
                    'x-api-key': `${api_Key}`,
                    "anthropic-version": "2023-06-01",
                    'content-Type': 'application/json'
                }
            }
        )
        console.log(messages);
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else {
            console.error('Error message:', error.message);
        }

    }
}

sendMessage();