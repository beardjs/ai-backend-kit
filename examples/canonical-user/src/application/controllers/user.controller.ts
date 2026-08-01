/**
 * Illustrative only — thin Express controller; no product rules, no *Model.
 */
import { Request, Response, Router } from 'express';
import { IUserService } from '../../domain/user/service/user.service.interface';

// Stand-ins for shared-package patterns
declare const ErrorCatalog: Record<string, unknown>;
declare function handleTranslatedError(error: unknown, catalog: unknown, res: Response): void;
declare function authorizeByGroup(groups: string[]): (req: Request, res: Response, next: () => void) => void;

export class UserController {
  private readonly router = Router();

  constructor(private readonly userService: IUserService) {
    this.initRoutes();
  }

  public initRoutes(): void {
    this.router.post('/users', authorizeByGroup(['admin']), this.createUser);
    this.router.get('/users/:id', authorizeByGroup(['admin']), this.getUserById);
  }

  private createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const newUser = await this.userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  private getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      handleTranslatedError(error, ErrorCatalog, res);
    }
  };

  public getRouter(): Router {
    return this.router;
  }
}
