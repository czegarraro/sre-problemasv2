import { Request, Response, NextFunction } from 'express';
import { TribeService } from '../services/tribe.service';
import { sendSuccess } from '../utils/response.utils';

let tribeService: TribeService;
const getTribeService = () => {
  if (!tribeService) {
    tribeService = new TribeService();
  }
  return tribeService;
};

export const getTribes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tribes = await getTribeService().getAllTribes();
    sendSuccess(res, tribes);
  } catch (error) {
    next(error);
  }
};

export const syncTribes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await getTribeService().syncTribesFromProblems();
    sendSuccess(res, { count }, `Tribes synchronized successfully`);
  } catch (error) {
    next(error);
  }
};
