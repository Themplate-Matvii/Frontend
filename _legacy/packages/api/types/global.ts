/**
 * Standard API envelope used across the app.
 * Backend may omit `message`, so keep it optional.
 * Keep it generic and minimal to avoid over-constraining clients.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null; // optional to match backend behavior
}

/**
 * Optional error envelope if you want to narrow failure shapes in places.
 * Do not enforce globally to avoid breaking axios generics on 4xx passthroughs.
 */
export interface ErrorEnvelope {
  success: false;
  message: string;
  errors?: Record<string, unknown> | null;
}
