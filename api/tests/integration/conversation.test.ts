import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { request } from '../helpers/app';
import { setupTestDatabase, clearTables, teardownTestDatabase } from '../helpers/db';

const BASE = '/api/v1/conversations';
const AUTH_BASE = '/api/v1/auth';

async function createUserAndLogin(name: string, email: string) {
  await request
    .post(`${AUTH_BASE}/register`)
    .send({ name, email, password: 'password123' });

  const loginRes = await request
    .post(`${AUTH_BASE}/login`)
    .send({ email, password: 'password123' });

  return {
    user: loginRes.body.data.user as { id: string; name: string; email: string },
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

describe('Conversations API', () => {
  it('creates and lists conversations', async () => {
    const user1 = await createUserAndLogin('User One', 'user1@example.com');
    const user2 = await createUserAndLogin('User Two', 'user2@example.com');

    const createRes = await request
      .post(BASE)
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ targetUserId: user2.user.id });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data).toHaveProperty('id');
    expect(createRes.body.data.sender_user_id).toBe(user1.user.id);
    expect(createRes.body.data.receiver_user_id).toBe(user2.user.id);

    const listRes = await request
      .get(BASE)
      .set('Authorization', `Bearer ${user1.token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].id).toBe(createRes.body.data.id);
  });

  it('sends and retrieves messages', async () => {
    const user1 = await createUserAndLogin('User One', 'user1@example.com');
    const user2 = await createUserAndLogin('User Two', 'user2@example.com');

    const convRes = await request
      .post(BASE)
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ targetUserId: user2.user.id });

    const conversationId = convRes.body.data.id;

    const messageRes = await request
      .post(`${BASE}/${conversationId}/messages`)
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ content: 'Hello World' });

    expect(messageRes.status).toBe(201);
    expect(messageRes.body.success).toBe(true);
    expect(messageRes.body.data.content).toBe('Hello World');
    expect(messageRes.body.data.sender_id).toBe(user1.user.id);

    const getMessagesRes = await request
      .get(`${BASE}/${conversationId}/messages`)
      .set('Authorization', `Bearer ${user1.token}`);

    expect(getMessagesRes.status).toBe(200);
    expect(getMessagesRes.body.data).toHaveLength(1);
    expect(getMessagesRes.body.data[0].content).toBe('Hello World');

    const getMessagesForbidRes = await request
      .get(`${BASE}/${conversationId}/messages`)
      .set('Authorization', `Bearer ${user2.token}`);

    expect(getMessagesForbidRes.status).toBe(200);
  });

  it('fails if sending messages or accessing messages from an unrelated user', async () => {
    const user1 = await createUserAndLogin('User One', 'user1@example.com');
    const user2 = await createUserAndLogin('User Two', 'user2@example.com');
    const user3 = await createUserAndLogin('User Three', 'user3@example.com');

    const convRes = await request
      .post(BASE)
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ targetUserId: user2.user.id });

    const conversationId = convRes.body.data.id;

    const getMessagesRes = await request
      .get(`${BASE}/${conversationId}/messages`)
      .set('Authorization', `Bearer ${user3.token}`);

    expect(getMessagesRes.status).toBe(403);

    const postMessageRes = await request
      .post(`${BASE}/${conversationId}/messages`)
      .set('Authorization', `Bearer ${user3.token}`)
      .send({ content: 'Spam' });

    expect(postMessageRes.status).toBe(403);
  });
});
