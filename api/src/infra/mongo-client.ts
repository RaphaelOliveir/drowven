import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || '';

export async function connectMongo() {
  if (!uri) throw new Error('MONGODB_URI not defined!');

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  await mongoose.connect(uri);
  await mongoose.connection.db?.command({ ping: 1 });
  return mongoose.connection;
}

export async function closeMongo() {
  await mongoose.disconnect();
}
