/**
 * Illustrative only — not a runnable module.
 * Pattern: I* domain interface for the user aggregate.
 */
export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
