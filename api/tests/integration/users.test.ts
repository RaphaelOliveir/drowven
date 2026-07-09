import { request } from '../helpers/app';
import { setupTestDatabase, clearTables, teardownTestDatabase } from '../helpers/db';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE = '/api/v1/users';

async function createUser(name: string, email: string) {
  const res = await request.post(BASE).send({ name, email });
  expect(res.status).toBe(201);
  return res.body.data as {
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await clearTables();
});

afterAll(async () => {
  await teardownTestDatabase();
});

// ─── GET /users ───────────────────────────────────────────────────────────────

describe('GET /api/v1/users', () => {
  it('returns an empty array when no users exist', async () => {
    const res = await request.get(BASE);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: [] });
  });

  it('returns all users ordered by created_at DESC', async () => {
    await createUser('Alice', 'alice@example.com');
    await createUser('Bob', 'bob@example.com');

    const res = await request.get(BASE);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    // Most recently created user comes first
    expect(res.body.data[0].name).toBe('Bob');
    expect(res.body.data[1].name).toBe('Alice');
  });
});

// ─── POST /users ──────────────────────────────────────────────────────────────

describe('POST /api/v1/users', () => {
  it('creates a user and returns 201 with the new user', async () => {
    const res = await request.post(BASE).send({ name: 'Alice', email: 'alice@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: 'Alice',
      email: 'alice@example.com',
    });
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.created_at).toBeDefined();
    expect(res.body.data.updated_at).toBeDefined();
  });

  it('returns 409 when email is already in use', async () => {
    await createUser('Alice', 'alice@example.com');

    const res = await request
      .post(BASE)
      .send({ name: 'Alice Duplicate', email: 'alice@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('returns 500 when required fields are missing (DB constraint)', async () => {
    const res = await request.post(BASE).send({ name: 'No Email' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /users/:id ───────────────────────────────────────────────────────────

describe('GET /api/v1/users/:id', () => {
  it('returns the user by ID', async () => {
    const created = await createUser('Alice', 'alice@example.com');

    const res = await request.get(`${BASE}/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: created.id,
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('returns 404 when user is not found', async () => {
    const res = await request.get(`${BASE}/00000000-0000-0000-0000-000000000000`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });
});

// ─── PATCH /users/:id ─────────────────────────────────────────────────────────

describe('PATCH /api/v1/users/:id', () => {
  it('updates the user name', async () => {
    const created = await createUser('Alice', 'alice@example.com');

    const res = await request.patch(`${BASE}/${created.id}`).send({ name: 'Alice Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Alice Updated');
    expect(res.body.data.email).toBe('alice@example.com');
  });

  it('updates the user email', async () => {
    const created = await createUser('Alice', 'alice@example.com');

    const res = await request
      .patch(`${BASE}/${created.id}`)
      .send({ email: 'alice-new@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('alice-new@example.com');
    expect(res.body.data.name).toBe('Alice');
  });

  it('updates both name and email in one request', async () => {
    const created = await createUser('Alice', 'alice@example.com');

    const res = await request
      .patch(`${BASE}/${created.id}`)
      .send({ name: 'Alicia', email: 'alicia@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: 'Alicia',
      email: 'alicia@example.com',
    });
  });

  it('returns 404 when user is not found', async () => {
    const res = await request
      .patch(`${BASE}/00000000-0000-0000-0000-000000000000`)
      .send({ name: 'Ghost' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 409 when new email is already used by another user', async () => {
    const alice = await createUser('Alice', 'alice@example.com');
    await createUser('Bob', 'bob@example.com');

    const res = await request.patch(`${BASE}/${alice.id}`).send({ email: 'bob@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('returns 400 when body is empty', async () => {
    const created = await createUser('Alice', 'alice@example.com');

    const res = await request.patch(`${BASE}/${created.id}`).send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no fields to update/i);
  });

  it('does not update updated_at when nothing changes (same email allowed)', async () => {
    const created = await createUser('Alice', 'alice@example.com');

    // Patching own email (no conflict with other users)
    const res = await request.patch(`${BASE}/${created.id}`).send({ email: 'alice@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('alice@example.com');
  });
});

// ─── DELETE /users/:id ────────────────────────────────────────────────────────

describe('DELETE /api/v1/users/:id', () => {
  it('deletes the user and returns 204', async () => {
    const created = await createUser('Alice', 'alice@example.com');

    const deleteRes = await request.delete(`${BASE}/${created.id}`);
    expect(deleteRes.status).toBe(204);

    // Confirm the user is gone
    const getRes = await request.get(`${BASE}/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  it('returns 404 when user does not exist', async () => {
    const res = await request.delete(`${BASE}/00000000-0000-0000-0000-000000000000`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('allows creating a user with the same email after deletion', async () => {
    const created = await createUser('Alice', 'alice@example.com');
    await request.delete(`${BASE}/${created.id}`);

    const res = await request.post(BASE).send({ name: 'Alice Reborn', email: 'alice@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Alice Reborn');
  });
});
