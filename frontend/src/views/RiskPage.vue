<template>
  <div class="data-table">
    <h1>Stock Quotes</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="loading" class="loading">Loading...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Price</th>
            <th>Volume</th>
            <th>Latest Trading Day</th>
            <th>Previous Close</th>
            <th>Change</th>
            <th>Change Percent</th>
          </tr>
        </thead>
        <h1 v-for="stock in stockQuotes">{{  stock }}</h1>
        <tbody v-if="stockQuotes.length" class="table-body">
          <tr v-for="stock in stockQuotes" :key="stock['01. symbol']" class="table-row">
            <td>{{ stock['01. symbol'] }}</td>
            <td>{{ stock['02. open'] }}</td>
            <td>{{ stock['03. high'] }}</td>
            <td>{{ stock['04. low'] }}</td>
            <td>{{ stock['05. price'] }}</td>
            <td>{{ stock['06. volume'] }}</td>
            <td>{{ stock['07. latest trading day'] }}</td>
            <td>{{ stock['08. previous close'] }}</td>
            <td>{{ stock['09. change'] }}</td>
            <td>{{ stock['10. change percent'] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

// const apiKey = 'LABZ3HFNGRW3418HLABZ3HFNGRW3418H';
const apiKey = 'MA4HE7Q4W5NYA2HA';

export default {
  name: 'StockQuote',
  data() {
    return {
      loading: true,
      error: null,
      stockQuotes: [],
    };
  },
  mounted() {
    this.fetchStockQuote();
  },
  methods: {
    async fetchStockQuote() {
      const symbols = ['IBM', 'AAPL', 'GOOGL'];
      try {
        const requests = symbols.map(symbol => {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
          return axios.get(url);
        });

        const responses = await Promise.all(requests);
        console.log(responses);
        this.stockQuotes = responses.map(response => {
          const quote = response.data['Global Quote'];
          if (quote && Object.keys(quote).length > 0) {
        // console.log('API response for', quote['01. symbol'], ':', quote);
        return quote;
      } else {
        return null; // If quote is undefined or empty, return null
      }
    }).filter(quote => quote !== null);
        console.log('Final stockQuotes:', this.stockQuotes);
        this.loading = false;
      } catch (error) {
        this.error = 'Failed to fetch stock quotes';
        console.error('Error:', error);
        this.loading = false;
      }
    },
  }
};
</script>
<style scoped>
.data-table {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

thead {
  background-color: #f8f8f8;
}

th,
td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

.error {
  color: red;
}

.loading {
  color: gray;
}

.positive {
  color: green;
}

.negative {
  color: red;
}

.table-row {
  transition: background-color 0.3s ease;
}
</style>