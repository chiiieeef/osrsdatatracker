const express = require('express');
const axios = require('axios');
const path = require('path');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());

// MongoDB connection setup
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'osrs';
let db;


MongoClient.connect(url)
    .then(client => {
        db = client.db(dbName);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit if connection fails
    });


// Route to fetch hiscore data for a player
app.get('/api/hiscore/:username', async (req, res) => {
    const username = req.params.username;
    try {
      const response = await axios.get(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(username)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:129.0) Gecko/20100101 Firefox/129.0'
        }
      });
      res.send(response.data);
    } catch (error) {
      console.error('Error fetching hiscore data:', error.message);
      res.status(500).json({ error: 'Failed to fetch hiscore data' });
    }
  });


// POST route to save hiscore data grouped by username
app.post('/api/hiscore', async (req, res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database connection not established' });
    }

    const { username } = req.body;
    const hiscoreData = req.body;
    const timestamp = new Date().toISOString().split('.')[0];
    const snapshot = { ...hiscoreData, timestamp };

    try {
        const collection = db.collection('hiscores');

        // Check if a document for this username already exists
        const userDocument = await collection.findOne({ username });

        if (userDocument) {
            // If the document exists, update it by adding the new snapshot
            await collection.updateOne(
                { username },
                { $push: { snapshots: snapshot } }
            );
        } else {
            // If the document does not exist, create a new document
            await collection.insertOne({
                username,
                snapshots: [snapshot],
            });
        }

        res.status(201).json({ message: 'Hiscore data saved successfully' });
    } catch (error) {
        console.error('Error saving hiscore data:', error);
        res.status(500).json({ error: 'Failed to save hiscore data' });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});