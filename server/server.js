// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const setupLessonManagementDatabase = require('./setupDB');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');



const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static('public'));
app.use(morgan('short'));

// Logger middleware
app.use((req, res, next) => {
    const currentTime = new Date().toISOString();
    console.log(`[${currentTime}] ${req.method} ${req.url}`);
    next();
});

// Database Connection
const uri = 'mongodb+srv://test:test@cluster0.zfnol.mongodb.net/'; // Replace with your MongoDB connection string
const client = new MongoClient(uri, { useUnifiedTopology: true });
let db;

// Connect to MongoDB
client.connect()
    .then(async () => {
        db = client.db('lessonManagement'); // Replace with your database name
        console.log('Connected to MongoDB');

        // Call the database setup function
        await setupLessonManagementDatabase();

        // Start the server after setupDB
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to MongoDB', error);
    });

// Routes
app.get('/', (req, res) => {
    res.send('Server created and hosting backend for CST3144 Coursework!');
});

app.get('/lessons', async (req, res) => {
    try {
        const lessonsCollection = db.collection('lessons');
        const lessons = await lessonsCollection.find().toArray(); // Retrieve all lessons
        res.status(200).json(lessons); // Return lessons as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const ordersCollection = db.collection('orders');

        const order = req.body; // Expecting JSON with order details
        const result = await ordersCollection.insertOne(order);
        res.status(201).json({ message: 'Order created', orderId: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.put('/lessons/:id', async (req, res) => {
    try {
        const lessonsCollection = db.collection('lessons');

        const lessonId = req.params.id;
        const updateData = req.body; // Expecting JSON with fields to update

        const result = await lessonsCollection.updateOne(
            { _id: new ObjectId(lessonId) },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            res.status(404).json({ error: 'Lesson not found or no changes made' });
        } else {
            res.status(200).json({ message: 'Lesson updated successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update lesson' });
    }
});

// Custom middleware to serve lesson images
app.get('/images/:imageName', (req, res, next) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, 'public', 'images', imageName);

    // Check if the image file exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist, send custom error message
            res.status(404).json({ error: 'Image file not found' });
        } else {
            // File exists, send the image
            res.sendFile(imagePath);
        }
    });
});