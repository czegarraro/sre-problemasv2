import { Collection } from 'mongodb';
import { database } from '../config/database';

export interface TribeDocument {
  _id?: string;
  name: string;
  tagValue: string;
  description?: string;
  problemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TribeRepository {
  private get collection(): Collection {
    return database.getCollection('tribes');
  }

  async findAll(): Promise<TribeDocument[]> {
    return await this.collection.find().sort({ name: 1 }).toArray() as unknown as TribeDocument[];
  }

  async findByTagValue(tagValue: string): Promise<TribeDocument | null> {
    return await this.collection.findOne({ tagValue }) as TribeDocument | null;
  }

  async upsertMany(tribes: Partial<TribeDocument>[]): Promise<void> {
    if (tribes.length === 0) return;
    const operations = tribes.map(tribu => ({
      updateOne: {
        filter: { tagValue: tribu.tagValue },
        update: {
          $set: {
            name: tribu.name,
            description: tribu.description,
            updatedAt: new Date()
          },
          $setOnInsert: {
            tagValue: tribu.tagValue, // Unique Index assumed
            createdAt: new Date(),
            problemCount: 0
          }
        },
        upsert: true
      }
    }));
    await this.collection.bulkWrite(operations);
  }

  async updateProblemCounts(counts: Record<string, number>): Promise<void> {
    const operations = Object.entries(counts).map(([tagValue, count]) => ({
      updateOne: {
        filter: { tagValue },
        update: { $set: { problemCount: count } }
      }
    }));
    if (operations.length > 0) {
      await this.collection.bulkWrite(operations);
    }
  }
}
