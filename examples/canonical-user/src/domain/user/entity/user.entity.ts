/**
 * Illustrative only — local invariants live in the entity; uniqueness lives in the service.
 */
import { IUser } from './interfaces/user.interface';

export class UserServiceEntity implements IUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;

  constructor(params: Omit<IUser, 'id' | 'createdAt'> & Partial<Pick<IUser, 'id' | 'createdAt'>>) {
    this.validateUser(params);
    this.id = params.id ?? crypto.randomUUID();
    this.name = params.name;
    this.email = params.email;
    this.createdAt = params.createdAt ?? new Date();
  }

  private validateUser(params: { name?: string; email?: string }): void {
    if (!params.name?.trim()) {
      throw new Error('name is required');
    }
    if (!params.email?.includes('@')) {
      throw new Error('email is invalid');
    }
  }
}
