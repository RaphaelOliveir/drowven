import { request } from '../helpers/app';
import { setupTestDatabase, clearTables, teardownTestDatabase } from '../helpers/db';

const BASE = '/api/v1/auth';

beforeAll(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await clearTables();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns 201 with the new user', async () => {
    const res = await request
      .post(`${BASE}/register`)
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: 'Alice',
      email: 'alice@example.com',
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.created_at).toBeDefined();
    expect(res.body.data.updated_at).toBeDefined();
    expect(res.body.data.password_hash).toBeUndefined(); // Should not return password hash
  });

  it('creates a user with areas and returns 201 with the new user including areas', async () => {
    const res = await request
      .post(`${BASE}/register`)
      .send({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'password123',
        areas: ['Engineering', 'Information Technology (IT)']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Bob');
    expect(res.body.data.areas).toBeDefined();
    expect(res.body.data.areas).toHaveLength(2);
    expect(res.body.data.areas).toEqual(
      expect.arrayContaining(['Engineering', 'Information Technology (IT)'])
    );
  });

  it('returns 409 when email is already in use', async () => {
    await request
      .post(`${BASE}/register`)
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    const res = await request
      .post(`${BASE}/register`)
      .send({ name: 'Alice Duplicate', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request
      .post(`${BASE}/register`)
      .send({ name: 'No Password', email: 'nopass@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/password is required/i);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request
      .post(`${BASE}/register`)
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
  });

  it('logs in successfully and returns a token', async () => {
    const res = await request
      .post(`${BASE}/login`)
      .send({ email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('alice@example.com');
  });

  it('returns 401 for invalid password', async () => {
    const res = await request
      .post(`${BASE}/login`)
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request
      .post(`${BASE}/login`)
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns the current user when authenticated', async () => {
    await request
      .post(`${BASE}/register`)
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    const loginRes = await request
      .post(`${BASE}/login`)
      .send({ email: 'alice@example.com', password: 'password123' });

    const token = loginRes.body.data.token;

    const res = await request.get(`${BASE}/me`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('alice@example.com');
  });

  it('returns 401 when missing token', async () => {
    const res = await request.get(`${BASE}/me`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('invalidates the session', async () => {
    await request
      .post(`${BASE}/register`)
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

    const loginRes = await request
      .post(`${BASE}/login`)
      .send({ email: 'alice@example.com', password: 'password123' });

    const token = loginRes.body.data.token;

    const logoutRes = await request.post(`${BASE}/logout`).set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(204);

    // Token should no longer work
    const meRes = await request.get(`${BASE}/me`).set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(401);
  });
});
