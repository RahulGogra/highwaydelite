require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const experiencesRoutes = require('./routes/experiences');
const bookingsRoutes = require('./routes/bookings');
const promoRoutes = require('./routes/promo');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cors({
  "origin": "*",
}));
app.use(morgan('dev'));

app.use('/api/experiences', experiencesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/promo', promoRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/experiences-db';

mongoose.connect(MONGO_URI, { })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
