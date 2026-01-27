import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database';
import logger from '../utils/logger';

export class AuthService {
  private get collection() {
    return getDatabase().collection('users');
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = await this.collection.findOne({ email });

    if (!user) {
      // Return generic error for security
      throw new Error('Invalid credentials');
    }

    // Verify password
    // @ts-ignore
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        // @ts-ignore
        role: user.role || 'user'
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    // Update last login
    await this.collection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        // @ts-ignore
        name: user.name,
        // @ts-ignore
        role: user.role
      }
    };
  }

  /**
   * Register new user (for seeding/admin)
   */
  async register(data: any): Promise<any> {
    const existing = await this.collection.findOne({ email: data.email });
    if (existing) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const result = await this.collection.insertOne({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { id: result.insertedId, ...data };
  }
}
