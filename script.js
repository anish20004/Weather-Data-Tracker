const express = require('express');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;
import mongodb_URI from './url';

const mongoURI = mongodb_URI;
const dbName = 'weatherdb';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('weather', { selectedCity: 'City', weatherData: null });
});

app.post('/getWeather', async (req, res) => {
  try {
    const selectedCity = req.body.city || 'City';

    const url = `https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=${selectedCity}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'ecf7a1e110msha0197a832b464dap1dadcfjsn73368b8aee68',
        'X-RapidAPI-Host': 'weather-by-api-ninjas.p.rapidapi.com',
      },
      };

    const response = await axios.get(url, options);
    const weatherData = response.data;

    // Include the city name in the weather data before inserting it into MongoDB
    weatherData.city = selectedCity;

    const client = new MongoClient(mongoURI, { useNewUrlParser: true });
    await client.connect();

    const db = client.db(dbName);

    const collectionName = 'weatherCollection'; // You can use a consistent collection name for all cities
    const collection = db.collection(collectionName);

    await collection.insertOne(weatherData);

    console.log('Weather data stored in MongoDB Atlas.');

    client.close();

    res.render('weather', { weatherData, selectedCity });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.use(express.static('public'));
