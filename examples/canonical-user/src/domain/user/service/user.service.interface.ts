/**
 * Illustrative only — service interface next to the service (AGENTS.md §5).
 */
import { IUser } from '../entity/interfaces/user.interface';

export interface IUserService {
  createUser(params: { name: string; email: string }): Promise<IUser>;
  getUserById(id: string): Promise<IUser>;
}

export interface IParamsCreateUser {
  name: string;
  email: string;
}
