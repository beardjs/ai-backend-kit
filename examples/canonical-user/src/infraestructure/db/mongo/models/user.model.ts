/**
 * Illustrative only — concrete model placeholder for skills/rules links.
 */
import { IMUser } from '../interfaces/user.interface';

/** Stand-in for mongoose model<IMUser>('User', schema) */
export type UserModel = {
  findOne(filter: Partial<IMUser>): Promise<IMUser | null>;
  create(doc: Omit<IMUser, '_id'>): Promise<IMUser>;
};

export declare const UserModel: UserModel;
