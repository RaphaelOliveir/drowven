import { Request, Response, NextFunction } from 'express';
import * as workAreaService from '../services/work-area.service';
import { sendSuccess } from '../utils/response';

export async function getWorkAreas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const areaName = req.query.areaName as string | undefined;
    const areas = await workAreaService.findWorkAreas(areaName);
    sendSuccess(res, areas);
  } catch (err) {
    next(err);
  }
}
