/**
 * Illustrative only — controller factory.
 */
import { UserController } from '../../application/controllers/user.controller';
import { makeUserService } from './user.service.factory';

export function makeUserController(): UserController {
  return new UserController(makeUserService());
}
