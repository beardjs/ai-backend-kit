/**
 * Illustrative only — IM* lives in infraestructure, never in domain.
 */
import { IUser } from '../../../../domain/user/entity/interfaces/user.interface';

export interface IMUser extends IUser {
  _id: string;
  updatedAt: Date;
}
