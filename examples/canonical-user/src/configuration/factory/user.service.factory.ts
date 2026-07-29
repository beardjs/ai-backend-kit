/**
 * Illustrative only — composition root for UserService.
 */
import { UserService } from '../../domain/user/service/user.service';
import { UserRepositoryRead } from '../../infraestructure/repository/user/user.repository.read';
import { UserRepositoryWrite } from '../../infraestructure/repository/user/user.repository.write';

export function makeUserService(): UserService {
  return new UserService(new UserRepositoryRead(), new UserRepositoryWrite());
}
