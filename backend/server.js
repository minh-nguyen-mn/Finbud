const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors package
dotenv.config();
const StockPrice = require('../backend/models/Stock');
const CryptoCurrency = require('../backend/models/Crypto');
const app = express();
const port = process.env.PORT || 3000;
// Use the cors middleware
app.use(cors());
app.use(bodyParser.json());

//MongoDB connect

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));


async function fetchExistingStock(symbol, date){
    try{
        const stock = await StockPrice.exists({symbol: symbol,date: date});
        console.log("Stock:", stock);
        return stock;
    }catch(error){
        console.log("Error fetching stock:", error);
        throw error;
    }
}
async function saveNewStock(stock){
    const newStock = new StockPrice({
        symbol: stock['01. symbol'],
        price : stock['05. price'],
        vollumn : stock['06.volume'],
        change : stock['09. change'],
        percentChange: stock['10. change percent'],
    })
    try{
        const savedStock = await newStock.save();
        console.log("Stock dave succesfully", savedStock);
    }catch( error){
        console.log("Error saving new stock", error);
    }
}

app.post('/api/saveStock', async(req, res) =>{
    try{
        const stock = req.body;
        const exist = await fetchExistingStock(stock['01. symbol'], stock['07. latest trading day']);
        if(!exist){
            await saveNewStock(stock);
        }
        res.status(200).json({ success: true });
    }catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
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
