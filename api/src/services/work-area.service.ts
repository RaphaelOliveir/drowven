import { query } from '../database/pool';
import { WorkArea } from '../models/work-area.model';

export async function findWorkAreas(areaName?: string): Promise<WorkArea[]> {
  if (areaName) {
    return query<WorkArea>(
      'SELECT id, name, created_at, updated_at FROM work_areas WHERE name ILIKE $1 ORDER BY name ASC',
      [`%${areaName}%`]
    );
  }
  
  return query<WorkArea>(
    'SELECT id, name, created_at, updated_at FROM work_areas ORDER BY name ASC'
  );
}
