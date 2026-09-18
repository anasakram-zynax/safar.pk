export type AuthRole = "CUSTOMER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  firstName?: string;
  lastName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
export interface LoginData {
  accessToken: string;
  user: AuthUser;
}
export interface RegisterData {
  user: AuthUser & { firstName: string; lastName: string; createdAt: string };
}
export interface MeData {
  message: string;
  data: { sub: string; email: string; role: AuthRole };
}
