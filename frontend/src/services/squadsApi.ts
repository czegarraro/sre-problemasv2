import { apiClient } from '../lib/api/client';

export interface Squad {
  _id: string;
  name: string;
  tagValue: string;
  description?: string;
  problemCount?: number;
}

export const squadsApi = {
  getSquads: async (): Promise<Squad[]> => {
    const response = await apiClient.get<any, any>('/squads');
    return response.data;
  },

  syncSquads: async (): Promise<void> => {
    await apiClient.post('/squads/sync');
  }
};
