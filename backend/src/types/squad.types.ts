import { ObjectId } from "mongodb";

export interface Squad {
  _id?: ObjectId;
  name: string;
  description?: string;
  tagValue: string; // El valor del tag tn-squad (p.e. 'thewhitestripes')
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
  problemCount?: number;
}

export interface CreateSquadDTO {
  name: string;
  tagValue: string;
  description?: string;
}

export interface UpdateSquadDTO {
  name?: string;
  description?: string;
  tagValue?: string;
}
