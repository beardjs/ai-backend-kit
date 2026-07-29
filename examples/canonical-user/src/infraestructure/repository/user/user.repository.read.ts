/**
 * Illustrative only — return null when missing; never throw product 404/409.
 */
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IUser } from '../../../../domain/user/entity/interfaces/user.interface';
import { IUserRepositoryRead } from '../../../../domain/user/repository/user.repository.read';
import { UserModel } from '../../../db/mongo/models/user.model';
import { dbToInternal } from './adapters/user.adapter';

type IThrowedError = { status: number; errorCode: EErrorCode };

export class UserRepositoryRead implements IUserRepositoryRead {
  async findUserById(id: string): Promise<IUser | null> {
    try {
      const doc = await UserModel.findOne({ id } as never);
      return doc ? dbToInternal(doc) : null;
    } catch {
      throw { status: 500, errorCode: EErrorCode.DATABASE_ERROR } as IThrowedError;
    }
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      const doc = await UserModel.findOne({ email } as never);
      return doc ? dbToInternal(doc) : null;
    } catch {
      throw { status: 500, errorCode: EErrorCode.DATABASE_ERROR } as IThrowedError;
    }
  }
}
