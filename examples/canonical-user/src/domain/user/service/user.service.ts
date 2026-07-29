/**
 * Illustrative only — business rules (404/409, uniqueness) belong in the service.
 */
import { EErrorCode } from '../../common/errors/enums/EErrorCode';
import { UserServiceEntity } from '../entity/user.entity';
import { IUser } from '../entity/interfaces/user.interface';
import { IUserRepositoryRead } from '../repository/user.repository.read';
import { IUserRepositoryWrite } from '../repository/user.repository.write';
import { IParamsCreateUser, IUserService } from './user.service.interface';

type IThrowedError = {
  status: number;
  errorCode: EErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export class UserService implements IUserService {
  constructor(
    private readonly userRepositoryRead: IUserRepositoryRead,
    private readonly userRepositoryWrite: IUserRepositoryWrite,
  ) {}

  async createUser(params: IParamsCreateUser): Promise<IUser> {
    const existingUser = await this.userRepositoryRead.findUserByEmail(params.email);
    if (existingUser) {
      throw {
        status: 409,
        errorCode: EErrorCode.RESOURCE_CONFLICT,
        message: 'User already exists',
        details: { email: params.email },
      } as IThrowedError;
    }
    const userEntity = new UserServiceEntity(params);
    return this.userRepositoryWrite.createUser(userEntity);
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepositoryRead.findUserById(id);
    if (!user) {
      throw {
        status: 404,
        errorCode: EErrorCode.RESOURCE_NOT_FOUND,
        message: 'User not found',
        details: { id },
      } as IThrowedError;
    }
    return user;
  }
}
