import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { request } from '../helpers/app';
import { setupTestDatabase, clearTables, teardownTestDatabase } from '../helpers/db';

const BASE = '/api/v1/work-areas';

beforeAll(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await clearTables();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('GET /api/v1/work-areas', () => {
  it('returns all work areas when no query is provided', async () => {
    const res = await request.get(BASE);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('name');
  });

  it('filters work areas by areaName query parameter', async () => {
    const res = await request.get(`${BASE}?areaName=dev`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    
    // "Research & Development (R&D)" should be in the results
    const found = res.body.data.some((area: { name: string }) => area.name.toLowerCase().includes('dev'));
    expect(found).toBe(true);
    
    // "Healthcare" should not be in the results
    const foundOther = res.body.data.some((area: { name: string }) => area.name === 'Healthcare');
    expect(foundOther).toBe(false);
  });
});
