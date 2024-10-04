// config.js
import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    await connect('mongodb+srv://satishchadive:satish12345@cluster0.k3d5m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0p', {});
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
