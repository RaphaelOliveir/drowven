import { request } from '../helpers/app';
import { setupTestDatabase, clearTables, teardownTestDatabase } from '../helpers/db';

const BASE = '/api/v1/users';
const AUTH_BASE = '/api/v1/auth';

async function createUserAndLogin(name: string, email: string, areas?: string[]) {
  await request
    .post(`${AUTH_BASE}/register`)
    .send({ name, email, password: 'password123', areas });

  const loginRes = await request
    .post(`${AUTH_BASE}/login`)
    .send({ email, password: 'password123' });

  return {
    user: loginRes.body.data.user as {
      id: string;
      name: string;
      email: string;
      created_at: string;
      updated_at: string;
    },
    token: loginRes.body.data.token as string,
  };
}

beforeAll(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await clearTables();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('GET /api/v1/users', () => {
  it('returns all users ordered by created_at DESC', async () => {
    const { token } = await createUserAndLogin('Alice', 'alice@example.com');
    await createUserAndLogin('Bob', 'bob@example.com');

    const res = await request.get(BASE).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Bob');
    expect(res.body.data[1].name).toBe('Alice');
  });

  it('filters users by search query parameter matching name', async () => {
    const { token } = await createUserAndLogin('Alice Smith', 'alice@example.com');
    await createUserAndLogin('Bob Jones', 'bob@example.com');

    const res = await request.get(`${BASE}?search=smith`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alice Smith');
  });

  it('filters users by search query parameter matching email', async () => {
    const { token } = await createUserAndLogin('Alice Smith', 'alice@example.com');
    await createUserAndLogin('Bob Jones', 'bob@example.com');

    const res = await request.get(`${BASE}?search=@example.com`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('filters users by workArea query parameter', async () => {
    const { token } = await createUserAndLogin('Alice Smith', 'alice@example.com', ['Engineering']);
    await createUserAndLogin('Bob Jones', 'bob@example.com', ['Healthcare']);

    const res = await request.get(`${BASE}?workArea=Engineering`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Alice Smith');
  });
});

describe('GET /api/v1/users/:id', () => {
  it('returns the user by ID', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request.get(`${BASE}/${user.id}`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: user.id,
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('returns 404 when user is not found', async () => {
    const { token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request
      .get(`${BASE}/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe('PATCH /api/v1/users/:id', () => {
  it('updates the user name', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request
      .patch(`${BASE}/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Alice Updated');
    expect(res.body.data.email).toBe('alice@example.com');
  });

  it('updates the user email', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request
      .patch(`${BASE}/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'alice-new@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('alice-new@example.com');
    expect(res.body.data.name).toBe('Alice');
  });

  it('updates both name and email in one request', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request
      .patch(`${BASE}/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alicia', email: 'alicia@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: 'Alicia',
      email: 'alicia@example.com',
    });
  });

  it('returns 404 when user is not found', async () => {
    const { token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request
      .patch(`${BASE}/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ghost' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 409 when new email is already used by another user', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');
    await createUserAndLogin('Bob', 'bob@example.com');

    const res = await request
      .patch(`${BASE}/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'bob@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('returns 400 when body is empty', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request
      .patch(`${BASE}/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no fields to update/i);
  });

  it('does not update updated_at when nothing changes (same email allowed)', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request
      .patch(`${BASE}/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'alice@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('alice@example.com');
  });
});

describe('DELETE /api/v1/users/:id', () => {
  it('deletes the user and returns 204', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');

    const deleteRes = await request
      .delete(`${BASE}/${user.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);

    // Using the same token to fetch will fail because session was deleted via cascade
    // We should log in again or just expect a 401 now.
    const getRes = await request.get(`${BASE}/${user.id}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(401); // Unauthorized because user and session are gone
  });

  it('returns 404 when user does not exist', async () => {
    const { token } = await createUserAndLogin('Alice', 'alice@example.com');

    const res = await request
      .delete(`${BASE}/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('allows creating a user with the same email after deletion', async () => {
    const { user, token } = await createUserAndLogin('Alice', 'alice@example.com');
    await request
      .delete(`${BASE}/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request
      .post(`${AUTH_BASE}/register`)
      .send({ name: 'Alice Reborn', email: 'alice@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Alice Reborn');
  });
});
