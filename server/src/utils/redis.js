const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Setup ioredis connection; BullMQ requires maxRetriesPerRequest to be null
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

connection.on('connect', () => {
  console.log('Connected to Redis for BullMQ');
});

module.exports = connection;
