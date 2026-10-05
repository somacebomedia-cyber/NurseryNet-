// src/ai/auth.ts
/**
 * @fileOverview Authentication types and helpers for Genkit flows and AI services.
 */

export interface UserAuthContext {
  uid: string;
  email?: string;
  role?: string;
  email_verified?: boolean;
  [key: string]: any;
}

export function isAuthenticated(auth: any): boolean {
  return Boolean(auth && (auth.uid || auth.id));
}

export function hasRole(auth: any, role: string): boolean {
  return auth?.role === role || auth?.token?.role === role;
}
