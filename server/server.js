const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logger Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Database Connection
const uri = 'mongodb+srv://test:test@cluster0.zfnol.mongodb.net/';
let db;

MongoClient.connect(uri, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db('lessonManagement');
    })
    .catch(error => console.error(error));

// Routes
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

