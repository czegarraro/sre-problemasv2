import { Collection, ObjectId } from 'mongodb';
import { database } from '../config/database';
import { Squad, CreateSquadDTO, UpdateSquadDTO } from '../types/squad.types';

export class SquadRepository {
  private collection: Collection;

  constructor() {
    this.collection = database.getCollection('squads');
  }

  async findAll(): Promise<Squad[]> {
    return await this.collection.find().sort({ name: 1 }).toArray() as unknown as Squad[];
  }

  async findById(id: string): Promise<Squad | null> {
    return await this.collection.findOne({ _id: new ObjectId(id) }) as unknown as Squad | null;
  }

  async findByTagValue(tagValue: string): Promise<Squad | null> {
    return await this.collection.findOne({ tagValue }) as unknown as Squad | null;
  }

  async create(data: CreateSquadDTO): Promise<Squad> {
    const now = new Date();
    const squad: any = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(squad);
    return { ...squad, _id: result.insertedId };
  }

  async update(id: string, data: UpdateSquadDTO): Promise<Squad | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...data, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    return result as unknown as Squad | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async upsertMany(squads: CreateSquadDTO[]): Promise<void> {
    const now = new Date();
    const operations = squads.map(squad => ({
      updateOne: {
        filter: { tagValue: squad.tagValue },
        update: { 
          $setOnInsert: { createdAt: now },
          $set: { 
            name: squad.name,
            updatedAt: now,
            lastSyncAt: now
          },
        },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await this.collection.bulkWrite(operations);
    }
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
