const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const setupLessonManagementDatabase = require('./setupDB')

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); 


// Logger middleware
app.use((req, res, next) => {
    const currentTime = new Date().toISOString();
    console.log(`[${currentTime}] ${req.method} ${req.url}`);
    next();
});

// Database Connection
const uri = 'mongodb+srv://test:test@cluster0.zfnol.mongodb.net/';
const client = new MongoClient(uri);
let db;

client.connect().then(async () => {
    db = client.db('lessonManagement'); // Replace with your database name
    console.log('Connected to MongoDB');
  
    // Call the database setup function
    await setupLessonManagementDatabase();
  
    // Start the server after setupDB
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });



  // Routes
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.get('/lessons', async (req, res) => {
    try {
      await client.connect();
      const database = client.db('lessonManagement'); // Use your database name
      const lessonsCollection = database.collection('lessons');
  
      const lessons = await lessonsCollection.find().toArray(); // Retrieve all lessons
      res.status(200).json(lessons); // Return lessons as JSON
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch lessons' });
    } finally {
      await client.close();
    }
});

app.post('/orders', async (req, res) => {
    try {
      await client.connect();
      const database = client.db('lessonManagement');
      const ordersCollection = database.collection('orders');
  
      const order = req.body; // Expecting JSON with order details
      const result = await ordersCollection.insertOne(order);
      res.status(201).json({ message: 'Order created', orderId: result.insertedId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create order' });
    } finally {
      await client.close();
    }
  });
  

app.put('/lessons/:id', async (req, res) => {
    try {
      await client.connect();
      const database = client.db('lessonManagement');
      const lessonsCollection = database.collection('lessons');
  
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
    } finally {
      await client.close();
    }
  });