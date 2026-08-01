/**
 * Illustrative write contract (often co-located or split as *.repository.write.ts).
 */
import { IUser } from '../entity/interfaces/user.interface';

export interface IUserRepositoryWrite {
  createUser(user: IUser): Promise<IUser>;
}
