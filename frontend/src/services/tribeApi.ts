import { apiClient } from '../lib/api/client';

export interface Tribe {
  _id?: string;
  name: string;
  tagValue: string;
  problemCount?: number;
}

export const tribeApi = {
  getTribes: async (): Promise<Tribe[]> => {
    try {
      const response = await apiClient.get<any, any>('/tribes');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tribes:', error);
      return [];
    }
  },
};
