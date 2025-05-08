import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, afterEach } from '@jest/globals';
import dotenv from 'dotenv';
dotenv.config(); // Carga las variables de entorno desde el archivo .env

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = `mongodb://tst_${process.env.DB_USER}:${process.env.DB_PASS}t@${process.env.DB_HOST}03TST:${process.env.DB_PORT}/tst_${process.env.DB_NAME}?${process.env.DB_AUTH}`;
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});