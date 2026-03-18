const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Fix for Node 18+ querySrv ECONNREFUSED on some networks
dns.setServers(['8.8.8.8', '8.8.4.4']); // Bypass local router DNS that blocks SRV queries


const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        mongoose.connection.on('connecting', () => console.log('Mongoose is connecting...'));
        mongoose.connection.on('connected', () => console.log('Mongoose connected successfully!'));
        mongoose.connection.on('error', (err) => console.error('Mongoose encountered an error:', err.message));
        mongoose.connection.on('disconnected', () => console.log('Mongoose is disconnected.'));

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000
        });
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
