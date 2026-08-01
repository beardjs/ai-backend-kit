/**
 * Illustrative only — Mongoose schema shape (not wired to a real connection).
 */
export const userSchemaShape = {
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
};
