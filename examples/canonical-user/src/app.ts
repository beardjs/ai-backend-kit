/**
 * Illustrative only — bootstrap registers controllers from factories.
 */
import { makeUserController } from './configuration/factory/user.controller.factory';

export function registerControllers(): void {
  const userController = makeUserController();
  void userController.getRouter();
}
