require('dotenv').config();
const mongoose = require('mongoose');
const Experience = require('./models/Experience');
const Promo = require('./models/Promo');

// You should ensure this points to your actual database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/experiences-db';

const experiencesData = [
  {
    name: 'Kayaking',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
    imageUrl: 'kayaking.png',
    price: '899',
    location: 'Udupi',
    // Assuming default slots for simplicity, adjust as needed
    slots: [
      { startTime: '07:00', endTime: '8:00', capacity: 15, availableSeats: 15 },
      { startTime: '09:00', endTime: '10:00', capacity: 15, availableSeats: 15 },
      { startTime: '11:00', endTime: '12:00', capacity: 15, availableSeats: 15 },
      { startTime: '13:00', endTime: '14:00', capacity: 15, availableSeats: 15 },
    ]
  },
  {
    name: 'Nandi Hills Sunrise',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
    imageUrl: 'nandihill.png',
    price: '899',
    location: 'Bangalore',
    slots: [
      { startTime: '07:00', endTime: '8:00', capacity: 15, availableSeats: 15 },
      { startTime: '09:00', endTime: '10:00', capacity: 15, availableSeats: 15 },
      { startTime: '11:00', endTime: '12:00', capacity: 15, availableSeats: 15 },
      { startTime: '13:00', endTime: '14:00', capacity: 15, availableSeats: 15 },
    ]
  },
  {
    name: 'Coffee Trail',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
    imageUrl: 'coffeetrail.png',
    price: '1299',
    location: 'Coorg',
    slots: [
      { startTime: '07:00', endTime: '8:00', capacity: 15, availableSeats: 15 },
      { startTime: '09:00', endTime: '10:00', capacity: 15, availableSeats: 15 },
      { startTime: '11:00', endTime: '12:00', capacity: 15, availableSeats: 15 },
      { startTime: '13:00', endTime: '14:00', capacity: 15, availableSeats: 15 }
    ]
  },
  {
    name: 'Kayaking',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
    imageUrl: 'kayaking2.png',
    price: '999',
    location: 'Udupi, Karnataka',
    slots: [
      { startTime: '07:00', endTime: '8:00', capacity: 15, availableSeats: 15 },
      { startTime: '09:00', endTime: '10:00', capacity: 15, availableSeats: 15 },
      { startTime: '11:00', endTime: '12:00', capacity: 15, availableSeats: 15 },
      { startTime: '13:00', endTime: '14:00', capacity: 15, availableSeats: 15 },
    ]
  },
  {
    name: 'Nandi Hills Sunrise',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
    imageUrl: 'nandihill.png',
    price: '899',
    location: 'Bangalore',
    slots: [
      { startTime: '07:00', endTime: '8:00', capacity: 15, availableSeats: 15 },
      { startTime: '09:00', endTime: '10:00', capacity: 15, availableSeats: 15 },
      { startTime: '11:00', endTime: '12:00', capacity: 15, availableSeats: 15 },
      { startTime: '13:00', endTime: '14:00', capacity: 15, availableSeats: 15 },
    ]
  },
  {
    name: 'Boat Cruise',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
    imageUrl: 'boat.png',
    price: '999',
    location: 'Sunderban',
    slots: [
      { startTime: '07:00', endTime: '8:00', capacity: 15, availableSeats: 15 },
      { startTime: '09:00', endTime: '10:00', capacity: 15, availableSeats: 15 },
      { startTime: '11:00', endTime: '12:00', capacity: 15, availableSeats: 15 },
      { startTime: '13:00', endTime: '14:00', capacity: 15, availableSeats: 15 },
    ]
  },
  {
    name: 'Bunjee Jumping',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
    imageUrl: 'bungee.png',
    price: '999',
    location: 'Manali',
    slots: [
      { startTime: '07:00', endTime: '8:00', capacity: 15, availableSeats: 15 },
      { startTime: '09:00', endTime: '10:00', capacity: 15, availableSeats: 15 },
      { startTime: '11:00', endTime: '12:00', capacity: 15, availableSeats: 15 },
      { startTime: '13:00', endTime: '14:00', capacity: 15, availableSeats: 15 },
    ]
  },
  {
    name: 'Coffee Trail',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
    imageUrl: 'coffeetrail.png',
    price: '1299',
    location: 'Coorg',
    slots: [
      { startTime: '07:00', endTime: '8:00', capacity: 15, availableSeats: 15 },
      { startTime: '09:00', endTime: '10:00', capacity: 15, availableSeats: 15 },
      { startTime: '11:00', endTime: '12:00', capacity: 15, availableSeats: 15 },
      { startTime: '13:00', endTime: '14:00', capacity: 15, availableSeats: 15 },
    ]
  },
];

const promoData = [
  { code: 'SAVE10', type: 'percentage', value: 10, active: true },
  { code: 'FLAT100', type: 'flat', value: 100, active: true },
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);

    // Clear existing data
    console.log('Clearing existing data...');
    await Experience.deleteMany({});
    await Promo.deleteMany({});

    // Seed Experiences in one go
    console.log('Seeding experiences...');
    const createdExperiences = await Experience.insertMany(experiencesData);
    console.log(`✅ Successfully seeded ${createdExperiences.length} experiences.`);

    // Seed Promos in one go
    console.log('Seeding promos...');
    const createdPromos = await Promo.insertMany(promoData);
    console.log(`✅ Successfully seeded ${createdPromos.length} promos.`);

    console.log('Seeding complete!');
    // Log the ID of the first created experience as an example
    if (createdExperiences.length > 0) {
        console.log('Example Experience id:', createdExperiences[0]._id.toString());
    }
  } catch (err) {
    console.error('An error occurred during seeding:', err);
    process.exit(1);
  } finally {
    console.log('Disconnecting from database...');
    mongoose.disconnect();
  }
}

seed();