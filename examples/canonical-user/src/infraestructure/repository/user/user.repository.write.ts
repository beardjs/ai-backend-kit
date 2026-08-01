/**
 * Illustrative only — CRUD + adapter; no uniqueness checks here.
 */
import { EErrorCode } from '../../../../domain/common/errors/enums/EErrorCode';
import { IUser } from '../../../../domain/user/entity/interfaces/user.interface';
import { IUserRepositoryWrite } from '../../../../domain/user/repository/user.repository.write';
import { UserModel } from '../../../db/mongo/models/user.model';
import { dbToInternal, internalToDb } from './adapters/user.adapter';

type IThrowedError = { status: number; errorCode: EErrorCode };

export class UserRepositoryWrite implements IUserRepositoryWrite {
  async createUser(user: IUser): Promise<IUser> {
    try {
      const created = await UserModel.create(internalToDb(user) as never);
      return dbToInternal(created);
    } catch {
      throw { status: 500, errorCode: EErrorCode.DATABASE_ERROR } as IThrowedError;
    }
  }
}
