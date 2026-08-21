// Shared form-action result shapes. Kept OUT of the "use server" action files
// because those files may only export async functions — not types/consts.

export interface LoginState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface PasswordResetRequestState {
  ok?: boolean;
  error?: "invalid_email" | "not_admin" | "failed" | "misconfigured";
}

export interface ActionState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface PublicFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}
