import { request } from '../helpers/app';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request.get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', env: 'test' });
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request.get('/api/v1/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });
});
