import supertest from 'supertest';

function buildApp(globalMax: number, authMax: number) {
  process.env.RATE_LIMIT_MAX = String(globalMax);
  process.env.AUTH_RATE_LIMIT_MAX = String(authMax);
  process.env.RATE_LIMIT_WINDOW_MS = '60000';

  const { createApp } = jest.requireActual<{ createApp: () => import('express').Application }>('../../src/app');
  return supertest(createApp());
}

describe('Global rate limiter', () => {
  it('returns 429 after exceeding the global limit', async () => {
    const agent = buildApp(2, 100);

    await agent.get('/health');
    await agent.get('/health');
    const res = await agent.get('/health');

    expect(res.status).toBe(429);
  });
});

describe('Auth rate limiter', () => {
  it('returns 429 after exceeding the auth limit on /auth/login', async () => {
    const agent = buildApp(1000, 2);

    await agent.post('/api/v1/auth/login').send({ email: 'x@x.com', password: 'x' });
    await agent.post('/api/v1/auth/login').send({ email: 'x@x.com', password: 'x' });
    const res = await agent.post('/api/v1/auth/login').send({ email: 'x@x.com', password: 'x' });

    expect(res.status).toBe(429);
  });

  it('returns 429 after exceeding the auth limit on /auth/register', async () => {
    const agent = buildApp(1000, 2);

    await agent.post('/api/v1/auth/register').send({});
    await agent.post('/api/v1/auth/register').send({});
    const res = await agent.post('/api/v1/auth/register').send({});

    expect(res.status).toBe(429);
  });
});
