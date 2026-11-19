import type { SessionUser } from "../auth/session.js";

declare global {
  namespace Express {
    // Passport attaches the deserialized session user: effective permissions
    // already coalesced (override first, role default otherwise).
    interface User extends SessionUser {}
  }
}

export {};
