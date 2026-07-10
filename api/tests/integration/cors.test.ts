import { request } from '../helpers/app';

describe('CORS headers', () => {
  it('allows requests from a permitted origin', async () => {
    const res = await request
      .get('/health')
      .set('Origin', 'http://localhost:3001');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
  });

  it('does not set allow-origin for non-permitted origins', async () => {
    const res = await request
      .get('/health')
      .set('Origin', 'http://evil.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('responds to preflight OPTIONS with correct CORS headers', async () => {
    const res = await request
      .options('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
    expect(res.headers['access-control-allow-methods']).toBeDefined();
  });
});
