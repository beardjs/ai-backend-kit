/**
 * Illustrative only — pure adapters IM* ↔ I*.
 */
import { IUser } from '../../../../domain/user/entity/interfaces/user.interface';
import { IMUser } from '../../../db/mongo/interfaces/user.interface';

export function dbToInternal(doc: IMUser): IUser {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    createdAt: doc.createdAt,
  };
}

export function internalToDb(
  user: IUser,
): Omit<IMUser, '_id' | 'createdAt' | 'updatedAt'> & { createdAt: Date } {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
