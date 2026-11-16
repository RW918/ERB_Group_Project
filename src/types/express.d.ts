import type { Role, User as Account } from "./domain.js";

declare global {
  namespace Express {
    // Passport attaches the deserialized row; the guard middleware adds its role.
    interface User extends Account {
      role?: Role;
    }
  }
}

export {};
