import { Request, Response, NextFunction } from 'express';
import { SquadService } from '../services/squad.service';
import { sendSuccess } from '../utils/response.utils';

let squadService: SquadService;
const getSquadService = () => {
  if (!squadService) {
    squadService = new SquadService();
  }
  return squadService;
};

export const getSquads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const squads = await getSquadService().getAllSquads();
    sendSuccess(res, squads);
  } catch (error) {
    next(error);
  }
};

export const syncSquads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getSquadService().syncSquadsFromProblems();
    sendSuccess(res, null, 'Squads synchronized successfully');
  } catch (error) {
    next(error);
  }
};
