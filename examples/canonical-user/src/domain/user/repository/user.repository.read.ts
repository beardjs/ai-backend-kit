/**
 * Illustrative only — repository contracts in domain; implementations in infraestructure.
 */
import { IUser } from '../entity/interfaces/user.interface';

export interface IUserRepositoryRead {
  findUserById(id: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
}

export interface IUserRepositoryWrite {
  createUser(user: IUser): Promise<IUser>;
}
