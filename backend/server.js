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

mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));


// async function fetchExistingStock(symbol, date){
//     try{
//         const stock = await StockPrice.exists({symbol: symbol,date: date});
//         console.log("Stock:", stock);
//         return stock;
//     }catch(error){
//         console.log("Error fetching stock:", error);
//         throw error;
//     }
// }
// async function saveNewStock(stock){
//     const newStock = new StockPrice({
//         symbol: stock['01. symbol'],
//         price : stock['05. price'],
//         vollumn : stock['06.volume'],
//         change : stock['09. change'],
//         percentChange: stock['10. change percent'],
//     })
//     try{
//         const savedStock = await newStock.save();
//         console.log("Stock dave succesfully", savedStock);
//     }catch( error){
//         console.log("Error saving new stock", error);
//     }
// }

// app.post('/api/saveStock', async(req, res) =>{
//     try{
//         const stock = req.body;
//         const exist = await fetchExistingStock(stock['01. symbol'], stock['07. latest trading day']);
//         if(!exist){
//             await saveNewStock(stock);
//         }
//         res.status(200).json({ success: true });
//     }catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//       }
// });



//Get Stock Price to mongoDB
const apiKey = 'CKMO3Q3NLK0OOSZG';

async function getStockPrice(stockSymbol){
    const urlStock = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${stockSymbol}&apikey=${apiKey}`;
    try{
        const res = axios.get(urlStock, {
            headers: {'User-Agent': 'request'}
        })
        return res.data;
    }catch(error){
        console.log('Error', error);
    }
}

async function saveNewStock(metaData, data, recordDate){
    const newStock = new StockPrice({
        symbol: metaData['2. Symbol'],
        open: data['1. open'],
        high: data['2. high'],
        close: data['4. close'],
        volume: data['5. volume'],
        date: recordDate,
    })
    try{
        const savedCrypto = newStock.save();
        console.log("Stock saved Successfully",metaData['2. Symbol']);
    } catch(error){
        console.log("Error saving new stock", error);
    }
}
// Get Crypto Price to MongoDB 
async function getCryptoPrice() {
    const listOfCryptos = ["ETH", "BNB", "SOL"];
    try {
        const requests = listOfCryptos.map(symbol => fetchCryptoPrice(symbol));
        const responses = await Promise.all(requests);
        console.log('Crypto responses:', responses);
        const latestDateInDB = await getLatestDate(CryptoCurrency);
        responses.forEach(response => {
            if (!response) return;
            const metaData = response['Meta Data'];
            const listOfPrice = response['Time Series (Digital Currency Monthly)'];
            if (!metaData || !listOfPrice) {
                console.log('Missing metadata or time series data:', response);
                return;
            }
            for (const [date, data] of Object.entries(listOfPrice)) {
                const recordDate = moment(date, "YYYY-MM-DD").endOf('month').toDate();
                
                // if (!latestDateInDB || recordDate > latestDateInDB) {
                    console.log(`Saving data for ${metaData["2. Digital Currency Code"]} for date ${recordDate}`);
                    saveNewCrypto(metaData, data, recordDate);
                // }
            }
        });
    } catch (error) {
        console.log('Error in getCryptoPrice:', error);
        mongoose.connection.close().then(() => {
            console.log('MongoDB connection closed due to error');
        });
    }
}
async function fetchCryptoPrice(cryptoSymbol) {
    const urlCrypto = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_MONTHLY&symbol=${cryptoSymbol}&market=EUR&apikey=${apiKey}`;
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

getCryptoPrice();




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


// async function saveNewStock1(){
//     const newStock = new StockPrice({
//         symbol: 'BBN',
//         price : 1022,
//         vollumn : 1123,
//         change : 123,
//         percentChange: 123,
//     })
//     try{
//         const savedStock = await newStock.save();
//         console.log("Stock dave succesfully", savedStock);
//     }catch( error){
//         console.log("Error saving new stock", error);
//     }
// }
// saveNewStock1();