const { Queue } = require('bullmq');
const redisConnection = require('../utils/redis');

// Instantiate the chat queue
const chatQueue = new Queue('ChatQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Default to 3 attempts
    backoff: {
      type: 'exponential',
      delay: 1000 // Start with 1s delay
    },
    removeOnComplete: true, // Keep it clean
    removeOnFail: false, // Useful for debugging failed jobs
  }
});

module.exports = chatQueue;
