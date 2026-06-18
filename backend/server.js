const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

let db;

// Connect to MongoDB
if (mongoUri) {
  MongoClient.connect(mongoUri)
    .then(client => {
      console.log('Connected to MongoDB');
      db = client.db(); // Can pass db name here if needed
    })
    .catch(error => console.error('Failed to connect to MongoDB:', error));
} else {
  console.warn('No MONGO_URI provided in .env');
}

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
