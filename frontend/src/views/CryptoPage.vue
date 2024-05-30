<template>
  <div class="data-table">
    <h1>Crypto Quotes</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="loading" class="loading">Loading...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
            <th>Rank</th>
            <th>Tier</th>
            <th>Price</th>
            <th>Symbol</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="crypto in cryptoList" :key="crypto.uuid" class="table-row">
            <td>{{ crypto.name }}</td>
            <td><img :src="crypto.iconUrl" :alt="crypto.name"></td>
            <td>{{ crypto.rank }}</td>
            <td>{{ crypto.tier }}</td>
            <td>{{ crypto.price }}</td>
            <td>{{ crypto.symbol }}</td>
            <td>{{ crypto.change }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

import { defineComponent } from 'vue';
import axios from 'axios';
const apiKey = 'coinranking687d4cc37a39468baeffcc6c0546f518c3c54b2b87e4f73a';
export default {
  name: 'Crypto',
  data() {
    return {
      loading: true,
      error: false,
      cryptoList: [],
    };
  },
  methods: {
    async getCryptoPrice() {
      const url = "https://api.coinranking.com/v2/coins";
      try {
        const res = await axios.get(url, {
          headers: {
            'x-access-token': apiKey,
          }
        })
        console.log(res);
        this.cryptoList = res.data.data.coins;
        console.log(this.cryptoList);
        this.loading = false;
      } catch (error) {
        this.error = 'Failed to fetch stock quotes';
        console.error('Error:', error);
        this.loading = false;
      }
    },
    formatPrice(price) {
      if (price >= 1e9) {
        return (price / 1e9).toFixed(2) + 'B'; // Format and round to 2 decimal places
      }
      return price.toFixed(2); // Format and round to 2 decimal places if not in billions
    },
  },
    mounted() {
    this.getCryptoPrice();
  },
  
}


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
img {
  max-width: 30px;
  height: auto;
}
</style>