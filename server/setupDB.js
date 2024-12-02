const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://test:test@cluster0.zfnol.mongodb.net/';

const lessonsData = [
    { topic: 'Math', location: 'Hendon', price: 100, space: 5, imageName: 'math.png' },
    { topic: 'English', location: 'Colindale', price: 80, space: 5, imageName: 'english.png' },
    { topic: 'Science', location: 'Brent Cross', price: 90, space: 5, imageName: 'science.png' },
    { topic: 'History', location: 'Golders Green', price: 95, space: 5, imageName: 'history.png' },
    { topic: 'Geography', location: 'Mill Hill', price: 85, space: 5, imageUrl: 'geography.png' },
    { topic: 'Art', location: 'Finchley', price: 75, space: 5, imageName: 'art.png' },
    { topic: 'Music', location: 'Hendon', price: 110, space: 5, imageName: 'music.png' },
    { topic: 'Coding', location: 'Colindale', price: 120, space: 5, imageName: 'coding.png' },
    { topic: 'French', location: 'Brent Cross', price: 100, space: 5, imageName: 'french.png' },
    { topic: 'Spanish', location: 'Golders Green', price: 90, space: 5, imageName: 'spanish.png' },
  ];

const setupLessonManagementDatabase = async () => {
    const client = new MongoClient(uri);
  
    try {
      await client.connect();
      const database = client.db('lessonManagement'); // Use the existing database
  
      // Check if 'lessons' collection exists
      const collections = await database.listCollections().toArray();
      const collectionNames = collections.map((col) => col.name);
  
      // Populate the 'lessons' collection if it doesn't exist or is empty
      const lessonsCollection = database.collection('lessons');
      if (!collectionNames.includes('lessons')) {
        console.log("Creating 'lessons' collection and inserting data...");
        await lessonsCollection.insertMany(lessonsData);
        console.log(`Inserted ${lessonsData.length} lessons into the 'lessons' collection.`);
      } else {
        const lessonCount = await lessonsCollection.countDocuments();
        if (lessonCount === 0) {
          console.log("'lessons' collection exists but is empty. Inserting data...");
          await lessonsCollection.insertMany(lessonsData);
          console.log(`Inserted ${lessonsData.length} lessons into the 'lessons' collection.`);
        } else {
          console.log("'lessons' collection already populated.");
        }
      }
  
      // Create or ensure 'orders' collection exists
      if (!collectionNames.includes('orders')) {
        console.log("Creating 'orders' collection...");
        await database.createCollection('orders');
        console.log("'orders' collection created.");
      } else {
        console.log("'orders' collection already exists.");
      }
  
    } catch (error) {
      console.error('Error setting up the database:', error);
    } finally {
      await client.close();
      console.log('Database connection closed.');
    }
  };
  
  module.exports = setupLessonManagementDatabase;
