import mongoose from 'mongoose';
import request from 'supertest';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config({ path: '.env.test' });

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  app = (await import('../server.js')).default;
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany();
});

describe('Auth: Registration', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ firstName: 'Test', secondName: 'User', email: 'test@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/verify your email/i);
  });

  it('rejects duplicate email', async () => {
    await User.create({ firstName: 'Test', secondName: 'User', email: 'test@example.com', password: 'Password1' });
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ firstName: 'Test', secondName: 'User', email: 'test@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects insecure password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ firstName: 'Test', secondName: 'User', email: 'test2@example.com', password: 'short' });
    expect(res.statusCode).toBe(400);
    const errorMsg =
      res.body.message || (res.body.errors && res.body.errors.map(e => e.msg).join(' '));
    expect(errorMsg).toMatch(/password/i);
  });
});

describe('Auth: Login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ firstName: 'Test', secondName: 'User', email: 'login@example.com', password: 'Password1' });
    await User.updateOne({ email: 'login@example.com' }, { isEmailVerified: true });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/incorrect/i);
  });

  it('rejects unverified email', async () => {
    await User.updateOne({ email: 'login@example.com' }, { isEmailVerified: false });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/verify your email/i);
  });
});
