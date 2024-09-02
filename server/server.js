const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Route to fetch hiscore data for a player
app.get('/api/hiscore/:username', async (req, res) => {
    const username = req.params.username;
    console.log('server hit');
    try {
      const response = await axios.get(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(username)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:129.0) Gecko/20100101 Firefox/129.0'
        }
      });
      res.send(response.data);
      console.log('updated');
    } catch (error) {
        console.error('test');
      console.error('Error fetching hiscore data:', error.message);
      res.status(500).json({ error: 'Failed to fetch hiscore data' });
    }
  });

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});