const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const moment = require('moment');
const cors = require('cors'); // Import the cors package
dotenv.config();
const StockPrice = require('../backend/models/Stock');
const CryptoCurrency = require('../backend/models/Crypto');
const app = express();
const axios = require('axios');
const { response } = require('express');
const port = process.env.PORT || 3000;
// Use the cors middleware
app.use(cors());
app.use(bodyParser.json());

//MongoDB connect

const apiKey = 'CKMO3Q3NLK0OOSZG';
const firstofJune = moment("2024-06-01", "YYYY-MM-DD").toDate();
// Update MongoDB 
// getCryptoPrice();
// getStockPrice();
mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));
// Get Crypto Price to MongoDB 
async function getStockPrice() {
    const listOfStocks = ['IBM', 'AAPL'];
    try {
        const requests = listOfStocks.map(symbol => fetchStockPrice(symbol));
        const responses = await Promise.all(requests);
        console.log('Stock responses:', responses);
        const latestDateInDB = await getLatestDate(StockPrice);
        responses.forEach(response => {
            if (!response) return;
            const metaData = response['Meta Data'];
            const listOfPrice = response['Time Series (Daily)'];
            if (!metaData || !listOfPrice) {
                console.log('Missing metadata or time series data:', response);
                return;
            }
            // console.log("latestDateInDB: ", latestDateInDB);
            // console.log("firstofJune: ", firstofJune);
            for (const [date, data] of Object.entries(listOfPrice)) {
                const recordDate = moment(date, "YYYY-MM-DD").toDate();
                // console.log("recordDate:",recordDate);
                if ((!latestDateInDB || new Date(recordDate) > new Date(latestDateInDB)) && (new Date(recordDate) > new Date(firstofJune))) {
                    console.log(`Saving Stock data for ${metaData["2. Symbol"]} for date ${recordDate}`);
                    saveNewStock(metaData, data, recordDate);
                }
            }
        });
    } catch (error) {
        console.log('Error in getStockPrice:', error);
    }
}
async function fetchStockPrice(stockSymbol) {
    const urlStock = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`;
    try {
        const res = await axios.get(urlStock, {
            headers: { 'User-Agent': 'request' }
        })
        return res.data;
    } catch (error) {
        console.log('Error', error);
    }
}
async function saveNewStock(metaData, data, recordDate) {
    const newStock = new StockPrice({
        symbol: metaData['2. Symbol'],
        open: data['1. open'],
        high: data['2. high'],
        close: data['4. close'],
        volume: data['5. volume'],
        date: recordDate,
    })
    try {
        const savedCrypto = newStock.save();
        console.log("Stock saved Successfully", metaData['2. Symbol']);
    } catch (error) {
        console.log("Error saving new stock", error);
    }
}




// Get Crypto Price to MongoDB 
async function getCryptoPrice() {
    const listOfCryptos = ["BTC","ETH","SOL"];
    try {
        const requests = listOfCryptos.map(symbol => fetchCryptoPrice(symbol));
        const responses = await Promise.all(requests);
        console.log('Crypto responses:', responses);
        const latestDateInDB = await getLatestDate(CryptoCurrency);
        responses.forEach(response => {
            if (!response) return;
            const metaData = response['Meta Data'];
            const listOfPrice = response['Time Series (Digital Currency Daily)'];
            if (!metaData || !listOfPrice) {
                console.log('Missing metadata or time series data:', response);
                return;
            }
            // console.log("latestDateInDB: ", latestDateInDB);
            // console.log("firstofJune: ", firstofJune);
            for (const [date, data] of Object.entries(listOfPrice)) {
                const recordDate = moment(date, "YYYY-MM-DD").toDate();
                // console.log("recordDate:", recordDate);
                if ((!latestDateInDB || new Date(recordDate) > new Date(latestDateInDB)) && (new Date(recordDate) > new Date(firstofJune))) {
                    console.log(`Saving data for ${metaData["2. Digital Currency Code"]} for date ${recordDate}`);
                    saveNewCrypto(metaData, data, recordDate);
                }
            }
        });
    } catch (error) {
        console.log('Error in getCryptoPrice:', error);
    }
}
async function fetchCryptoPrice(cryptoSymbol) {
    const urlCrypto = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${cryptoSymbol}&market=EUR&apikey=${apiKey}`;
    try {
        const res = await axios.get(urlCrypto, {
            headers: { 'User-Agent': 'request' }
        })
        return res.data
    } catch (error) {
        console.error('Error:', error);
    }
};
async function getLatestDate(dataBaseName) {
    const latestEntry = await dataBaseName.findOne().sort({ date: -1 }).exec();
    if (latestEntry) {
        return latestEntry.date;
    } else {
        return null;
    }
}
async function saveNewCrypto(metaData, data, recordDate) {
    const newCrypto = new CryptoCurrency({
        cryptoName: metaData['3. Digital Currency Name'],
        symbol: metaData["2. Digital Currency Code"],
        open: data['1. open'],
        high: data['2. high'],
        close: data['4. close'],
        volume: data['5. volume'],
        date: recordDate,
    })
    try {
        const savedCrypto = await newCrypto.save();
        console.log("Crypto dave succesfully", metaData["2. Digital Currency Code"]);
    } catch (error) {
        console.log("Error saving new Crypto", error);
    }
}

// Import the functions
const analyzeStock = require('./functions/analyzeStock').handler;
const defineTerm = require('./functions/defineTerm').handler;
const generateQuiz = require('./functions/generateQuiz').handler;
const normAns = require('./functions/normAns').handler;

// Helper to handle async route handlers
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Define routes
app.post('/analyzeStock', asyncHandler(async (req, res) => {
    const response = await analyzeStock({ body: JSON.stringify(req.body) }, null);
    res.status(response.statusCode).json(JSON.parse(response.body));
}));

app.post('/defineTerm', asyncHandler(async (req, res) => {
    const response = await defineTerm({ body: JSON.stringify(req.body) }, null);
    res.status(response.statusCode).json(JSON.parse(response.body));
}));

app.post('/generateQuiz', asyncHandler(async (req, res) => {
    const response = await generateQuiz({ body: JSON.stringify(req.body) }, null);
    res.status(response.statusCode).json(JSON.parse(response.body));
}));

app.post('/normAns', asyncHandler(async (req, res) => {
    const response = await normAns({ body: JSON.stringify(req.body) }, null);
    res.status(response.statusCode).json(JSON.parse(response.body));
}));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


